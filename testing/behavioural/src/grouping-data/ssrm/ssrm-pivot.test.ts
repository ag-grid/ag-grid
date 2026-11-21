import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';

import type { GridApi, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';
import { NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../../columnToolPanel/deferredPivotModeFakeServer';
import { pivotGroups } from '../pivotGroups';

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

    test.each([
        { pivotDefaultExpanded: 0, sportOpen: false, yearOpen: false },
        { pivotDefaultExpanded: 1, sportOpen: true, yearOpen: false },
        { pivotDefaultExpanded: -1, sportOpen: true, yearOpen: true },
    ])(
        'pivotDefaultExpanded $pivotDefaultExpanded opens the pivot result column groups to that depth',
        async ({ pivotDefaultExpanded, sportOpen, yearOpen }) => {
            const pivotResultFields = ['Swim_2000_gold', 'Swim_2004_gold', 'Run_2000_gold', 'Run_2004_gold'];
            const datasource: IServerSideDatasource = {
                getRows: (params) => {
                    const rows = [
                        { country: 'USA', Swim_2000_gold: 1, Swim_2004_gold: 2, Run_2000_gold: 3, Run_2004_gold: 4 },
                    ];
                    setTimeout(() => {
                        params.success({ rowData: rows, rowCount: rows.length, pivotResultFields });
                    }, 0);
                },
            };

            const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', pivot: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'gold', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                pivotDefaultExpanded,
                rowModelType: 'serverSide',
                serverSideDatasource: datasource,
            });
            await waitForNoLoadingRows(api);

            expect(pivotGroups(api)).toEqual([
                { id: 'Run', path: 'Run', open: sportOpen, expandable: false },
                { id: 'Run_2000', path: 'Run > 2000', open: yearOpen, expandable: false },
                { id: 'Run_2004', path: 'Run > 2004', open: yearOpen, expandable: false },
                { id: 'Swim', path: 'Swim', open: sportOpen, expandable: false },
                { id: 'Swim_2000', path: 'Swim > 2000', open: yearOpen, expandable: false },
                { id: 'Swim_2004', path: 'Swim > 2004', open: yearOpen, expandable: false },
            ]);
        }
    );

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

describe('SSRM pivot header height', () => {
    const gridsManager = new TestGridsManager({
        modules: [PivotModule, RowGroupingModule, ServerSideRowModelModule, TextFilterModule, NumberFilterModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowClasses = (api: GridApi) =>
        Array.from(TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-header-row'), (row) =>
            ['ag-header-row-group', 'ag-header-row-column', 'ag-header-row-filter'].find((cls) =>
                row.classList.contains(cls)
            )
        );
    const headerHeight = (api: GridApi) =>
        parseFloat(TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-header')!.style.height);

    test('header resizes when pivot mode swaps [column, floating filter] for [group, column] and back', async () => {
        const years = [2020, 2024];
        const countries = ['Ireland', 'France'];
        const datasource: IServerSideDatasource = {
            getRows: ({ request, success }) => {
                setTimeout(() => {
                    if (request.pivotMode && request.pivotCols.length && request.rowGroupCols.length) {
                        const pivotResultFields = years.map((y) => `${y}_gold`);
                        const rowData = countries.map((country) => {
                            const row: Record<string, unknown> = { country };
                            years.forEach((y) => (row[`${y}_gold`] = 1));
                            return row;
                        });
                        success({ rowData, rowCount: rowData.length, pivotResultFields });
                        return;
                    }
                    const rowData = countries.flatMap((country) => years.map((year) => ({ country, year, gold: 1 })));
                    success({ rowData, rowCount: rowData.length });
                }, 0);
            },
        };

        const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
            headerHeight: 30,
            groupHeaderHeight: 20,
            floatingFiltersHeight: 40,
            columnDefs: [
                { field: 'country', enableRowGroup: true, filter: 'agTextColumnFilter', floatingFilter: true },
                { field: 'year', enablePivot: true, filter: 'agNumberColumnFilter', floatingFilter: true },
                {
                    field: 'gold',
                    enableValue: true,
                    aggFunc: 'sum',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
            // Pivot result columns have no floating filter.
            processPivotResultColDef: (colDef) => {
                colDef.floatingFilter = false;
            },
        });
        await waitForNoLoadingRows(api);

        expect(rowClasses(api)).toEqual(['ag-header-row-column', 'ag-header-row-filter']);
        // The header is sized for its rows plus the theme's header row border.
        const border = headerHeight(api) - (30 + 40);
        expect(border).toBeGreaterThanOrEqual(0);

        api.setGridOption('pivotMode', true);
        api.applyColumnState({
            state: [
                { colId: 'country', rowGroup: true, rowGroupIndex: 0 },
                { colId: 'year', pivot: true, pivotIndex: 0 },
                { colId: 'gold', aggFunc: 'sum' },
            ],
            applyOrder: true,
        });

        await waitFor(() => expect(rowClasses(api)).toEqual(['ag-header-row-group', 'ag-header-row-column']));
        await waitForNoLoadingRows(api);
        await waitFor(() => expect(headerHeight(api)).toBe(20 + 30 + border));

        api.setGridOption('pivotMode', false);

        await waitFor(() => expect(rowClasses(api)).toEqual(['ag-header-row-column', 'ag-header-row-filter']));
        await waitForNoLoadingRows(api);
        await waitFor(() => expect(headerHeight(api)).toBe(30 + 40 + border));
    });
});
