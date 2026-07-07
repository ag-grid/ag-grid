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
import { countLoadingRows, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';

/**
 * Characterization tests pinning the CURRENT behaviour of Server-Side Row Model operations while
 * `pivotMode: true` is enabled: initial load, block eviction (maxBlocksInCache), client-side sort
 * (serverSideEnableClientSideSort), filtering, refreshServerSide, and datasource failure.
 *
 * These are golden-master tests: whatever the grid does today is treated as the expected baseline
 * (including any latent bugs). Each case asserts something PIVOT-SPECIFIC — that a re-request still
 * carries pivotMode/pivotCols/valueCols, or that generated pivot result columns regenerate — rather
 * than re-verifying flat/grouped SSRM behaviour already covered in sibling files. Where a pivot
 * operation turns out to behave identically to the non-pivot baseline, that is pinned explicitly.
 */

interface RecordedRequest {
    pivotMode: boolean;
    pivotCols: string[];
    valueCols: string[];
    groupKeys: string[];
    range: [number | undefined, number | undefined];
    filterModel: any;
}

// Thin recorder around the shared Olympic pivot/agg fake server: captures the request stream so we
// can assert the pivot flags carried on each re-request, and can be told to fail the next call.
function createRecordingServer(allData: any[]) {
    const server = createFakeServer(allData);
    const requests: RecordedRequest[] = [];
    let failNext = false;

    const recording = {
        getData: (request: IServerSideGetRowsRequest) => {
            requests.push({
                pivotMode: !!request.pivotMode,
                pivotCols: (request.pivotCols ?? []).map((col) => col.id),
                valueCols: (request.valueCols ?? []).map((col) => col.id),
                groupKeys: [...(request.groupKeys ?? [])],
                range: [request.startRow, request.endRow],
                filterModel: request.filterModel,
            });
            if (failNext) {
                failNext = false;
                return { success: false, rows: [], lastRow: 0 };
            }
            return server.getData(request);
        },
    };

    return {
        datasource: createServerSideDatasource(recording),
        requests,
        failOnce: () => {
            failNext = true;
        },
    };
}

// Two countries x two years: pivot result columns are 2000_gold and 2004_gold.
const SMALL_DATA = [
    { athlete: 'a1', country: 'USA', year: 2000, gold: 1, silver: 0, bronze: 0, total: 1 },
    { athlete: 'a2', country: 'USA', year: 2004, gold: 2, silver: 0, bronze: 0, total: 2 },
    { athlete: 'a3', country: 'Russia', year: 2000, gold: 3, silver: 0, bronze: 0, total: 3 },
    { athlete: 'a4', country: 'Russia', year: 2004, gold: 4, silver: 0, bronze: 0, total: 4 },
];

// Many countries (each with two years) so the root group store virtualises across several blocks
// and maxBlocksInCache can evict. Country ids are zero-padded so string sort keeps a stable order.
const MANY_COUNTRIES_DATA = Array.from({ length: 300 }, (_, i) => i).flatMap((i) => [
    {
        athlete: `x${i}`,
        country: `C${String(i).padStart(3, '0')}`,
        year: 2000,
        gold: i + 1,
        silver: 0,
        bronze: 0,
        total: i + 1,
    },
    {
        athlete: `y${i}`,
        country: `C${String(i).padStart(3, '0')}`,
        year: 2004,
        gold: i + 2,
        silver: 0,
        bronze: 0,
        total: i + 2,
    },
]);

const pivotCols = (api: GridApi) => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));

