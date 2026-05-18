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
        paginationPageSizeSelector: false,
        getRowId: (params) => params.data.id,
        ...options,
    });
}

describe('Pagination Page Size', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('default page size', () => {
        test('uses default page size of 100 when paginationPageSize not set', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetPageSize()).toBe(100);
        });

        test('50 rows with default page size shows single page', () => {
            const api = createGrid(gridsManager);
            expect(api.paginationGetTotalPages()).toBe(1);
        });
    });

    describe('paginationPageSize option', () => {
        test('respects configured paginationPageSize', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            expect(api.paginationGetPageSize()).toBe(10);
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('changing paginationPageSize at runtime recalculates pages', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('paginationPageSize', 25);
            expect(api.paginationGetPageSize()).toBe(25);
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('changing paginationPageSize resets to first page if not on page 0', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            api.paginationGoToPage(3);
            expect(api.paginationGetCurrentPage()).toBe(3);

            api.setGridOption('paginationPageSize', 25);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('larger to smaller page size increases total pages', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 25 });
            expect(api.paginationGetTotalPages()).toBe(2);

            api.setGridOption('paginationPageSize', 10);
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('smaller to larger page size decreases total pages', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('paginationPageSize', 50);
            expect(api.paginationGetTotalPages()).toBe(1);
        });
    });

    describe('runtime page size changes', () => {
        test('setGridOption paginationPageSize updates getPageSize', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            expect(api.paginationGetPageSize()).toBe(10);

            api.setGridOption('paginationPageSize', 20);
            expect(api.paginationGetPageSize()).toBe(20);
        });

        test('page content is correct after page size change', () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            const nodesBefore = api.getRenderedNodes();
            expect(nodesBefore).toHaveLength(10);

            api.setGridOption('paginationPageSize', 25);
            const nodesAfter = api.getRenderedNodes();
            expect(nodesAfter).toHaveLength(25);
            expect(nodesAfter[0].data.id).toBe('0');
            expect(nodesAfter[24].data.id).toBe('24');
        });
    });
});
