import { waitFor } from '@testing-library/dom';
import { TestGridsManager, applyTransactionChecked } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { getColumnOrder } from '../columns/column-test-utils';

// AG-9664: pivotSort reorders the generated pivot columns interactively, isolated from colDef.sort.
describe('pivot: interactive pivot column sorting (pivotSort)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, RowGroupingModule, RowGroupingPanelModule, PivotModule],
    });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createPivotGrid(
        yearColDef?: Partial<ColDef>,
        extraGridOptions?: Partial<GridOptions>,
        gridId: string = 'pivotColumnSort'
    ): GridApi {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true, ...yearColDef },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
            ...extraGridOptions,
        };
        const api = gridsManager.createGrid(gridId, gridOptions);
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2020, sales: 1 },
                { id: 'b', country: 'USA', year: 2021, sales: 1 },
                { id: 'c', country: 'USA', year: 2022, sales: 1 },
            ],
        });
        return api;
    }

    test('defaults to ascending order with no pivotSort set', async () => {
        const api = createPivotGrid();

        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ])
        );
    });

    test.each(['pivotSort', 'initialPivotSort'] as const)('colDef.%s is applied on initialisation', async (prop) => {
        const api = createPivotGrid({ [prop]: 'desc' });

        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ])
        );
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
    });

    test('pivotSort desc reverses the pivot column order; asc/none restore it', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ])
        );

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ])
        );

        // desc -> asc already left the order ascending, so gate on the pivotSort field itself (which can only
        // become null after this call) rather than the column order, which was already ascending beforehand.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull();
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ]);
        });
    });

    test('pivotSort is stored in column state and isolated from colDef.sort', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });

        const yearState = await waitFor(() => {
            const state = api.getColumnState().find((s) => s.colId === 'year')!;
            expect(state.pivotSort).toBe('desc');
            return state;
        });
        // pivot sorting must not flow into the column's own sort.
        expect(yearState.sort ?? null).toBeNull();
    });

    test('column state round-trips pivotSort: unset serializes as asc, null (no sort) is preserved', async () => {
        const api = createPivotGrid();

        // Unset resolves to the ascending default.
        await waitFor(() => expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('asc'));

        // null is the distinct "no sort" value and must survive serialization, not collapse to asc.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() => expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull());
    });

    test('resetColumnState restores pivotSort to the colDef default', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ]);
        });

        api.resetColumnState();
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('asc');
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ]);
        });
    });

    test('desc reverses correctly when data insertion order differs from sorted order', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
        };
        const api = gridsManager.createGrid('pivotColumnSort', gridOptions);
        // Insertion order (2022, 2020, 2021) deliberately differs from ascending order.
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2022, sales: 1 },
                { id: 'b', country: 'USA', year: 2020, sales: 1 },
                { id: 'c', country: 'USA', year: 2021, sales: 1 },
            ],
        });

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ])
        );

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ])
        );
    });

    test('clearing pivotSort directly from desc restores ascending order', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ])
        );

        // desc -> null directly (no asc in between) must not leave the sticky descending order in place.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ])
        );
    });

    test('pivotSort asc forces ascending order, overriding a prior user column move', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        // User drags the 2022 column to the front.
        api.moveColumns(['pivot_year_2022_sales'], 1);
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
            ])
        );

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await waitFor(() =>
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2020_sales',
                'pivot_year_2021_sales',
                'pivot_year_2022_sales',
            ])
        );
    });

    test('sorting reorders groups but preserves user within-group order and widths', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
                { field: 'silver', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            pivotDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };
        const api = gridsManager.createGrid('g', gridOptions);
        applyTransactionChecked(api, {
            add: [
                { id: '1', country: 'USA', sport: 'Alpine', gold: 1, silver: 2 },
                { id: '2', country: 'USA', sport: 'Ski', gold: 3, silver: 4 },
            ],
        });
        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));
        await waitFor(() => expect(pivots()).toHaveLength(4));

        // User reorders silver before gold within Alpine and widens a column.
        api.moveColumns(['pivot_sport_Alpine_silver'], pivots().indexOf('pivot_sport_Alpine_gold'));
        api.setColumnWidths([{ key: 'pivot_sport_Alpine_gold', newWidth: 321 }]);
        await waitFor(() =>
            expect(pivots()).toEqual([
                'pivot_sport_Alpine_silver',
                'pivot_sport_Alpine_gold',
                'pivot_sport_Ski_gold',
                'pivot_sport_Ski_silver',
            ])
        );

        api.applyColumnState({ state: [{ colId: 'sport', pivotSort: 'desc' }] });

        // Groups resorted (Ski before Alpine), but Alpine keeps the user's silver/gold order and width.
        await waitFor(() =>
            expect(pivots()).toEqual([
                'pivot_sport_Ski_gold',
                'pivot_sport_Ski_silver',
                'pivot_sport_Alpine_silver',
                'pivot_sport_Alpine_gold',
            ])
        );
        expect(api.getColumn('pivot_sport_Alpine_gold')?.getActualWidth()).toBe(321);
    });

    test('click cycle: unset(asc) -> desc -> null(natural order) -> asc, with null distinct from asc', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
        };
        const api = gridsManager.createGrid('pivotColumnSort', gridOptions);
        // Insertion order is deliberately not ascending, so the natural (null) order differs from asc.
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2022, sales: 1 },
                { id: 'b', country: 'USA', year: 2020, sales: 1 },
                { id: 'c', country: 'USA', year: 2021, sales: 1 },
            ],
        });
        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
        const descending = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];
        const natural = ['pivot_year_2022_sales', 'pivot_year_2020_sales', 'pivot_year_2021_sales'];

        const yearCol = api.getColumn('year') as any;
        const strategy = yearCol.beans.columnStateUpdateStrategy;

        // Unset default resolves to ascending.
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBeUndefined();
            expect(pivots()).toEqual(ascending);
        });

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('desc');
            expect(pivots()).toEqual(descending);
        });

        // null is an explicit "no sort": the columns return to their natural generated order, not ascending.
        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBeNull();
            expect(pivots()).toEqual(natural);
        });

        strategy.progressPivotSortFromEvent(false, yearCol);
        await waitFor(() => {
            expect(strategy.getPivotSort(false, yearCol)).toBe('asc');
            expect(pivots()).toEqual(ascending);
        });
    });

    test('updating colDefs applies a changed pivotSort, but initialPivotSort is create-only', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));
        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
        const descending = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];

        const columnDefs = (yearColDef: Partial<ColDef>) => [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', pivot: true, hide: true, ...yearColDef },
            { field: 'sales', aggFunc: 'sum', hide: true },
        ];

        api.setGridOption('columnDefs', columnDefs({ pivotSort: 'desc' }));
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(pivots()).toEqual(descending);
        });

        // An omitted pivotSort leaves the live value alone, as with `sort`. The order is unchanged by this
        // mutation (the Column instance is reused too), so gate on the colDef being replaced - the one thing
        // `setGridOption('columnDefs', ...)` provably changes - rather than the order itself.
        let yearColDefBeforeUpdate = api.getColumn('year')!.getColDef();
        api.setGridOption('columnDefs', columnDefs({}));
        await waitFor(() => expect(api.getColumn('year')!.getColDef()).not.toBe(yearColDefBeforeUpdate));
        expect(pivots()).toEqual(descending);

        api.setGridOption('columnDefs', columnDefs({ pivotSort: 'asc' }));
        await waitFor(() => expect(pivots()).toEqual(ascending));

        // initialPivotSort is documented as create-only, so it must not reorder an existing column. The order is
        // unchanged by this mutation too, so again gate on the colDef replacement rather than the order.
        yearColDefBeforeUpdate = api.getColumn('year')!.getColDef();
        api.setGridOption('columnDefs', columnDefs({ initialPivotSort: 'desc' }));
        await waitFor(() => expect(api.getColumn('year')!.getColDef()).not.toBe(yearColDefBeforeUpdate));
        expect(pivots()).toEqual(ascending);
    });

    // Ordering of application-supplied pivot result columns is covered in pivot-column-sort-ssrm.test.ts: under
    // CSRM the pivot stage regenerates them from the row data on the next refresh, so they are transient here.
    test.each([null, [] as ColDef[]])('setPivotResultColumns (%s) leaves pivotSort alone', async (colDefs) => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc'));

        // Supplying the columns hands the grid an order to apply pivotSort to - it does not clear the sort. The
        // pivotSort value is untouched by this call (the assertion below is unchanged from the line above), so
        // there is nothing to poll: the call is synchronous with respect to the 'year' column's own state.
        api.setPivotResultColumns(colDefs);
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
    });

    test('grid state captures pivotSort and restores it through initialState', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        const state = await waitFor(() => {
            const currentState = api.getState();
            expect(currentState.pivot?.pivotSortModel).toEqual([{ colId: 'year', sort: 'desc' }]);
            return currentState;
        });

        api.destroy();
        const restoredApi = createPivotGrid(undefined, { initialState: state }, 'pivotColumnSortRestored');
        await waitFor(() => {
            expect(restoredApi.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(getColumnOrder(restoredApi, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ]);
        });
    });

    test('setState applies pivotSortModel, including the natural (null) order', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        const state = api.getState();
        api.setState({
            ...state,
            pivot: { ...state.pivot!, pivotSortModel: [{ colId: 'year', sort: 'desc' }] },
        });
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ]);
        });

        api.setState({
            ...state,
            pivot: { ...state.pivot!, pivotSortModel: [{ colId: 'year', sort: null }] },
        });
        await waitFor(() => {
            expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull();
            expect(api.getState().pivot?.pivotSortModel).toEqual([{ colId: 'year', sort: null }]);
        });
    });

    test('setting colDef.sort does not affect pivotSort and vice versa', async () => {
        const api = createPivotGrid();
        await waitFor(() => expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toHaveLength(3));

        api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }] });
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => {
            const yearState = api.getColumnState().find((s) => s.colId === 'year')!;
            expect(yearState.sort).toBe('asc');
            expect(yearState.pivotSort).toBe('desc');
            expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
                'pivot_year_2022_sales',
                'pivot_year_2021_sales',
                'pivot_year_2020_sales',
            ]);
        });
    });
});
