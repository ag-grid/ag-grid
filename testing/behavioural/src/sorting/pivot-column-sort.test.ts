import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { getColumnOrder } from '../columns/column-test-utils';
import { TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

// AG-9664: pivotSort reorders the generated pivot columns interactively, isolated from colDef.sort.
describe('pivot: interactive pivot column sorting (pivotSort)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule, PivotModule],
    });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createPivotGrid(): GridApi {
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
        await asyncSetTimeout(10);

        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
    });

    test('pivotSort desc reverses the pivot column order; asc/none restore it', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2022_sales',
            'pivot_year_2021_sales',
            'pivot_year_2020_sales',
        ]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
    });

    test('pivotSort is stored in column state and isolated from colDef.sort', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);

        const yearState = api.getColumnState().find((s) => s.colId === 'year')!;
        expect(yearState.pivotSort).toBe('desc');
        // pivot sorting must not flow into the column's own sort.
        expect(yearState.sort ?? null).toBeNull();
    });

    test('column state round-trips pivotSort: unset serializes as asc, null (no sort) is preserved', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        // Unset resolves to the ascending default.
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('asc');

        // null is the distinct "no sort" value and must survive serialization, not collapse to asc.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBeNull();
    });

    test('resetColumnState restores pivotSort to the colDef default', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2022_sales',
            'pivot_year_2021_sales',
            'pivot_year_2020_sales',
        ]);

        api.resetColumnState();
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('asc');
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
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
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2022_sales',
            'pivot_year_2021_sales',
            'pivot_year_2020_sales',
        ]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
    });

    test('clearing pivotSort directly from desc restores ascending order', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2022_sales',
            'pivot_year_2021_sales',
            'pivot_year_2020_sales',
        ]);

        // desc -> null directly (no asc in between) must not leave the sticky descending order in place.
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
    });

    test('pivotSort asc forces ascending order, overriding a prior user column move', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        // User drags the 2022 column to the front.
        api.moveColumns(['pivot_year_2022_sales'], 1);
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2022_sales',
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
        ]);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'asc' }] });
        await asyncSetTimeout(10);
        expect(getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'))).toEqual([
            'pivot_year_2020_sales',
            'pivot_year_2021_sales',
            'pivot_year_2022_sales',
        ]);
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
        await asyncSetTimeout(10);
        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));

        // User reorders silver before gold within Alpine and widens a column.
        api.moveColumns(['pivot_sport_Alpine_silver'], pivots().indexOf('pivot_sport_Alpine_gold'));
        api.setColumnWidths([{ key: 'pivot_sport_Alpine_gold', newWidth: 321 }]);
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'sport', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);

        // Groups resorted (Ski before Alpine), but Alpine keeps the user's silver/gold order and width.
        expect(pivots()).toEqual([
            'pivot_sport_Ski_gold',
            'pivot_sport_Ski_silver',
            'pivot_sport_Alpine_silver',
            'pivot_sport_Alpine_gold',
        ]);
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
        await asyncSetTimeout(10);
        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.startsWith('pivot_'));
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
        const descending = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];
        const natural = ['pivot_year_2022_sales', 'pivot_year_2020_sales', 'pivot_year_2021_sales'];

        const yearCol = api.getColumn('year') as any;
        const strategy = yearCol.beans.columnStateUpdateStrategy;

        // Unset default resolves to ascending.
        expect(strategy.getPivotSort(false, yearCol)).toBeUndefined();
        expect(pivots()).toEqual(ascending);

        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(10);
        expect(strategy.getPivotSort(false, yearCol)).toBe('desc');
        expect(pivots()).toEqual(descending);

        // null is an explicit "no sort": the columns return to their natural generated order, not ascending.
        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(10);
        expect(strategy.getPivotSort(false, yearCol)).toBeNull();
        expect(pivots()).toEqual(natural);

        strategy.progressPivotSortFromEvent(false, yearCol);
        await asyncSetTimeout(10);
        expect(strategy.getPivotSort(false, yearCol)).toBe('asc');
        expect(pivots()).toEqual(ascending);
    });

    test('setting colDef.sort does not affect pivotSort and vice versa', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }] });
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);

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
