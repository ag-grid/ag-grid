import type { GridApi, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../../columnToolPanel/deferredPivotModeFakeServer';
import { GridColumns, GridRows, TestGridsManager, waitForNoLoadingRows } from '../../test-utils';

/**
 * Characterisation (golden-master) tests pinning the CURRENT behaviour of the Server-Side Row Model
 * in pivot mode: the shape of the pivot-mode request (pivotMode / pivotCols / valueCols / rowGroupCols),
 * the pivot result columns generated from the server's `pivotResultFields`, the effect of
 * `serverSidePivotResultFieldSeparator`, and pivot leaf-group expansion.
 *
 * These tests document what the grid does today. Where an assertion encodes a quirk it is deliberate:
 * the value is the observed mechanic, not a specification of desired behaviour.
 */
describe('SSRM pivot (characterisation)', () => {
    const gridsManager = new TestGridsManager({
        modules: [PivotModule, RowGroupingModule, ServerSideRowModelModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowData = [
        { athlete: 'a', country: 'USA', year: 2000, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
        { athlete: 'b', country: 'USA', year: 2004, sport: 'Swimming', gold: 2, silver: 1, bronze: 0, total: 3 },
        { athlete: 'c', country: 'USA', year: 2008, sport: 'Swimming', gold: 3, silver: 0, bronze: 1, total: 4 },
        { athlete: 'd', country: 'Russia', year: 2000, sport: 'Swimming', gold: 4, silver: 0, bronze: 0, total: 4 },
        { athlete: 'e', country: 'Russia', year: 2004, sport: 'Swimming', gold: 5, silver: 2, bronze: 0, total: 7 },
    ];

    // Records the raw SSRM requests so we can pin the pivot-mode request shape.
    const recordingDatasource = (
        requests: IServerSideGetRowsRequest[],
        rows: typeof rowData
    ): IServerSideDatasource => {
        const inner = createServerSideDatasource(createFakeServer(rows as any));
        return {
            getRows: (params) => {
                requests.push(params.request);
                inner.getRows(params);
            },
        };
    };

    // --- Scenario 1: enabling pivot mode issues a pivotMode request and generates pivot result columns ---

    test('pivot mode request carries pivotMode/pivotCols/valueCols and generates pivot result columns', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: recordingDatasource(requests, rowData),
        });
        await waitForNoLoadingRows(api);

        // The initial (root) request runs in pivot mode and forwards the pivot/value/group column metadata.
        const rootRequest = requests[0];
        expect(rootRequest.pivotMode).toBe(true);
        expect(rootRequest.pivotCols.map((c) => c.id)).toEqual(['year']);
        expect(rootRequest.valueCols.map((c) => c.id)).toEqual(['gold']);
        expect(rootRequest.valueCols.map((c) => c.aggFunc)).toEqual(['sum']);
        expect(rootRequest.rowGroupCols.map((c) => c.id)).toEqual(['country']);
        expect(rootRequest.groupKeys).toEqual([]);

        // Pivot result columns are generated from the server's pivotResultFields (one per year x gold).
        await new GridColumns(api, 'pivot result columns (default separator)').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── 2000_gold "Gold" width:200
            ├─┬ "2004" GROUP
            │ └── 2004_gold "Gold" width:200
            └─┬ "2008" GROUP
              └── 2008_gold "Gold" width:200
        `);
    });

    // --- Scenario 2: serverSidePivotResultFieldSeparator changes the split of pivotResultFields ---

    test('serverSidePivotResultFieldSeparator controls how pivot result fields are split into columns', async () => {
        // Hand-rolled datasource returning pivotResultFields joined with the non-default '|' separator.
        const separator = '|';
        const requests: IServerSideGetRowsRequest[] = [];
        const datasource: IServerSideDatasource = {
            getRows: (params) => {
                requests.push(params.request);
                // Single group level (country) -> one pivoted row per country; pivot on year, value gold.
                const years = ['2000', '2004', '2008'];
                const pivotResultFields = years.map((y) => `${y}${separator}gold`);
                const countries = Array.from(new Set(rowData.map((r) => r.country)));
                const rows = countries.map((country) => {
                    const row: any = { country };
                    for (const y of years) {
                        const match = rowData.filter((r) => r.country === country && String(r.year) === y);
                        row[`${y}${separator}gold`] = match.reduce((s, r) => s + r.gold, 0);
                    }
                    return row;
                });
                setTimeout(() => {
                    params.success({ rowData: rows, rowCount: rows.length, pivotResultFields });
                }, 0);
            },
        };

        const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSidePivotResultFieldSeparator: separator,
            serverSideDatasource: datasource,
        });
        await waitForNoLoadingRows(api);

        // With the '|' separator the grid splits "2000|gold" into pivot-key "2000" + value col "gold";
        // the generated colId keeps the raw field (still separator-joined).
        await new GridColumns(api, 'pivot result columns (pipe separator)').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── 2000|gold "Gold" width:200
            ├─┬ "2004" GROUP
            │ └── 2004|gold "Gold" width:200
            └─┬ "2008" GROUP
              └── 2008|gold "Gold" width:200
        `);
    });

    // --- Scenario 3: pivot leaf-group expansion requests the group route and returns pivoted rows ---

    test('expanding a pivot row group requests the group route and returns pivoted child rows', async () => {
        // Two row-group levels (country, year) so country is an expandable (non-leaf) group; pivot on sport.
        const requests: IServerSideGetRowsRequest[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: recordingDatasource(requests, rowData),
            getRowId: ({ data, level, parentKeys }) => {
                const key = level === 0 ? data.country : data.year;
                return [...(parentKeys ?? []), key].join('-');
            },
        });
        await waitForNoLoadingRows(api);

        requests.length = 0;
        api.getRowNode('USA')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // The expansion issues a request scoped to the USA group route, still in pivot mode.
        const expandRequest = requests[0];
        expect(expandRequest.pivotMode).toBe(true);
        expect(expandRequest.groupKeys).toEqual(['USA']);
        expect(expandRequest.rowGroupCols.map((c) => c.id)).toEqual(['country', 'year']);
        expect(expandRequest.pivotCols.map((c) => c.id)).toEqual(['sport']);

        await new GridRows(api, 'SSRM pivot expand USA').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:USA ag-Grid-AutoColumn:"USA" Swimming_gold:6
            │ ├── GROUP-leafGroup collapsed id:USA-2000 ag-Grid-AutoColumn:"2000" Swimming_gold:1
            │ ├── GROUP-leafGroup collapsed id:USA-2004 ag-Grid-AutoColumn:"2004" Swimming_gold:2
            │ └── GROUP-leafGroup collapsed id:USA-2008 ag-Grid-AutoColumn:"2008" Swimming_gold:3
            └── GROUP collapsed id:Russia ag-Grid-AutoColumn:"Russia" Swimming_gold:9
        `);
    });
});
