import type { ColDef, GridApi, IServerSideDatasource } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import { getColumnOrder } from '../columns/column-test-utils';
import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';

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
        await asyncSetTimeout(50);
        return api;
    }

    test('pivotSort desc reverses SSRM pivot result columns without refetching from the server', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));
        expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']);
        const countBeforeSort = getRowsCount();

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        // The reorder is a pure column rebuild, so it animates synchronously.
        expect(document.querySelector('.ag-column-moving')).not.toBeNull();
        await asyncSetTimeout(50);

        expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']);
        expect(getRowsCount()).toBe(countBeforeSort);
    });

    test('clicking the pivot pill cycles order client side, leaving loaded rows in place', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);

        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));
        const ascending = ['2000_gold', '2004_gold', '2008_gold'];
        const descending = ['2008_gold', '2004_gold', '2000_gold'];
        const rowCountBefore = api.getDisplayedRowCount();
        const countBeforeSort = getRowsCount();

        const yearCol = api.getColumn('year') as any;
        const strategy = yearCol.beans.columnStateUpdateStrategy;

        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(50);
        expect(strategy.getPivotSort(false, yearCol)).toBe('desc');
        expect(pivots()).toEqual(descending);

        // null is an explicit "no sort": pivot result columns keep the order the server returned them in.
        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(50);
        expect(strategy.getPivotSort(false, yearCol)).toBeNull();
        expect(pivots()).toEqual(ascending);

        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(50);
        expect(strategy.getPivotSort(false, yearCol)).toBe('asc');
        expect(pivots()).toEqual(ascending);

        expect(getRowsCount()).toBe(countBeforeSort);
        expect(api.getDisplayedRowCount()).toBe(rowCountBefore);
    });

    test('pivotComparator defines the ascending order and pivotSort desc reverses it', async () => {
        const { datasource } = countingDatasource();
        const api = await createPivotGrid(datasource, {
            pivotComparator: (a, b) => Number(b) - Number(a),
        });

        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));
        expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']);
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
        await asyncSetTimeout(50);

        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));
        const supplied = ['2004_gold', '2000_gold', '2008_gold'];
        // Supplying the columns resets pivotSort, so they keep the supplied order.
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull();
        expect(pivots()).toEqual(supplied);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']);

        // Clearing the sort must restore the supplied order, not keep the last sorted one.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(supplied);

        // ...from a descending sort too, not only from ascending.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(50);
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(supplied);
    });

    test('changing the pivot columns still refetches from the server', async () => {
        const { datasource, getRowsCount } = countingDatasource();
        const api = await createPivotGrid(datasource);
        const countBeforeChange = getRowsCount();

        api.applyColumnState({ state: [{ colId: 'year', pivot: false }] });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        expect(getRowsCount()).toBeGreaterThan(countBeforeChange);
    });
});
