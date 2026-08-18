import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForNoLoadingRows } from 'ag-test-utils';

import type { ColDef, GridApi, IServerSideDatasource } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import { getColumnOrder } from '../columns/column-test-utils';

// AG-9664: interactive pivot column sorting must also work under the Server-Side Row Model.
describe('SSRM: interactive pivot column sorting (pivotSort)', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowData = [
        { athlete: 'a', country: 'USA', year: 2000, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
        { athlete: 'b', country: 'USA', year: 2004, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
        { athlete: 'c', country: 'USA', year: 2008, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
    ];

    /** Wraps the fake datasource so tests can assert how many blocks were requested from the server. */
    function countingDatasource(): { datasource: IServerSideDatasource; getRowsCount: () => number } {
        const delegate = createServerSideDatasource(createFakeServer(rowData as any));
        let getRowsCount = 0;
        return {
            datasource: {
                getRows: (params) => {
                    getRowsCount++;
                    delegate.getRows(params);
                },
            },
            getRowsCount: () => getRowsCount,
        };
    }

    /** The pivot result col ids in display order, so a reorder is observable while the measures are ignored. */
    const pivotsOf = (api: GridApi, pattern: RegExp = /_gold$/) =>
        getColumnOrder(api, 'all').filter((id) => pattern.test(id));

    async function createPivotGrid(datasource: IServerSideDatasource, yearColDef?: Partial<ColDef>): Promise<GridApi> {
        const api = await gridsManager.createGridAndWait('ssrm', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true, ...yearColDef },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForNoLoadingRows(api);
        return api;
    }

    test('pivotSort desc reverses SSRM pivot result columns without refetching from the server', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']));
        const countBeforeSort = getRowsCount();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        // The reorder is a pure column rebuild, so it animates synchronously.
        expect(document.querySelector('.ag-column-moving')).not.toBeNull();

        await waitFor(() => expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']));
        expect(getRowsCount()).toBe(countBeforeSort);
    });

    test('clicking the pivot pill cycles order client side, leaving loaded rows in place', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => pivotsOf(api);
        const ascending = ['2000_gold', '2004_gold', '2008_gold'];
        const descending = ['2008_gold', '2004_gold', '2000_gold'];
        await waitFor(() => expect(pivots()).toEqual(ascending));
        const rowCountBefore = api.getDisplayedRowCount();
        const countBeforeSort = getRowsCount();

        const yearCol = api.getColumn('year') as any;
        const strategy = yearCol.beans.columnStateUpdateStrategy;

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('desc');
            expect(pivots()).toEqual(descending);
        });

        // null is an explicit "no sort": pivot result columns keep the order the server returned them in.
        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBeNull();
            expect(pivots()).toEqual(ascending);
        });

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('asc');
            expect(pivots()).toEqual(ascending);
        });

        expect(getRowsCount()).toBe(countBeforeSort);
        expect(api.getDisplayedRowCount()).toBe(rowCountBefore);
    });

    test('pivotComparator defines the ascending order and pivotSort desc reverses it', async () => {
        const { datasource } = countingDatasource();
        const api = await createPivotGrid(datasource, {
            pivotComparator: (a, b) => Number(b) - Number(a),
        });

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']));
    });

    test('pivotSort reorders application-supplied pivot result columns', async () => {
        // No pivotResultFields in the response, so the grid never generates the pivot result columns itself.
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await createPivotGrid(datasource);

        // Supplied in an order that is neither ascending nor descending, so "no sort" is distinguishable.
        api.setPivotResultColumns([
            { groupId: '2004', headerName: '2004', children: [{ colId: '2004_gold', field: '2004_gold' }] },
            { groupId: '2000', headerName: '2000', children: [{ colId: '2000_gold', field: '2000_gold' }] },
            { groupId: '2008', headerName: '2008', children: [{ colId: '2008_gold', field: '2008_gold' }] },
        ]);

        const pivots = () => pivotsOf(api);
        const supplied = ['2004_gold', '2000_gold', '2008_gold'];
        // The application chose this order, so an unset pivotSort leaves it alone and reports no sort.
        await waitFor(() => expect(pivots()).toEqual(supplied));
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']));

        // Clearing the sort must restore the supplied order, not keep the last sorted one.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => expect(pivots()).toEqual(supplied));

        // ...from a descending sort too, not only from ascending.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']));
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => expect(pivots()).toEqual(supplied));
    });

    test('supplied pivot result columns start unsorted and the first pill click sorts them ascending', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await createPivotGrid(datasource);

        // Supplied in an order that is neither ascending nor descending, so "no sort" is distinguishable.
        const supplied = ['2004_gold', '2000_gold', '2008_gold'];
        api.setPivotResultColumns([
            { groupId: '2004', headerName: '2004', children: [{ colId: '2004_gold', field: '2004_gold' }] },
            { groupId: '2000', headerName: '2000', children: [{ colId: '2000_gold', field: '2000_gold' }] },
            { groupId: '2008', headerName: '2008', children: [{ colId: '2008_gold', field: '2008_gold' }] },
        ]);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(supplied));

        const yearCol = api.getColumn('year') as any;
        const strategy = yearCol.beans.columnStateUpdateStrategy;
        expect(strategy.getPivotSort(false, yearCol)).toBeUndefined();

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('asc');
            expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']);
        });

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('desc');
            expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']);
        });

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBeNull();
            expect(pivots()).toEqual(supplied);
        });
    });

    test('the pivot pill shows no sort indicator while supplied pivot result columns are unsorted', async () => {
        const api = await gridsManager.createGridAndWait('ssrmPill', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            pivotPanelShow: 'always',
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
            },
        });
        await waitForNoLoadingRows(api);

        api.setPivotResultColumns([
            { groupId: '2004', headerName: '2004', children: [{ colId: '2004_gold', field: '2004_gold' }] },
            { groupId: '2000', headerName: '2000', children: [{ colId: '2000_gold', field: '2000_gold' }] },
        ]);
        await waitFor(() => expect(pivotsOf(api)).toEqual(['2004_gold', '2000_gold']));

        const pill = getGridElement(api)!.querySelector('.ag-column-drop-horizontal-pivot .ag-column-drop-cell')!;
        const shown = (selector: string) => {
            const icon = pill.querySelector(selector);
            return !!icon && !icon.classList.contains('ag-hidden');
        };
        expect(shown('.ag-sort-ascending-icon')).toBe(false);
        expect(shown('.ag-sort-descending-icon')).toBe(false);

        pill.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await waitFor(() => {
            expect(shown('.ag-sort-ascending-icon')).toBe(true);
            expect(pivotsOf(api)).toEqual(['2000_gold', '2004_gold']);
        });
    });

    test('sorting supplied pivot result columns does not mutate the application-owned arrays', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await createPivotGrid(datasource);

        const supplied = [
            { groupId: '2004', headerName: '2004', children: [{ colId: '2004_gold', field: '2004_gold' }] },
            { groupId: '2000', headerName: '2000', children: [{ colId: '2000_gold', field: '2000_gold' }] },
        ];
        const suppliedOrder = supplied.map((def) => def.groupId);
        api.setPivotResultColumns(supplied);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(pivotsOf(api)).toEqual(['2004_gold', '2000_gold']));

        // The grid orders a copy: reusing this array in a later setPivotResultColumns call must still express the
        // application's own order, not whatever the last sort produced.
        expect(supplied.map((def) => def.groupId)).toEqual(suppliedOrder);
    });

    test('application-supplied columns survive a pivotSort change after the grid generated columns itself', async () => {
        // The response carries pivotResultFields, so the grid generates the pivot result columns first and takes
        // ownership of them. Supplying columns afterwards must transfer that ownership to the application.
        const { datasource } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']));

        api.setPivotResultColumns([
            { groupId: 'sup_2004', headerName: '2004', children: [{ colId: 'sup_2004_gold', field: '2004_gold' }] },
            { groupId: 'sup_2000', headerName: '2000', children: [{ colId: 'sup_2000_gold', field: '2000_gold' }] },
        ]);
        await waitFor(() => expect(pivots()).toEqual(['sup_2004_gold', 'sup_2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['sup_2000_gold', 'sup_2004_gold']));
    });

    test('a server refresh does not replace application-supplied pivot result columns', async () => {
        // Every block response carries pivotResultFields, so the grid would otherwise regenerate the columns and
        // take ownership back the next time the server is asked for rows.
        const { datasource } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']));

        api.setPivotResultColumns([
            { groupId: 'sup_2004', headerName: '2004', children: [{ colId: 'sup_2004_gold', field: '2004_gold' }] },
            { groupId: 'sup_2000', headerName: '2000', children: [{ colId: 'sup_2000_gold', field: '2000_gold' }] },
        ]);
        await waitFor(() => expect(pivots()).toEqual(['sup_2004_gold', 'sup_2000_gold']));

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        await waitFor(() => expect(api.getDisplayedRowCount()).toBeGreaterThan(0));
        expect(pivots()).toEqual(['sup_2004_gold', 'sup_2000_gold']);

        // ...and the application keeps the order until it hands the columns back.
        api.setPivotResultColumns(null);
        await waitFor(() => expect(pivots()).toEqual([]));
    });

    test('pivotSort orders supplied pivot groups without reordering the measures inside them', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await gridsManager.createGridAndWait('ssrmFlat', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForNoLoadingRows(api);

        // Two pivot columns, but the supplied groups nest measure leaves directly rather than a second group
        // level. Those leaves are measures, not pivot keys, so their within-group order must be preserved.
        api.setPivotResultColumns([
            {
                groupId: '2004',
                headerName: '2004',
                children: [
                    { colId: '2004_silver', field: '2004_silver', headerName: 'Silver' },
                    { colId: '2004_gold', field: '2004_gold', headerName: 'Gold' },
                ],
            },
            {
                groupId: '2000',
                headerName: '2000',
                children: [
                    { colId: '2000_silver', field: '2000_silver', headerName: 'Silver' },
                    { colId: '2000_gold', field: '2000_gold', headerName: 'Gold' },
                ],
            },
        ]);

        const pivots = () => pivotsOf(api, /^\d{4}_/);
        // Groups keep the supplied order while unsorted; Silver still precedes Gold inside each.
        await waitFor(() => expect(pivots()).toEqual(['2004_silver', '2004_gold', '2000_silver', '2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_silver', '2000_gold', '2004_silver', '2004_gold']));
    });

    test('pivotKeys mark supplied leaves as a flattened inner pivot level', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await gridsManager.createGridAndWait('ssrmInnerFlat', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForNoLoadingRows(api);

        // The sport level is flattened onto the leaves, which say so through pivotKeys - so unlike the measures of
        // the test above, they are pivot keys of that level and the sport pivotSort orders them.
        api.setPivotResultColumns([
            {
                groupId: '2000',
                headerName: '2000',
                children: [
                    {
                        colId: '2000_Swimming',
                        field: '2000_gold',
                        headerName: 'Swimming',
                        pivotKeys: ['2000', 'Swimming'],
                    },
                    { colId: '2000_Diving', field: '2000_gold', headerName: 'Diving', pivotKeys: ['2000', 'Diving'] },
                ],
            },
        ]);

        const pivots = () => pivotsOf(api, /^\d{4}_/);
        await waitFor(() => expect(pivots()).toEqual(['2000_Swimming', '2000_Diving']));

        api.applyColumnState({ state: [{ colId: 'sport', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_Diving', '2000_Swimming']));
    });

    test('pivotSort orders flat supplied pivot columns when pivoting on two columns', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await gridsManager.createGridAndWait('ssrmTwoLevelFlat', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
        });
        await waitForNoLoadingRows(api);

        // Two pivot columns, but the supplied result is entirely flat - no groups at all. The top level is still a
        // pivot-key level, and there is no deeper level to descend into.
        api.setPivotResultColumns([
            { colId: '2004_gold', field: '2004_gold', headerName: '2004' },
            { colId: '2000_gold', field: '2000_gold', headerName: '2000' },
        ]);

        const pivots = () => pivotsOf(api, /^\d{4}_/);
        await waitFor(() => expect(pivots()).toEqual(['2004_gold', '2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold']));
    });

    test('pivotSort pins a supplied non-group column while the groups beside it reorder', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await createPivotGrid(datasource);

        // A level mixing pivot groups with a standalone colDef - a row total, say. The total is not a pivot key, so
        // it holds its trailing position while the groups sort around it.
        api.setPivotResultColumns([
            { groupId: '2004', headerName: '2004', children: [{ colId: '2004_gold', field: '2004_gold' }] },
            { groupId: '2000', headerName: '2000', children: [{ colId: '2000_gold', field: '2000_gold' }] },
            { colId: 'total_gold', field: 'total_gold', headerName: 'Total' },
        ]);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['2004_gold', '2000_gold', 'total_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['2000_gold', '2004_gold', 'total_gold']));
    });

    test('a supplied total marked with empty pivotKeys is pinned in a flat level', async () => {
        const datasource: IServerSideDatasource = {
            getRows: (params) => setTimeout(() => params.success({ rowData: rowData as any, rowCount: 3 }), 0),
        };
        const api = await createPivotGrid(datasource);

        // A flat level would otherwise be taken for pivot keys throughout; `pivotKeys: []` says this one sits
        // outside every pivot group, so it keeps its leading position.
        api.setPivotResultColumns([
            { colId: 'total_gold', field: 'total_gold', headerName: 'Total', pivotKeys: [] },
            { colId: '2004_gold', field: '2004_gold', headerName: '2004', pivotKeys: ['2004'] },
            { colId: '2000_gold', field: '2000_gold', headerName: '2000', pivotKeys: ['2000'] },
        ]);

        const pivots = () => pivotsOf(api);
        await waitFor(() => expect(pivots()).toEqual(['total_gold', '2004_gold', '2000_gold']));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() => expect(pivots()).toEqual(['total_gold', '2000_gold', '2004_gold']));
    });

    test('changing the pivot columns still refetches from the server', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);
        const countBeforeChange = getRowsCount();

        api.applyColumnState({ state: [{ colId: 'year', pivot: false }] });
        await waitForNoLoadingRows(api);

        await waitFor(() => expect(getRowsCount()).toBeGreaterThan(countBeforeChange));
    });
});
