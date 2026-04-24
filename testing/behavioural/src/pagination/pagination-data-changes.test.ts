import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, TextFilterModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name', filter: true }];

function makeRowData(count: number) {
    return Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Row ${i}` }));
}

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: makeRowData(50),
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: false,
        getRowId: (params) => params.data.id,
        ...options,
    });
}

describe('Pagination with Data Changes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, TextFilterModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('filtering', () => {
        test('applying filter reduces total pages', () => {
            // Rows: "Row 0" to "Row 49". Filter for "Row 1" matches Row 1, 10-19 = 11 rows
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setFilterModel({ name: { type: 'contains', filter: 'Row 1' } });
            expect(api.paginationGetTotalPages()).toBeLessThan(5);
            expect(api.paginationGetRowCount()).toBe(11); // Row 1, Row 10-19
        });

        test('current page maintained if still valid after filter', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(1);
            expect(api.paginationGetCurrentPage()).toBe(1);

            // Filter to keep enough rows for 2+ pages
            api.setFilterModel({ name: { type: 'contains', filter: 'Row 1' } });
            // 11 matching rows, page size 10, so 2 pages. Page 1 is still valid.
            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('current page clamped when filter makes it invalid', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(4); // page 4 of 5
            expect(api.paginationGetCurrentPage()).toBe(4);

            // Filter to very few rows (just "Row 5")
            api.setFilterModel({ name: { type: 'equals', filter: 'Row 5' } });
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('clearing filter restores original total pages', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setFilterModel({ name: { type: 'equals', filter: 'Row 5' } });
            expect(api.paginationGetTotalPages()).toBe(1);

            api.setFilterModel(null);
            expect(api.paginationGetTotalPages()).toBe(5);
            expect(api.paginationGetRowCount()).toBe(50);
        });

        test('filtering to zero results shows 0 total pages', () => {
            const api = createGrid(gridsManager);

            api.setFilterModel({ name: { type: 'equals', filter: 'nonexistent' } });
            expect(api.paginationGetTotalPages()).toBe(0);
            expect(api.paginationGetRowCount()).toBe(0);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('setRowData', () => {
        test('fewer rows adjusts total pages', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('rowData', makeRowData(15));
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('more rows increases total pages', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(15) });
            expect(api.paginationGetTotalPages()).toBe(2);

            api.setGridOption('rowData', makeRowData(50));
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('empty data shows 0 total pages', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('rowData', []);
            expect(api.paginationGetTotalPages()).toBe(0);
            expect(api.paginationGetRowCount()).toBe(0);
        });

        test('current page clamped if it exceeds new total', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(4);
            expect(api.paginationGetCurrentPage()).toBe(4);

            api.setGridOption('rowData', makeRowData(15)); // 2 pages
            expect(api.paginationGetCurrentPage()).toBeLessThanOrEqual(1);
        });

        test('same row count preserves page position', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);

            // Replace with same number of rows
            api.setGridOption(
                'rowData',
                Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `New Row ${i}` }))
            );
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });
    });

    describe('transactions', () => {
        test('adding rows increases total pages when threshold crossed', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(10) });
            expect(api.paginationGetTotalPages()).toBe(1);

            api.applyTransaction({
                add: [{ id: '100', name: 'Extra Row' }],
            });
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('removing rows decreases total pages', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            expect(api.paginationGetTotalPages()).toBe(2);

            api.applyTransaction({
                remove: [{ id: '10' }],
            });
            expect(api.paginationGetTotalPages()).toBe(1);
        });

        test('removing rows that eliminate current page clamps to last valid page', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            api.paginationGoToPage(1); // page 1 has just 1 row
            expect(api.paginationGetCurrentPage()).toBe(1);

            api.applyTransaction({
                remove: [{ id: '10' }],
            });
            // Now only 10 rows = 1 page, page 1 is invalid
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('updating data does not change page count or position', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.applyTransaction({
                update: [{ id: '0', name: 'Updated Row 0' }],
            });
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });
    });

    describe('sorting', () => {
        test('applying sort does not change current page', () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);

            api.applyColumnState({
                state: [{ colId: 'name', sort: 'desc' }],
            });
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('row content on current page reflects sorted order', () => {
            const api = createGrid(gridsManager);

            // Descending sort: Row 9, Row 8, ... Row 49, Row 48, etc. (string sort)
            api.applyColumnState({
                state: [{ colId: 'name', sort: 'desc' }],
            });

            const nodes = api.getRenderedNodes();
            // String sort descending: "Row 9" > "Row 8" > ... (lexicographic)
            const names = nodes.map((n) => n.data.name);
            // Verify the list is in descending string order
            for (let i = 1; i < names.length; i++) {
                expect(names[i - 1] >= names[i]).toBe(true);
            }
        });
    });
});
