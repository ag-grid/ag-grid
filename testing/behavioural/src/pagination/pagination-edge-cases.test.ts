import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, getGridElement } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name' }];

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: false,
        getRowId: (params) => params.data.id,
        ...options,
    });
}

function makeRowData(count: number) {
    return Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Row ${i}` }));
}

describe('Pagination Edge Cases', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('empty data', () => {
        test('no row data shows 0 total pages', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            expect(api.paginationGetTotalPages()).toBe(0);
        });

        test('paginationGetCurrentPage returns 0 with no data', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('paginationGetRowCount returns 0 with no data', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            expect(api.paginationGetRowCount()).toBe(0);
        });

        test('navigation methods are no-op with no data', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToPage(5);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('setting row data after empty initializes pagination', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            expect(api.paginationGetTotalPages()).toBe(0);

            api.setGridOption('rowData', makeRowData(25));
            expect(api.paginationGetTotalPages()).toBe(3);
            expect(api.paginationGetRowCount()).toBe(25);
            expect(api.getRenderedNodes()).toHaveLength(10);
        });
    });

    describe('single row', () => {
        test('single row with pageSize 10 shows 1 page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(1) });
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.getRenderedNodes()).toHaveLength(1);
        });

        test('navigation is no-op with single page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(1) });
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('exact page boundary', () => {
        test('10 rows with pageSize 10 shows exactly 1 page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(10) });
            expect(api.paginationGetTotalPages()).toBe(1);
        });

        test('11 rows with pageSize 10 shows exactly 2 pages', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('20 rows with pageSize 10 shows exactly 2 pages', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(20) });
            expect(api.paginationGetTotalPages()).toBe(2);
        });
    });

    describe('page size of 1', () => {
        test('pageSize 1 creates one page per row', () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(5),
                paginationPageSize: 1,
            });
            expect(api.paginationGetTotalPages()).toBe(5);
            expect(api.getRenderedNodes()).toHaveLength(1);
        });

        test('navigation works with pageSize 1', () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(5),
                paginationPageSize: 1,
            });

            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(1);
            expect(api.getRenderedNodes()[0].data.id).toBe('1');

            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
            expect(api.getRenderedNodes()[0].data.id).toBe('4');
        });
    });

    describe('page invalidation', () => {
        test('removing data to fewer pages clamps current page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            api.paginationGoToPage(4); // last page of 5
            expect(api.paginationGetCurrentPage()).toBe(4);

            api.setGridOption('rowData', makeRowData(15)); // now 2 pages
            expect(api.paginationGetCurrentPage()).toBeLessThanOrEqual(1);
        });

        test('data shrink eliminating last page adjusts correctly', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(30) });
            api.paginationGoToPage(2); // page 2 of 3
            expect(api.paginationGetCurrentPage()).toBe(2);

            api.setGridOption('rowData', makeRowData(20)); // now 2 pages (0-1)
            expect(api.paginationGetCurrentPage()).toBe(1); // clamped to last valid page
        });
    });

    describe('pagination toggle', () => {
        test('disabling pagination shows all rows', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            expect(api.getRenderedNodes()).toHaveLength(10); // page size = 10

            api.setGridOption('pagination', false);
            expect(api.getRenderedNodes()).toHaveLength(50);
        });

        test('re-enabling pagination restores paged view from page 0', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            api.paginationGoToPage(3);

            api.setGridOption('pagination', false);
            api.setGridOption('pagination', true);

            expect(api.paginationGetCurrentPage()).toBe(0);
            expect(api.getRenderedNodes()).toHaveLength(10);
        });
    });

    describe('paginationNumberFormatter', () => {
        test('formats numbers in pagination panel', () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(50),
                paginationNumberFormatter: (params) => `[${params.value}]`,
            });
            const panel = getGridElement(api)!.querySelector('.ag-paging-panel');
            const rowNumbers = panel!.querySelectorAll('.ag-paging-row-summary-panel-number');

            // Formatted values should use the custom formatter
            expect(rowNumbers[0].textContent).toBe('[1]');
            expect(rowNumbers[1].textContent).toBe('[10]');
            expect(rowNumbers[2].textContent).toBe('[50]');
        });
    });

    describe('rapid navigation', () => {
        test('multiple goToPage calls land on final page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            api.paginationGoToPage(1);
            api.paginationGoToPage(3);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);
        });

        test('goToNextPage past last page stays on last page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            api.paginationGoToPage(4); // last page
            api.paginationGoToNextPage();
            api.paginationGoToNextPage();
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
        });

        test('goToPreviousPage below 0 stays on page 0', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            api.paginationGoToPreviousPage();
            api.paginationGoToPreviousPage();
            api.paginationGoToPreviousPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });
});
