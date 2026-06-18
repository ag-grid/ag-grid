import type { GridOptions, PaginationChangedEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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

describe('Pagination Events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('navigation events', () => {
        test('goToPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToPage fires paginationChanged with newPage=true setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToPage fires paginationChanged with newPage=true setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `goToPage fires paginationChanged with newPage=true final state`).check(`
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

        test('goToNextPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToNextPage fires paginationChanged with newPage=true setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToNextPage fires paginationChanged with newPage=true setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToNextPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `goToNextPage fires paginationChanged with newPage=true final state`).check(`
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

        test('goToPreviousPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToPreviousPage fires paginationChanged with newPage=true setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `goToPreviousPage fires paginationChanged with newPage=true setup`).check(`
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
            await asyncSetTimeout(0);

            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPreviousPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `goToPreviousPage fires paginationChanged with newPage=true final state`).check(`
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

        test('goToFirstPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToFirstPage fires paginationChanged with newPage=true setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `goToFirstPage fires paginationChanged with newPage=true setup`).check(`
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
            await asyncSetTimeout(0);

            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToFirstPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `goToFirstPage fires paginationChanged with newPage=true final state`).check(`
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

        test('goToLastPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToLastPage fires paginationChanged with newPage=true setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToLastPage fires paginationChanged with newPage=true setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToLastPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `goToLastPage fires paginationChanged with newPage=true final state`).check(`
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

        test('goToPage with same page does not fire event', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `goToPage with same page does not fire event setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `goToPage with same page does not fire event setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(0);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(0);
            await new GridRows(api, `goToPage with same page does not fire event final state`).check(`
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

        test('navigation event has newPageSize=false', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `navigation event has newPageSize=false setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `navigation event has newPageSize=false setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events[0].newPageSize).toBeFalsy();
            await new GridRows(api, `navigation event has newPageSize=false final state`).check(`
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

    describe('page size change events', () => {
        test('changing paginationPageSize fires event with newPageSize=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `changing paginationPageSize fires event with newPageSize=true setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `changing paginationPageSize fires event with newPageSize=true setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('paginationPageSize', 25);
            await new GridColumns(
                api,
                `changing paginationPageSize fires event with newPageSize=true after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `changing paginationPageSize fires event with newPageSize=true after setGridOption paginationPageSize`
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
            await asyncSetTimeout(0);

            const pageSizeEvents = events.filter((e) => e.newPageSize);
            expect(pageSizeEvents.length).toBeGreaterThanOrEqual(1);
            expect(pageSizeEvents[0].newPageSize).toBe(true);
        });

        test('page size change event has keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `page size change event has keepRenderedRows=true setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `page size change event has keepRenderedRows=true setup`).check(`
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('paginationPageSize', 25);
            await new GridColumns(
                api,
                `page size change event has keepRenderedRows=true after setGridOption paginationPageSize`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `page size change event has keepRenderedRows=true after setGridOption paginationPageSize`
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
            await asyncSetTimeout(0);

            const pageSizeEvents = events.filter((e) => e.newPageSize);
            expect(pageSizeEvents[0].keepRenderedRows).toBe(true);
        });
    });

    describe('pagination toggle events', () => {
        test('enabling pagination fires paginationChanged with keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager, { pagination: false });
            await new GridColumns(api, `enabling pagination fires paginationChanged with keepRenderedRows=true setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `enabling pagination fires paginationChanged with keepRenderedRows=true setup`)
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('pagination', true);
            await new GridColumns(
                api,
                `enabling pagination fires paginationChanged with keepRenderedRows=true after setGridOption pagination`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `enabling pagination fires paginationChanged with keepRenderedRows=true after setGridOption pagination`
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
            await asyncSetTimeout(0);

            expect(events.length).toBeGreaterThanOrEqual(1);
            expect(events[0].keepRenderedRows).toBe(true);
        });

        test('disabling pagination fires paginationChanged with keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager);
            await new GridColumns(api, `disabling pagination fires paginationChanged with keepRenderedRows=true setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `disabling pagination fires paginationChanged with keepRenderedRows=true setup`)
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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('pagination', false);
            await new GridColumns(
                api,
                `disabling pagination fires paginationChanged with keepRenderedRows=true after setGridOption pagination`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(
                api,
                `disabling pagination fires paginationChanged with keepRenderedRows=true after setGridOption pagination`
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
            await asyncSetTimeout(0);

            expect(events.length).toBeGreaterThanOrEqual(1);
            expect(events[0].keepRenderedRows).toBe(true);
        });
    });

    describe('onPaginationChanged callback', () => {
        test('onPaginationChanged gridOption callback receives events', async () => {
            const events: PaginationChangedEvent[] = [];
            const api = createGrid(gridsManager, {
                onPaginationChanged: (e) => events.push(e),
            });
            await new GridColumns(api, `onPaginationChanged gridOption callback receives events setup`).checkColumns(
                `
                    CENTER
                    └── name "Name" width:200
                `
            );
            await new GridRows(api, `onPaginationChanged gridOption callback receives events setup`).check(`
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
            await asyncSetTimeout(0);

            // Clear any init events
            events.length = 0;

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
            await new GridRows(api, `onPaginationChanged gridOption callback receives events final state`).check(`
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
