import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, GridStateModule, PaginationModule } from 'ag-grid-community';

/*
 * Issue: a restored pagination page (initialState.pagination.page > 0) is lost when rowData
 * arrives asynchronously.
 *
 * Setup: client-side row model, pagination with page size 10, initialState.pagination.page = 2,
 * rowData: [] supplied explicitly at first. Rows are supplied later via api.setGridOption('rowData', ...).
 * The bug needs the explicit empty array: with rowData left undefined the page is preserved.
 *
 * Expected: the restored page (index 2) is kept until data loads, so once 50 rows arrive the grid
 * shows page 3 (index 2). Source: paginationService.ts documents setPage as "only for state setting
 * before data has been loaded", and the Grid State docs say the pagination page is restored.
 *
 * Actual: while there are zero rows, setZeroRows() resets currentPage to 0, so after data loads the
 * grid is on page 1 (index 0).
 *
 * Reported on: angular 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 36.0.0
 * searched twice within two seconds, in August 2026:
 *   "grid state restore current page not working with client-side row model async data pagination
 *    page reset to first page"
 *   "onPaginationChanged event newPage keepRenderedRows suppressScrollOnNewData rowData update reset page"
 */
describe('Pagination initialState page with async rowData', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, GridStateModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('restored page survives until async rowData arrives', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: false,
            getRowId: (params) => params.data.id,
            initialState: { pagination: { page: 2 } },
            rowData: [],
        });

        const rowData = Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `Row ${i}` }));
        api.setGridOption('rowData', rowData);

        await waitFor(() => expect(api.paginationGetTotalPages()).toBe(5));

        expect(api.paginationGetCurrentPage()).toBe(2);
    });
});
