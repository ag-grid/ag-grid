import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { GridStateModule, PaginationModule } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

/*
 * Issue: with the Server-Side Row Model and pagination, a restored page
 * (initialState.pagination.page > 0) is lost once the first datasource response arrives.
 *
 * Setup: serverSide row model, pagination with page size 10, initialState.pagination = { page: 3, pageSize: 10 },
 * and a datasource that responds asynchronously with rowCount 1000. serverSideInitialRowCount is left at its default.
 *
 * Expected: the restored page (index 3) is kept once the data has loaded. The Grid State docs say the
 * pagination page is restored from initialState, and paginationService documents setPage as being for
 * state setting before data has been loaded.
 *
 * Actual: until the real row count is known the SSRM only reports the initial row count, so the page
 * is clamped to the last valid page (index 0) and paginationGetCurrentPage() returns 0 after load.
 *
 * Reported on: react 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 35.1.0 searched once,
 * in April 2026:
 *   "SSRM pagination restore page state initialState serverSideInitialRowCount pagination state not working"
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('SSRM pagination initialState page', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, PaginationModule, GridStateModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('restored page is kept after the datasource returns the row count', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'serverSide',
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: false,
            initialState: { pagination: { page: 3, pageSize: 10 } },
            serverSideDatasource: {
                getRows: (params) => {
                    void Promise.resolve().then(() => {
                        const { startRow = 0, endRow = 0 } = params.request;
                        const rowData = Array.from({ length: endRow - startRow }, (_, i) => ({ name: `Row ${startRow + i}` }));
                        params.success({ rowData, rowCount: 1000 });
                    });
                },
            },
        });

        await waitFor(() => expect(api.paginationGetTotalPages()).toBe(100));

        expect(api.paginationGetCurrentPage()).toBe(3);
    });
});
