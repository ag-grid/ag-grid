import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { getColumnOrder } from '../columns/column-test-utils';
import { TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

// AG-9664: pivotSort reorders the generated pivot columns interactively, isolated from colDef.sort.
describe('pivot: interactive pivot column sorting (pivotSort)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
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
