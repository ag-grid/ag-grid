import type { GridApi, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ScrollApiModule, TextFilterModule } from 'ag-grid-community';
import {
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../../columnToolPanel/deferredPivotModeFakeServer';
import { getColumnOrder } from '../../columns/column-test-utils';
import { GridRows, TestGridsManager, waitForEvent } from '../../test-utils';
import { asyncSetTimeout } from '../../test-utils/node-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * Characterization tests pinning the CURRENT behaviour of two Server-Side Row Model pivot-mode cells
 * that the sibling `ssrm-pivot-operations.test.ts` deliberately does NOT cover:
 *
 *  - SERVER-SIDE sort WITHOUT `serverSideEnableClientSideSort` (contrast to that file's client-side
 *    case): applying a sort must round-trip to the server (request count increases) carrying the
 *    sortModel AND the pivot flags, and the group rows re-render in the new order.
 *  - Expand/collapse of an expandable pivot row group WITH `purgeClosedRowNodes: true`: children are
 *    purged on collapse and re-fetched from the server on re-expand.
 *
 * Golden-master: whatever the grid does today is the baseline (bugs included). Assertions pin what the
 * grid DOES, not what it "should" do.
 */

interface RecordedRequest {
    pivotMode: boolean;
    pivotCols: string[];
    valueCols: string[];
    rowGroupCols: string[];
    groupKeys: string[];
    sortModel: { colId: string; sort: string }[];
}

// Thin recorder around the shared Olympic pivot/agg fake server: captures the request stream so we can
// assert the sortModel and pivot flags carried on each re-request.
function createRecordingServer(allData: any[]) {
    const server = createFakeServer(allData);
    const requests: RecordedRequest[] = [];

    const recording = {
        getData: (request: IServerSideGetRowsRequest) => {
            requests.push({
                pivotMode: !!request.pivotMode,
                pivotCols: (request.pivotCols ?? []).map((col) => col.id),
                valueCols: (request.valueCols ?? []).map((col) => col.id),
                rowGroupCols: (request.rowGroupCols ?? []).map((col) => col.id),
                groupKeys: [...(request.groupKeys ?? [])],
                sortModel: (request.sortModel ?? []).map((s) => ({ colId: s.colId, sort: s.sort })),
            });
            return server.getData(request);
        },
    };

    return {
        datasource: createServerSideDatasource(recording),
        requests,
    };
}

// Two countries x two years: pivot result columns are 2000_gold and 2004_gold. Russia's 2004 gold (4)
// outranks USA's 2004 gold (2), while the default group order (count desc, then key asc) is Russia, USA
// — so an ascending sort on 2004_gold flips the order to USA, Russia.
const SORT_DATA = [
    { athlete: 'a1', country: 'USA', year: 2000, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
    { athlete: 'a2', country: 'USA', year: 2004, sport: 'Swimming', gold: 2, silver: 0, bronze: 0, total: 2 },
    { athlete: 'a3', country: 'Russia', year: 2000, sport: 'Swimming', gold: 3, silver: 0, bronze: 0, total: 3 },
    { athlete: 'a4', country: 'Russia', year: 2004, sport: 'Swimming', gold: 4, silver: 0, bronze: 0, total: 4 },
];

// Two row-group levels (country, sport) so country groups are expandable (non-leaf); pivot on year.
// USA has three athletes across two sports; Russia one — so USA sorts first (count desc).
const EXPAND_DATA = [
    { athlete: 'b1', country: 'USA', year: 2000, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
    { athlete: 'b2', country: 'USA', year: 2004, sport: 'Swimming', gold: 2, silver: 0, bronze: 0, total: 2 },
    { athlete: 'b3', country: 'USA', year: 2000, sport: 'Athletics', gold: 5, silver: 0, bronze: 0, total: 5 },
    { athlete: 'b4', country: 'Russia', year: 2000, sport: 'Swimming', gold: 4, silver: 0, bronze: 0, total: 4 },
];

const pivotCols = (api: GridApi) => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));

describe('SSRM pivot-mode sort and expand/collapse (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            ScrollApiModule,
            TextFilterModule,
        ],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('1. server-side sort in pivot mode (no serverSideEnableClientSideSort) — fresh request carries sortModel + pivot flags and rows re-render', async () => {
        const { datasource, requests } = createRecordingServer(SORT_DATA);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        const requestsBeforeSort = requests.length;

        // Sort ascending by a generated pivot value column. Without serverSideEnableClientSideSort this
        // must round-trip to the server rather than sorting in place on the client.
        api.applyColumnState({ state: [{ colId: '2004_gold', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        // Distinguishing behaviour vs the client-side case: a NEW server request is issued.
        expect(requests.length).toBeGreaterThan(requestsBeforeSort);
        const sortRequest = requests[requests.length - 1];
        // The re-request carries the sortModel...
        expect(sortRequest.sortModel).toEqual([{ colId: '2004_gold', sort: 'asc' }]);
        // ...AND still carries the pivot metadata.
        expect(sortRequest.pivotMode).toBe(true);
        expect(sortRequest.pivotCols).toEqual(['year']);
        expect(sortRequest.valueCols).toEqual(['gold']);
        expect(sortRequest.rowGroupCols).toEqual(['country']);
        // Pivot result columns are unaffected by the sort.
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);

        // Groups re-render in the server-sorted order (ascending by 2004_gold => USA(2), Russia(4)).
        await new GridRows(api, '1. server-side sort on pivot value column').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
            └── GROUP-leafGroup collapsed id:3 ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
        `);
    });

    test('2. expand/collapse an expandable pivot group with purgeClosedRowNodes — children purged on collapse and re-fetched on re-expand', async () => {
        const { datasource, requests } = createRecordingServer(EXPAND_DATA);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            purgeClosedRowNodes: true,
            serverSideDatasource: datasource,
            getRowId: ({ data, level, parentKeys }) => {
                const key = level === 0 ? data.country : data.sport;
                return [...(parentKeys ?? []), key].join('-');
            },
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Two-level pivot groups: country groups are expandable (non-leaf); sport groups are leaf groups.
        await new GridRows(api, '2a. collapsed root groups').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:6 2004_gold:2
            └── GROUP collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:4 2004_gold:0
        `);

        // Expand USA — a fresh request scoped to the USA group route loads its sport leaf groups.
        const beforeExpand = requests.length;
        api.getRowNode('USA')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        expect(requests.length).toBeGreaterThan(beforeExpand);
        const expandRequest = requests[requests.length - 1];
        expect(expandRequest.pivotMode).toBe(true);
        expect(expandRequest.groupKeys).toEqual(['USA']);
        expect(expandRequest.rowGroupCols).toEqual(['country', 'sport']);
        expect(expandRequest.pivotCols).toEqual(['year']);

        await new GridRows(api, '2b. USA expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:USA ag-Grid-AutoColumn:"USA" 2000_gold:6 2004_gold:2
            │ ├── GROUP-leafGroup collapsed id:USA-Athletics ag-Grid-AutoColumn:"Athletics" 2000_gold:5 2004_gold:0
            │ └── GROUP-leafGroup collapsed id:USA-Swimming ag-Grid-AutoColumn:"Swimming" 2000_gold:1 2004_gold:2
            └── GROUP collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:4 2004_gold:0
        `);

        // Collapse USA. With purgeClosedRowNodes the loaded children are discarded...
        api.getRowNode('USA')!.setExpanded(false);
        await asyncSetTimeout(50);
        expect(!!api.getRowNode('USA-Swimming')).toBe(false);
        expect(!!api.getRowNode('USA-Athletics')).toBe(false);

        // ...so re-expanding must issue ANOTHER fresh server request to reload them.
        const beforeReExpand = requests.length;
        api.getRowNode('USA')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        expect(requests.length).toBeGreaterThan(beforeReExpand);
        const reExpandRequest = requests[requests.length - 1];
        expect(reExpandRequest.pivotMode).toBe(true);
        expect(reExpandRequest.groupKeys).toEqual(['USA']);

        await new GridRows(api, '2c. USA re-expanded after purge').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:USA ag-Grid-AutoColumn:"USA" 2000_gold:6 2004_gold:2
            │ ├── GROUP-leafGroup collapsed id:USA-Athletics ag-Grid-AutoColumn:"Athletics" 2000_gold:5 2004_gold:0
            │ └── GROUP-leafGroup collapsed id:USA-Swimming ag-Grid-AutoColumn:"Swimming" 2000_gold:1 2004_gold:2
            └── GROUP collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:4 2004_gold:0
        `);
    });
});
