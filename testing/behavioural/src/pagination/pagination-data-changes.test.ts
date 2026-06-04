import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, TextFilterModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

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
        test('applying filter reduces total pages', async () => {
            // Rows: "Row 0" to "Row 49". Filter for "Row 1" matches Row 1, 10-19 = 11 rows
            const api = createGrid(gridsManager);
            await new GridColumns(api, `applying filter reduces total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `applying filter reduces total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setFilterModel({ name: { type: 'contains', filter: 'Row 1' } });
            await new GridRows(api, `applying filter reduces total pages after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                └── LEAF id:19 name:"Row 19"
            `);
            expect(api.paginationGetTotalPages()).toBeLessThan(5);
            expect(api.paginationGetRowCount()).toBe(11); // Row 1, Row 10-19
        });

        test('current page maintained if still valid after filter', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `current page maintained if still valid after filter setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `current page maintained if still valid after filter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(1);
            expect(api.paginationGetCurrentPage()).toBe(1);

            // Filter to keep enough rows for 2+ pages
            api.setFilterModel({ name: { type: 'contains', filter: 'Row 1' } });
            await new GridRows(api, `current page maintained if still valid after filter after setFilterModel`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 name:"Row 1"
                    ├── LEAF id:10 name:"Row 10"
                    ├── LEAF id:11 name:"Row 11"
                    ├── LEAF id:12 name:"Row 12"
                    ├── LEAF id:13 name:"Row 13"
                    ├── LEAF id:14 name:"Row 14"
                    ├── LEAF id:15 name:"Row 15"
                    ├── LEAF id:16 name:"Row 16"
                    ├── LEAF id:17 name:"Row 17"
                    ├── LEAF id:18 name:"Row 18"
                    └── LEAF id:19 name:"Row 19"
                `
            );
            // 11 matching rows, page size 10, so 2 pages. Page 1 is still valid.
            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('current page clamped when filter makes it invalid', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `current page clamped when filter makes it invalid setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `current page clamped when filter makes it invalid setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(4); // page 4 of 5
            expect(api.paginationGetCurrentPage()).toBe(4);

            // Filter to very few rows (just "Row 5")
            api.setFilterModel({ name: { type: 'equals', filter: 'Row 5' } });
            await new GridRows(api, `current page clamped when filter makes it invalid after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 name:"Row 5"
            `);
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('clearing filter restores original total pages', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `clearing filter restores original total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `clearing filter restores original total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setFilterModel({ name: { type: 'equals', filter: 'Row 5' } });
            await new GridRows(api, `clearing filter restores original total pages after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 name:"Row 5"
            `);
            expect(api.paginationGetTotalPages()).toBe(1);

            api.setFilterModel(null);
            await new GridRows(api, `clearing filter restores original total pages after setFilterModel #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);
            expect(api.paginationGetRowCount()).toBe(50);
        });

        test('filtering to zero results shows 0 total pages', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `filtering to zero results shows 0 total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `filtering to zero results shows 0 total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);

            api.setFilterModel({ name: { type: 'equals', filter: 'nonexistent' } });
            await new GridRows(api, `filtering to zero results shows 0 total pages after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetTotalPages()).toBe(0);
            expect(api.paginationGetRowCount()).toBe(0);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });

    describe('setRowData', () => {
        test('fewer rows adjusts total pages', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `fewer rows adjusts total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `fewer rows adjusts total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('rowData', makeRowData(15));
            await new GridRows(api, `fewer rows adjusts total pages after setGridOption rowData`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                └── LEAF id:14 name:"Row 14"
            `);
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('more rows increases total pages', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(15) });
            await new GridColumns(api, `more rows increases total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `more rows increases total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                └── LEAF id:14 name:"Row 14"
            `);
            expect(api.paginationGetTotalPages()).toBe(2);

            api.setGridOption('rowData', makeRowData(50));
            await new GridRows(api, `more rows increases total pages after setGridOption rowData`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('empty data shows 0 total pages', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `empty data shows 0 total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `empty data shows 0 total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.setGridOption('rowData', []);
            await new GridRows(api, `empty data shows 0 total pages after setGridOption rowData`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetTotalPages()).toBe(0);
            expect(api.paginationGetRowCount()).toBe(0);
        });

        test('current page clamped if it exceeds new total', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `current page clamped if it exceeds new total setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `current page clamped if it exceeds new total setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(4);
            expect(api.paginationGetCurrentPage()).toBe(4);

            api.setGridOption('rowData', makeRowData(15));
            await new GridRows(api, `current page clamped if it exceeds new total after setGridOption rowData`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"Row 0"
                    ├── LEAF id:1 name:"Row 1"
                    ├── LEAF id:2 name:"Row 2"
                    ├── LEAF id:3 name:"Row 3"
                    ├── LEAF id:4 name:"Row 4"
                    ├── LEAF id:5 name:"Row 5"
                    ├── LEAF id:6 name:"Row 6"
                    ├── LEAF id:7 name:"Row 7"
                    ├── LEAF id:8 name:"Row 8"
                    ├── LEAF id:9 name:"Row 9"
                    ├── LEAF id:10 name:"Row 10"
                    ├── LEAF id:11 name:"Row 11"
                    ├── LEAF id:12 name:"Row 12"
                    ├── LEAF id:13 name:"Row 13"
                    └── LEAF id:14 name:"Row 14"
                `
            ); // 2 pages
            expect(api.paginationGetCurrentPage()).toBeLessThanOrEqual(1);
        });

        test('same row count preserves page position', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `same row count preserves page position setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `same row count preserves page position setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);

            // Replace with same number of rows
            api.setGridOption(
                'rowData',
                Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `New Row ${i}` }))
            );
            await new GridRows(api, `same row count preserves page position after setGridOption rowData`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"New Row 0"
                ├── LEAF id:1 name:"New Row 1"
                ├── LEAF id:2 name:"New Row 2"
                ├── LEAF id:3 name:"New Row 3"
                ├── LEAF id:4 name:"New Row 4"
                ├── LEAF id:5 name:"New Row 5"
                ├── LEAF id:6 name:"New Row 6"
                ├── LEAF id:7 name:"New Row 7"
                ├── LEAF id:8 name:"New Row 8"
                ├── LEAF id:9 name:"New Row 9"
                ├── LEAF id:10 name:"New Row 10"
                ├── LEAF id:11 name:"New Row 11"
                ├── LEAF id:12 name:"New Row 12"
                ├── LEAF id:13 name:"New Row 13"
                ├── LEAF id:14 name:"New Row 14"
                ├── LEAF id:15 name:"New Row 15"
                ├── LEAF id:16 name:"New Row 16"
                ├── LEAF id:17 name:"New Row 17"
                ├── LEAF id:18 name:"New Row 18"
                ├── LEAF id:19 name:"New Row 19"
                ├── LEAF id:20 name:"New Row 20"
                ├── LEAF id:21 name:"New Row 21"
                ├── LEAF id:22 name:"New Row 22"
                ├── LEAF id:23 name:"New Row 23"
                ├── LEAF id:24 name:"New Row 24"
                ├── LEAF id:25 name:"New Row 25"
                ├── LEAF id:26 name:"New Row 26"
                ├── LEAF id:27 name:"New Row 27"
                ├── LEAF id:28 name:"New Row 28"
                ├── LEAF id:29 name:"New Row 29"
                ├── LEAF id:30 name:"New Row 30"
                ├── LEAF id:31 name:"New Row 31"
                ├── LEAF id:32 name:"New Row 32"
                ├── LEAF id:33 name:"New Row 33"
                ├── LEAF id:34 name:"New Row 34"
                ├── LEAF id:35 name:"New Row 35"
                ├── LEAF id:36 name:"New Row 36"
                ├── LEAF id:37 name:"New Row 37"
                ├── LEAF id:38 name:"New Row 38"
                ├── LEAF id:39 name:"New Row 39"
                ├── LEAF id:40 name:"New Row 40"
                ├── LEAF id:41 name:"New Row 41"
                ├── LEAF id:42 name:"New Row 42"
                ├── LEAF id:43 name:"New Row 43"
                ├── LEAF id:44 name:"New Row 44"
                ├── LEAF id:45 name:"New Row 45"
                ├── LEAF id:46 name:"New Row 46"
                ├── LEAF id:47 name:"New Row 47"
                ├── LEAF id:48 name:"New Row 48"
                └── LEAF id:49 name:"New Row 49"
            `);
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });
    });

    describe('transactions', () => {
        test('adding rows increases total pages when threshold crossed', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(10) });
            await new GridColumns(api, `adding rows increases total pages when threshold crossed setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `adding rows increases total pages when threshold crossed setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                └── LEAF id:9 name:"Row 9"
            `);
            expect(api.paginationGetTotalPages()).toBe(1);

            api.applyTransaction({
                add: [{ id: '100', name: 'Extra Row' }],
            });
            await new GridRows(api, `adding rows increases total pages when threshold crossed after applyTransaction`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"Row 0"
                    ├── LEAF id:1 name:"Row 1"
                    ├── LEAF id:2 name:"Row 2"
                    ├── LEAF id:3 name:"Row 3"
                    ├── LEAF id:4 name:"Row 4"
                    ├── LEAF id:5 name:"Row 5"
                    ├── LEAF id:6 name:"Row 6"
                    ├── LEAF id:7 name:"Row 7"
                    ├── LEAF id:8 name:"Row 8"
                    ├── LEAF id:9 name:"Row 9"
                    └── LEAF id:100 name:"Extra Row"
                `);
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('removing rows decreases total pages', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            await new GridColumns(api, `removing rows decreases total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `removing rows decreases total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                └── LEAF id:10 name:"Row 10"
            `);
            expect(api.paginationGetTotalPages()).toBe(2);

            api.applyTransaction({
                remove: [{ id: '10' }],
            });
            await new GridRows(api, `removing rows decreases total pages after applyTransaction`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                └── LEAF id:9 name:"Row 9"
            `);
            expect(api.paginationGetTotalPages()).toBe(1);
        });

        test('removing rows that eliminate current page clamps to last valid page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            await new GridColumns(api, `removing rows that eliminate current page clamps to last valid page setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `removing rows that eliminate current page clamps to last valid page setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"Row 0"
                    ├── LEAF id:1 name:"Row 1"
                    ├── LEAF id:2 name:"Row 2"
                    ├── LEAF id:3 name:"Row 3"
                    ├── LEAF id:4 name:"Row 4"
                    ├── LEAF id:5 name:"Row 5"
                    ├── LEAF id:6 name:"Row 6"
                    ├── LEAF id:7 name:"Row 7"
                    ├── LEAF id:8 name:"Row 8"
                    ├── LEAF id:9 name:"Row 9"
                    └── LEAF id:10 name:"Row 10"
                `
            );
            api.paginationGoToPage(1); // page 1 has just 1 row
            expect(api.paginationGetCurrentPage()).toBe(1);

            api.applyTransaction({
                remove: [{ id: '10' }],
            });
            await new GridRows(
                api,
                `removing rows that eliminate current page clamps to last valid page after applyTransaction`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                └── LEAF id:9 name:"Row 9"
            `);
            // Now only 10 rows = 1 page, page 1 is invalid
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('updating data does not change page count or position', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `updating data does not change page count or position setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `updating data does not change page count or position setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);

            api.applyTransaction({
                update: [{ id: '0', name: 'Updated Row 0' }],
            });
            await new GridRows(api, `updating data does not change page count or position after applyTransaction`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"Updated Row 0"
                    ├── LEAF id:1 name:"Row 1"
                    ├── LEAF id:2 name:"Row 2"
                    ├── LEAF id:3 name:"Row 3"
                    ├── LEAF id:4 name:"Row 4"
                    ├── LEAF id:5 name:"Row 5"
                    ├── LEAF id:6 name:"Row 6"
                    ├── LEAF id:7 name:"Row 7"
                    ├── LEAF id:8 name:"Row 8"
                    ├── LEAF id:9 name:"Row 9"
                    ├── LEAF id:10 name:"Row 10"
                    ├── LEAF id:11 name:"Row 11"
                    ├── LEAF id:12 name:"Row 12"
                    ├── LEAF id:13 name:"Row 13"
                    ├── LEAF id:14 name:"Row 14"
                    ├── LEAF id:15 name:"Row 15"
                    ├── LEAF id:16 name:"Row 16"
                    ├── LEAF id:17 name:"Row 17"
                    ├── LEAF id:18 name:"Row 18"
                    ├── LEAF id:19 name:"Row 19"
                    ├── LEAF id:20 name:"Row 20"
                    ├── LEAF id:21 name:"Row 21"
                    ├── LEAF id:22 name:"Row 22"
                    ├── LEAF id:23 name:"Row 23"
                    ├── LEAF id:24 name:"Row 24"
                    ├── LEAF id:25 name:"Row 25"
                    ├── LEAF id:26 name:"Row 26"
                    ├── LEAF id:27 name:"Row 27"
                    ├── LEAF id:28 name:"Row 28"
                    ├── LEAF id:29 name:"Row 29"
                    ├── LEAF id:30 name:"Row 30"
                    ├── LEAF id:31 name:"Row 31"
                    ├── LEAF id:32 name:"Row 32"
                    ├── LEAF id:33 name:"Row 33"
                    ├── LEAF id:34 name:"Row 34"
                    ├── LEAF id:35 name:"Row 35"
                    ├── LEAF id:36 name:"Row 36"
                    ├── LEAF id:37 name:"Row 37"
                    ├── LEAF id:38 name:"Row 38"
                    ├── LEAF id:39 name:"Row 39"
                    ├── LEAF id:40 name:"Row 40"
                    ├── LEAF id:41 name:"Row 41"
                    ├── LEAF id:42 name:"Row 42"
                    ├── LEAF id:43 name:"Row 43"
                    ├── LEAF id:44 name:"Row 44"
                    ├── LEAF id:45 name:"Row 45"
                    ├── LEAF id:46 name:"Row 46"
                    ├── LEAF id:47 name:"Row 47"
                    ├── LEAF id:48 name:"Row 48"
                    └── LEAF id:49 name:"Row 49"
                `);
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });
    });

    describe('sorting', () => {
        test('applying sort does not change current page', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `applying sort does not change current page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `applying sort does not change current page setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);

            api.applyColumnState({
                state: [{ colId: 'name', sort: 'desc' }],
            });
            await new GridColumns(api, `applying sort does not change current page after applyColumnState`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200 sort:desc
                `);
            await new GridRows(api, `applying sort does not change current page after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:49 name:"Row 49"
                ├── LEAF id:48 name:"Row 48"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:1 name:"Row 1"
                └── LEAF id:0 name:"Row 0"
            `);
            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('row content on current page reflects sorted order', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `row content on current page reflects sorted order setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `row content on current page reflects sorted order setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                ├── LEAF id:4 name:"Row 4"
                ├── LEAF id:5 name:"Row 5"
                ├── LEAF id:6 name:"Row 6"
                ├── LEAF id:7 name:"Row 7"
                ├── LEAF id:8 name:"Row 8"
                ├── LEAF id:9 name:"Row 9"
                ├── LEAF id:10 name:"Row 10"
                ├── LEAF id:11 name:"Row 11"
                ├── LEAF id:12 name:"Row 12"
                ├── LEAF id:13 name:"Row 13"
                ├── LEAF id:14 name:"Row 14"
                ├── LEAF id:15 name:"Row 15"
                ├── LEAF id:16 name:"Row 16"
                ├── LEAF id:17 name:"Row 17"
                ├── LEAF id:18 name:"Row 18"
                ├── LEAF id:19 name:"Row 19"
                ├── LEAF id:20 name:"Row 20"
                ├── LEAF id:21 name:"Row 21"
                ├── LEAF id:22 name:"Row 22"
                ├── LEAF id:23 name:"Row 23"
                ├── LEAF id:24 name:"Row 24"
                ├── LEAF id:25 name:"Row 25"
                ├── LEAF id:26 name:"Row 26"
                ├── LEAF id:27 name:"Row 27"
                ├── LEAF id:28 name:"Row 28"
                ├── LEAF id:29 name:"Row 29"
                ├── LEAF id:30 name:"Row 30"
                ├── LEAF id:31 name:"Row 31"
                ├── LEAF id:32 name:"Row 32"
                ├── LEAF id:33 name:"Row 33"
                ├── LEAF id:34 name:"Row 34"
                ├── LEAF id:35 name:"Row 35"
                ├── LEAF id:36 name:"Row 36"
                ├── LEAF id:37 name:"Row 37"
                ├── LEAF id:38 name:"Row 38"
                ├── LEAF id:39 name:"Row 39"
                ├── LEAF id:40 name:"Row 40"
                ├── LEAF id:41 name:"Row 41"
                ├── LEAF id:42 name:"Row 42"
                ├── LEAF id:43 name:"Row 43"
                ├── LEAF id:44 name:"Row 44"
                ├── LEAF id:45 name:"Row 45"
                ├── LEAF id:46 name:"Row 46"
                ├── LEAF id:47 name:"Row 47"
                ├── LEAF id:48 name:"Row 48"
                └── LEAF id:49 name:"Row 49"
            `);

            // Descending sort: Row 9, Row 8, ... Row 49, Row 48, etc. (string sort)
            api.applyColumnState({
                state: [{ colId: 'name', sort: 'desc' }],
            });
            await new GridColumns(api, `row content on current page reflects sorted order after applyColumnState`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200 sort:desc
                `);
            await new GridRows(api, `row content on current page reflects sorted order after applyColumnState`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:9 name:"Row 9"
                    ├── LEAF id:8 name:"Row 8"
                    ├── LEAF id:7 name:"Row 7"
                    ├── LEAF id:6 name:"Row 6"
                    ├── LEAF id:5 name:"Row 5"
                    ├── LEAF id:49 name:"Row 49"
                    ├── LEAF id:48 name:"Row 48"
                    ├── LEAF id:47 name:"Row 47"
                    ├── LEAF id:46 name:"Row 46"
                    ├── LEAF id:45 name:"Row 45"
                    ├── LEAF id:44 name:"Row 44"
                    ├── LEAF id:43 name:"Row 43"
                    ├── LEAF id:42 name:"Row 42"
                    ├── LEAF id:41 name:"Row 41"
                    ├── LEAF id:40 name:"Row 40"
                    ├── LEAF id:4 name:"Row 4"
                    ├── LEAF id:39 name:"Row 39"
                    ├── LEAF id:38 name:"Row 38"
                    ├── LEAF id:37 name:"Row 37"
                    ├── LEAF id:36 name:"Row 36"
                    ├── LEAF id:35 name:"Row 35"
                    ├── LEAF id:34 name:"Row 34"
                    ├── LEAF id:33 name:"Row 33"
                    ├── LEAF id:32 name:"Row 32"
                    ├── LEAF id:31 name:"Row 31"
                    ├── LEAF id:30 name:"Row 30"
                    ├── LEAF id:3 name:"Row 3"
                    ├── LEAF id:29 name:"Row 29"
                    ├── LEAF id:28 name:"Row 28"
                    ├── LEAF id:27 name:"Row 27"
                    ├── LEAF id:26 name:"Row 26"
                    ├── LEAF id:25 name:"Row 25"
                    ├── LEAF id:24 name:"Row 24"
                    ├── LEAF id:23 name:"Row 23"
                    ├── LEAF id:22 name:"Row 22"
                    ├── LEAF id:21 name:"Row 21"
                    ├── LEAF id:20 name:"Row 20"
                    ├── LEAF id:2 name:"Row 2"
                    ├── LEAF id:19 name:"Row 19"
                    ├── LEAF id:18 name:"Row 18"
                    ├── LEAF id:17 name:"Row 17"
                    ├── LEAF id:16 name:"Row 16"
                    ├── LEAF id:15 name:"Row 15"
                    ├── LEAF id:14 name:"Row 14"
                    ├── LEAF id:13 name:"Row 13"
                    ├── LEAF id:12 name:"Row 12"
                    ├── LEAF id:11 name:"Row 11"
                    ├── LEAF id:10 name:"Row 10"
                    ├── LEAF id:1 name:"Row 1"
                    └── LEAF id:0 name:"Row 0"
                `
            );

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
