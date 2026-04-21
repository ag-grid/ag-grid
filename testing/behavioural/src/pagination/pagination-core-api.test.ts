import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name' }];
const ROW_DATA = Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `Row ${i}` }));

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: false,
        getRowId: (params) => params.data.id,
        ...options,
    });
}

describe('Pagination Core API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('initial state', () => {
        test('paginationGetCurrentPage returns 0 on init', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('paginationGetTotalPages returns correct total', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(5); // 50 rows / 10 per page
        });

        test('paginationGetPageSize returns configured page size', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetPageSize()).toBe(10);
        });

        test('paginationGetRowCount returns total row count', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetRowCount()).toBe(50);
        });

        test('paginationIsLastPageFound returns true for CSRM', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationIsLastPageFound()).toBe(true);
        });

        test('getRenderedNodes returns only rows for current page', () => {
            const api = createGrid(gridsManager);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(10);
            expect(nodes[0].data.id).toBe('0');
            expect(nodes[9].data.id).toBe('9');
        });
    });

    describe('paginationGoToPage', () => {
        test('navigates to a valid page', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);
        });

        test('stays on current page when called with same page number', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(0);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('does nothing when pagination is not active', () => {
            const api = createGrid(gridsManager, { pagination: false });
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('clamps to last valid page when page exceeds total', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(100);
            expect(api.paginationGetCurrentPage()).toBe(4); // last page (0-indexed)
        });

        test('clamps to page 0 when page is negative', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            api.paginationGoToPage(-1);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('paginationGoToNextPage', () => {
        test('advances from page 0 to page 1', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('does not advance past last page', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(4); // last page
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
        });

        test('rendered nodes update after navigation', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToNextPage();
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(10);
            expect(nodes[0].data.id).toBe('10');
            expect(nodes[9].data.id).toBe('19');
        });
    });

    describe('paginationGoToPreviousPage', () => {
        test('goes back from page 1 to page 0', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(1);
            api.paginationGoToPreviousPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('does not go below page 0', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPreviousPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('paginationGoToFirstPage', () => {
        test('returns to page 0 from any page', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(3);
            expect(api.paginationGetCurrentPage()).toBe(3);
            api.paginationGoToFirstPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('is no-op when already on page 0', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToFirstPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('paginationGoToLastPage', () => {
        test('navigates to the last page', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
        });

        test('last page has correct remaining rows', () => {
            // 45 rows / 10 per page = 5 pages, last page has 5 rows
            const api = createGrid(gridsManager, {
                rowData: Array.from({ length: 45 }, (_, i) => ({ id: String(i), name: `Row ${i}` })),
            });
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(5);
        });

        test('works when row count is exact multiple of page size', () => {
            // 50 rows / 10 per page = 5 pages, last page has 10 rows
            const api = createGrid(gridsManager);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(10);
        });

        test('works when row count is not multiple of page size', () => {
            // 33 rows / 10 per page = 4 pages, last page has 3 rows
            const api = createGrid(gridsManager, {
                rowData: Array.from({ length: 33 }, (_, i) => ({ id: String(i), name: `Row ${i}` })),
            });
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(3);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(3);
        });
    });

    describe('rendered rows per page', () => {
        test('page 0 renders rows 0-9', () => {
            const api = createGrid(gridsManager);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(10);
            const ids = nodes.map((n) => n.data.id);
            expect(ids).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        });

        test('page 2 renders rows 20-29', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(10);
            const ids = nodes.map((n) => n.data.id);
            expect(ids).toEqual(['20', '21', '22', '23', '24', '25', '26', '27', '28', '29']);
        });

        test('last page renders correct subset', () => {
            const api = createGrid(gridsManager, {
                rowData: Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `Row ${i}` })),
            });
            api.paginationGoToLastPage();
            const nodes = api.getRenderedNodes();
            expect(nodes).toHaveLength(5);
            const ids = nodes.map((n) => n.data.id);
            expect(ids).toEqual(['20', '21', '22', '23', '24']);
        });
    });
});
