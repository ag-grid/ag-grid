import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

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
        test('uses default page size of 100 when paginationPageSize not set', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `uses default page size of 100 when paginationPageSize not set setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `uses default page size of 100 when paginationPageSize not set setup`).check(`
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
            expect(api.paginationGetPageSize()).toBe(100);
            await new GridRows(api, `uses default page size of 100 when paginationPageSize not set final state`).check(
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
                `
            );
        });

        test('50 rows with default page size shows single page', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `50 rows with default page size shows single page setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `50 rows with default page size shows single page setup`).check(`
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
            expect(api.paginationGetTotalPages()).toBe(1);
            await new GridRows(api, `50 rows with default page size shows single page final state`).check(`
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

    describe('paginationPageSize option', () => {
        test('respects configured paginationPageSize', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `respects configured paginationPageSize setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `respects configured paginationPageSize setup`).check(`
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
            expect(api.paginationGetPageSize()).toBe(10);
            expect(api.paginationGetTotalPages()).toBe(5);
            await new GridRows(api, `respects configured paginationPageSize final state`).check(`
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

        test('changing paginationPageSize at runtime recalculates pages', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `changing paginationPageSize at runtime recalculates pages setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `changing paginationPageSize at runtime recalculates pages setup`).check(`
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

            api.setGridOption('paginationPageSize', 25);
            await new GridColumns(
                api,
                `changing paginationPageSize at runtime recalculates pages after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `changing paginationPageSize at runtime recalculates pages after setGridOption paginationPageSize`
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
            expect(api.paginationGetPageSize()).toBe(25);
            expect(api.paginationGetTotalPages()).toBe(2);
        });

        test('changing paginationPageSize resets to first page if not on page 0', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `changing paginationPageSize resets to first page if not on page 0 setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `changing paginationPageSize resets to first page if not on page 0 setup`).check(
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
                `
            );
            api.paginationGoToPage(3);
            expect(api.paginationGetCurrentPage()).toBe(3);

            api.setGridOption('paginationPageSize', 25);
            await new GridColumns(
                api,
                `changing paginationPageSize resets to first page if not on page 0 after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `changing paginationPageSize resets to first page if not on page 0 after setGridOption paginationPageSize`
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
        });

        test('larger to smaller page size increases total pages', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 25 });
            await new GridColumns(api, `larger to smaller page size increases total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `larger to smaller page size increases total pages setup`).check(`
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
            expect(api.paginationGetTotalPages()).toBe(2);

            api.setGridOption('paginationPageSize', 10);
            await new GridColumns(
                api,
                `larger to smaller page size increases total pages after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `larger to smaller page size increases total pages after setGridOption paginationPageSize`
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
            expect(api.paginationGetTotalPages()).toBe(5);
        });

        test('smaller to larger page size decreases total pages', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `smaller to larger page size decreases total pages setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `smaller to larger page size decreases total pages setup`).check(`
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

            api.setGridOption('paginationPageSize', 50);
            await new GridColumns(
                api,
                `smaller to larger page size decreases total pages after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `smaller to larger page size decreases total pages after setGridOption paginationPageSize`
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
            expect(api.paginationGetTotalPages()).toBe(1);
        });
    });

    describe('runtime page size changes', () => {
        test('setGridOption paginationPageSize updates getPageSize', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `setGridOption paginationPageSize updates getPageSize setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `setGridOption paginationPageSize updates getPageSize setup`).check(`
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
            expect(api.paginationGetPageSize()).toBe(10);

            api.setGridOption('paginationPageSize', 20);
            await new GridColumns(
                api,
                `setGridOption paginationPageSize updates getPageSize after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `setGridOption paginationPageSize updates getPageSize after setGridOption paginationPageSize`
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
            expect(api.paginationGetPageSize()).toBe(20);
        });

        test('page content is correct after page size change', async () => {
            const api = createGrid(gridsManager, { paginationPageSize: 10 });
            await new GridColumns(api, `page content is correct after page size change setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `page content is correct after page size change setup`).check(`
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
            const nodesBefore = api.getRenderedNodes();
            expect(nodesBefore).toHaveLength(10);

            api.setGridOption('paginationPageSize', 25);
            await new GridColumns(
                api,
                `page content is correct after page size change after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `page content is correct after page size change after setGridOption paginationPageSize`
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
            const nodesAfter = api.getRenderedNodes();
            expect(nodesAfter).toHaveLength(25);
            expect(nodesAfter[0].data.id).toBe('0');
            expect(nodesAfter[24].data.id).toBe('24');
        });
    });
});
