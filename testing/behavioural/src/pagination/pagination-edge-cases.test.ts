import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, getGridElement } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

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
        test('no row data shows 0 total pages', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            await new GridColumns(api, `no row data shows 0 total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `no row data shows 0 total pages setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetTotalPages()).toBe(0);
            await new GridRows(api, `no row data shows 0 total pages final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('paginationGetCurrentPage returns 0 with no data', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            await new GridColumns(api, `paginationGetCurrentPage returns 0 with no data setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `paginationGetCurrentPage returns 0 with no data setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetCurrentPage()).toBe(0);
            await new GridRows(api, `paginationGetCurrentPage returns 0 with no data final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('paginationGetRowCount returns 0 with no data', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            await new GridColumns(api, `paginationGetRowCount returns 0 with no data setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `paginationGetRowCount returns 0 with no data setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetRowCount()).toBe(0);
            await new GridRows(api, `paginationGetRowCount returns 0 with no data final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('navigation methods are no-op with no data', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            await new GridColumns(api, `navigation methods are no-op with no data setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `navigation methods are no-op with no data setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToPage(5);
            expect(api.paginationGetCurrentPage()).toBe(0);
            await new GridRows(api, `navigation methods are no-op with no data final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('setting row data after empty initializes pagination', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            await new GridColumns(api, `setting row data after empty initializes pagination setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `setting row data after empty initializes pagination setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.paginationGetTotalPages()).toBe(0);

            api.setGridOption('rowData', makeRowData(25));
            await new GridRows(api, `setting row data after empty initializes pagination after setGridOption rowData`)
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
                    └── LEAF id:24 name:"Row 24"
                `);
            expect(api.paginationGetTotalPages()).toBe(3);
            expect(api.paginationGetRowCount()).toBe(25);
            expect(api.getRenderedNodes()).toHaveLength(10);
        });
    });

    describe('single row', () => {
        test('single row with pageSize 10 shows 1 page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(1) });
            await new GridColumns(api, `single row with pageSize 10 shows 1 page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `single row with pageSize 10 shows 1 page setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Row 0"
            `);
            expect(api.paginationGetTotalPages()).toBe(1);
            expect(api.getRenderedNodes()).toHaveLength(1);
            await new GridRows(api, `single row with pageSize 10 shows 1 page final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Row 0"
            `);
        });

        test('navigation is no-op with single page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(1) });
            await new GridColumns(api, `navigation is no-op with single page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `navigation is no-op with single page setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Row 0"
            `);
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            await new GridRows(api, `navigation is no-op with single page final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Row 0"
            `);
        });
    });

    describe('exact page boundary', () => {
        test('10 rows with pageSize 10 shows exactly 1 page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(10) });
            await new GridColumns(api, `10 rows with pageSize 10 shows exactly 1 page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `10 rows with pageSize 10 shows exactly 1 page setup`).check(`
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
            await new GridRows(api, `10 rows with pageSize 10 shows exactly 1 page final state`).check(`
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
        });

        test('11 rows with pageSize 10 shows exactly 2 pages', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(11) });
            await new GridColumns(api, `11 rows with pageSize 10 shows exactly 2 pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `11 rows with pageSize 10 shows exactly 2 pages setup`).check(`
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
            await new GridRows(api, `11 rows with pageSize 10 shows exactly 2 pages final state`).check(`
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
        });

        test('20 rows with pageSize 10 shows exactly 2 pages', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(20) });
            await new GridColumns(api, `20 rows with pageSize 10 shows exactly 2 pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `20 rows with pageSize 10 shows exactly 2 pages setup`).check(`
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
                └── LEAF id:19 name:"Row 19"
            `);
            expect(api.paginationGetTotalPages()).toBe(2);
            await new GridRows(api, `20 rows with pageSize 10 shows exactly 2 pages final state`).check(`
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
                └── LEAF id:19 name:"Row 19"
            `);
        });
    });

    describe('page size of 1', () => {
        test('pageSize 1 creates one page per row', async () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(5),
                paginationPageSize: 1,
            });
            await new GridColumns(api, `pageSize 1 creates one page per row setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `pageSize 1 creates one page per row setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                └── LEAF id:4 name:"Row 4"
            `);
            expect(api.paginationGetTotalPages()).toBe(5);
            expect(api.getRenderedNodes()).toHaveLength(1);
            await new GridRows(api, `pageSize 1 creates one page per row final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                └── LEAF id:4 name:"Row 4"
            `);
        });

        test('navigation works with pageSize 1', async () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(5),
                paginationPageSize: 1,
            });
            await new GridColumns(api, `navigation works with pageSize 1 setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `navigation works with pageSize 1 setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                └── LEAF id:4 name:"Row 4"
            `);

            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(1);
            expect(api.getRenderedNodes()[0].data.id).toBe('1');

            api.paginationGoToLastPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
            expect(api.getRenderedNodes()[0].data.id).toBe('4');
            await new GridRows(api, `navigation works with pageSize 1 final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Row 0"
                ├── LEAF id:1 name:"Row 1"
                ├── LEAF id:2 name:"Row 2"
                ├── LEAF id:3 name:"Row 3"
                └── LEAF id:4 name:"Row 4"
            `);
        });
    });

    describe('page invalidation', () => {
        test('removing data to fewer pages clamps current page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `removing data to fewer pages clamps current page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `removing data to fewer pages clamps current page setup`).check(`
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
            api.paginationGoToPage(4); // last page of 5
            expect(api.paginationGetCurrentPage()).toBe(4);

            api.setGridOption('rowData', makeRowData(15));
            await new GridRows(api, `removing data to fewer pages clamps current page after setGridOption rowData`)
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
                    ├── LEAF id:10 name:"Row 10"
                    ├── LEAF id:11 name:"Row 11"
                    ├── LEAF id:12 name:"Row 12"
                    ├── LEAF id:13 name:"Row 13"
                    └── LEAF id:14 name:"Row 14"
                `); // now 2 pages
            expect(api.paginationGetCurrentPage()).toBeLessThanOrEqual(1);
        });

        test('data shrink eliminating last page adjusts correctly', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(30) });
            await new GridColumns(api, `data shrink eliminating last page adjusts correctly setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `data shrink eliminating last page adjusts correctly setup`).check(`
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
                └── LEAF id:29 name:"Row 29"
            `);
            api.paginationGoToPage(2); // page 2 of 3
            expect(api.paginationGetCurrentPage()).toBe(2);

            api.setGridOption('rowData', makeRowData(20));
            await new GridRows(api, `data shrink eliminating last page adjusts correctly after setGridOption rowData`)
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
                `); // now 2 pages (0-1)
            expect(api.paginationGetCurrentPage()).toBe(1); // clamped to last valid page
        });
    });

    describe('pagination toggle', () => {
        test('disabling pagination shows all rows', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `disabling pagination shows all rows setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `disabling pagination shows all rows setup`).check(`
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
            expect(api.getRenderedNodes()).toHaveLength(10); // page size = 10

            api.setGridOption('pagination', false);
            await new GridColumns(api, `disabling pagination shows all rows after setGridOption pagination`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `disabling pagination shows all rows after setGridOption pagination`).check(`
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
            expect(api.getRenderedNodes()).toHaveLength(50);
        });

        test('re-enabling pagination restores paged view from page 0', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `re-enabling pagination restores paged view from page 0 setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `re-enabling pagination restores paged view from page 0 setup`).check(`
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
            api.paginationGoToPage(3);

            api.setGridOption('pagination', false);
            await new GridColumns(
                api,
                `re-enabling pagination restores paged view from page 0 after setGridOption pagination`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `re-enabling pagination restores paged view from page 0 after setGridOption pagination`
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
            api.setGridOption('pagination', true);
            await new GridColumns(
                api,
                `re-enabling pagination restores paged view from page 0 after setGridOption pagination #2`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `re-enabling pagination restores paged view from page 0 after setGridOption pagination #2`
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

            expect(api.paginationGetCurrentPage()).toBe(0);
            expect(api.getRenderedNodes()).toHaveLength(10);
        });
    });

    describe('paginationNumberFormatter', () => {
        test('formats numbers in pagination panel', async () => {
            const api = createGrid(gridsManager, {
                rowData: makeRowData(50),
                paginationNumberFormatter: (params) => `[${params.value}]`,
            });
            await new GridColumns(api, `formats numbers in pagination panel setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `formats numbers in pagination panel setup`).check(`
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
            const panel = getGridElement(api)!.querySelector('.ag-paging-panel');
            const rowNumbers = panel!.querySelectorAll('.ag-paging-row-summary-panel-number');

            // Formatted values should use the custom formatter
            expect(rowNumbers[0].textContent).toBe('[1]');
            expect(rowNumbers[1].textContent).toBe('[10]');
            expect(rowNumbers[2].textContent).toBe('[50]');
            await new GridRows(api, `formats numbers in pagination panel final state`).check(`
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
        });
    });

    describe('rapid navigation', () => {
        test('multiple goToPage calls land on final page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `multiple goToPage calls land on final page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `multiple goToPage calls land on final page setup`).check(`
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
            api.paginationGoToPage(3);
            api.paginationGoToPage(2);
            expect(api.paginationGetCurrentPage()).toBe(2);
            await new GridRows(api, `multiple goToPage calls land on final page final state`).check(`
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
        });

        test('goToNextPage past last page stays on last page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `goToNextPage past last page stays on last page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToNextPage past last page stays on last page setup`).check(`
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
            api.paginationGoToPage(4); // last page
            api.paginationGoToNextPage();
            api.paginationGoToNextPage();
            api.paginationGoToNextPage();
            expect(api.paginationGetCurrentPage()).toBe(4);
            await new GridRows(api, `goToNextPage past last page stays on last page final state`).check(`
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
        });

        test('goToPreviousPage below 0 stays on page 0', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(50) });
            await new GridColumns(api, `goToPreviousPage below 0 stays on page 0 setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToPreviousPage below 0 stays on page 0 setup`).check(`
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
            api.paginationGoToPreviousPage();
            api.paginationGoToPreviousPage();
            api.paginationGoToPreviousPage();
            expect(api.paginationGetCurrentPage()).toBe(0);
            await new GridRows(api, `goToPreviousPage below 0 stays on page 0 final state`).check(`
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
        });
    });
});