describe('SSRM pivot-mode operations (characterization)', () => {
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

    test('1. initial pivot load — request carries pivot flags and pivot result columns are generated', async () => {
        const { datasource, requests } = createRecordingServer(SMALL_DATA);
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

        // Pivot-specific: the very first request already carries the pivot metadata.
        expect(requests[0].pivotMode).toBe(true);
        expect(requests[0].pivotCols).toEqual(['year']);
        expect(requests[0].valueCols).toEqual(['gold']);

        // Pivot result columns are generated from the datasource's pivotResultFields.
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);

        // Country groups are leaf groups in pivot mode; sorted by count desc then key => Russia, USA.
        await new GridRows(api, '1. initial pivot load').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:0 ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            └── GROUP-leafGroup collapsed id:1 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
        `);
    });

    test('2. block eviction (maxBlocksInCache) — re-request for evicted block still carries pivot flags', async () => {
        const { datasource, requests } = createRecordingServer(MANY_COUNTRIES_DATA);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            maxBlocksInCache: 1,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            serverSideDatasource: datasource,
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Scroll to a far block; with maxBlocksInCache=1 this evicts the first block.
        api.ensureIndexVisible(250, 'top');
        await asyncSetTimeout(0);
        await waitForNoLoadingRows(api);

        // Scroll back to the top — the evicted first block must be re-requested.
        const beforeReRequest = requests.length;
        api.ensureIndexVisible(0, 'top');
        await asyncSetTimeout(0);
        await waitForNoLoadingRows(api);

        expect(requests.length).toBeGreaterThan(beforeReRequest);
        // Pivot-specific: the re-request for the re-fetched block still carries the pivot metadata.
        const reRequest = requests[requests.length - 1];
        expect(reRequest.pivotMode).toBe(true);
        expect(reRequest.pivotCols).toEqual(['year']);
        expect(reRequest.valueCols).toEqual(['gold']);
        // Pivot result columns are unaffected by eviction/re-fetch.
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);
    });

    test('3. serverSideEnableClientSideSort — sorting a pivot value column', async () => {
        const { datasource, requests } = createRecordingServer(SMALL_DATA);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideEnableClientSideSort: true,
            serverSideDatasource: datasource,
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        const requestsBeforeSort = requests.length;

        // Sort ascending by a generated pivot value column. Default group order is Russia(4), USA(2);
        // an ascending sort by 2004_gold would put USA(2) first — so the row order distinguishes a
        // client-side re-sort from a no-op.
        api.applyColumnState({ state: [{ colId: '2004_gold', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        // Pin whether sorting a pivot value column re-requests from the server or sorts client-side:
        // no new request is issued (serverSideEnableClientSideSort keeps the sort on the client).
        const requestsAfterSort = requests.length;
        expect(requestsAfterSort).toBe(requestsBeforeSort);

        // Pin the resulting group row order after client-side sorting the pivot value column ascending.
        await new GridRows(api, '3. client-side sort on pivot value column').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:1 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
            └── GROUP-leafGroup collapsed id:0 ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
        `);
    });

    test('4. filter in pivot mode — re-request preserves pivot flags and carries filterModel', async () => {
        const { datasource, requests } = createRecordingServer(SMALL_DATA);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const requestsBeforeFilter = requests.length;

        api.setFilterModel({ country: { filterType: 'text', type: 'equals', filter: 'USA' } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        // A filter triggers a fresh server request in pivot mode.
        expect(requests.length).toBeGreaterThan(requestsBeforeFilter);
        // Pivot-specific: the re-request still carries the pivot metadata AND the applied filterModel.
        const filterRequest = requests[requests.length - 1];
        expect(filterRequest.pivotMode).toBe(true);
        expect(filterRequest.pivotCols).toEqual(['year']);
        expect(filterRequest.valueCols).toEqual(['gold']);
        // The applied country filter is carried on the post-filter request's filterModel. This is the
        // pivot-specific guarantee under test: were SSRM to stop sending filterModel on pivot requests,
        // this assertion would catch it (the metadata-only checks above would not).
        expect(filterRequest.filterModel).toEqual({
            country: { filterType: 'text', type: 'equals', filter: 'USA' },
        });

        // The shared fake server applies the equals-USA filter server-side, so only the USA group
        // remains; the generated pivot result columns are unaffected by the filter.
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);
        await new GridRows(api, '4. filter in pivot mode').check(`
            ROOT id:<no-id>
            └── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
        `);
    });

    test('5. refreshServerSide({purge:true}) — pivot columns regenerate and request carries pivot flags', async () => {
        const { datasource, requests } = createRecordingServer(SMALL_DATA);
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

        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);
        const requestsBeforeRefresh = requests.length;

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        // Purge re-requests from the server.
        expect(requests.length).toBeGreaterThan(requestsBeforeRefresh);
        // Pivot-specific: the purge re-request carries pivot metadata and pivot columns are regenerated.
        const refreshRequest = requests[requests.length - 1];
        expect(refreshRequest.pivotMode).toBe(true);
        expect(refreshRequest.pivotCols).toEqual(['year']);
        expect(refreshRequest.valueCols).toEqual(['gold']);
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);

        await new GridRows(api, '5. after purge refresh in pivot mode').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:2 ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            └── GROUP-leafGroup collapsed id:3 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
        `);
    });

    test('6. datasource fail() on pivot load then recovery via purge refresh', async () => {
        const { datasource, requests, failOnce } = createRecordingServer(SMALL_DATA);
        failOnce();
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
        // firstDataRendered may never fire after a failed load — bound the wait instead.
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        // Pin failure state: the load was attempted with pivot flags, but no pivot columns generated.
        expect(requests[0].pivotMode).toBe(true);
        expect(requests[0].pivotCols).toEqual(['year']);
        expect(pivotCols(api)).toEqual([]);
        // Baseline: a failed pivot load leaves a single loading/stub row in place (the failed block
        // is not cleared), rather than emptying the grid.
        expect(countLoadingRows(api)).toBe(1);

        // Recovery: a purge refresh re-requests successfully and regenerates pivot columns.
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        const recoveryRequest = requests[requests.length - 1];
        expect(recoveryRequest.pivotMode).toBe(true);
        expect(recoveryRequest.pivotCols).toEqual(['year']);
        expect(pivotCols(api)).toEqual(['2000_gold', '2004_gold']);

        await new GridRows(api, '6. recovered pivot load after fail').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:0 ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            └── GROUP-leafGroup collapsed id:1 ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
        `);
    });
});
