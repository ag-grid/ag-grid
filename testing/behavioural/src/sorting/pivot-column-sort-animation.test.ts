import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

// AG-9664: toggling pivotSort reorders existing pivot columns, so it reuses the column-move animation
// (the `ag-column-moving` class) to slide them rather than jumping.
describe('pivot: interactive pivot column sort animation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createPivotGrid(extraOptions?: Partial<GridOptions>): GridApi {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
            ...extraOptions,
        };
        const api = gridsManager.createGrid('pivotColumnSortAnimation', gridOptions);
        applyTransactionChecked(api, {
            add: [
                { id: 'a', country: 'USA', year: 2020, sales: 1 },
                { id: 'b', country: 'USA', year: 2021, sales: 1 },
                { id: 'c', country: 'USA', year: 2022, sales: 1 },
            ],
        });
        return api;
    }

    const isAnimating = () => document.querySelector('.ag-column-moving') != null;

    test('applies the column-move animation when sorting and when clearing the sort', async () => {
        const api = createPivotGrid();
        await asyncSetTimeout(10);
        expect(isAnimating()).toBe(false);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(isAnimating()).toBe(true);

        // Clearing the last sort (desc → null) reorders back to default, so it must animate too.
        await asyncSetTimeout(200);
        expect(isAnimating()).toBe(false);
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: null }] });
        await asyncSetTimeout(10);
        expect(isAnimating()).toBe(true);
    });

    test('suppressColumnMoveAnimation skips the pivot-sort animation', async () => {
        const api = createPivotGrid({ suppressColumnMoveAnimation: true });
        await asyncSetTimeout(10);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await asyncSetTimeout(10);
        expect(isAnimating()).toBe(false);
    });
});
