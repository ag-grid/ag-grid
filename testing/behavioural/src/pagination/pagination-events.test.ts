import type { GridOptions, PaginationChangedEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });

        test('goToNextPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToNextPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });

        test('goToPreviousPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPreviousPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });

        test('goToFirstPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            api.paginationGoToPage(3);
            await asyncSetTimeout(0);

            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToFirstPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });

        test('goToLastPage fires paginationChanged with newPage=true', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToLastPage();
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });

        test('goToPage with same page does not fire event', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(0);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(0);
        });

        test('navigation event has newPageSize=false', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events[0].newPageSize).toBeFalsy();
        });
    });

    describe('page size change events', () => {
        test('changing paginationPageSize fires event with newPageSize=true', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('paginationPageSize', 25);
            await asyncSetTimeout(0);

            const pageSizeEvents = events.filter((e) => e.newPageSize);
            expect(pageSizeEvents.length).toBeGreaterThanOrEqual(1);
            expect(pageSizeEvents[0].newPageSize).toBe(true);
        });

        test('page size change event has keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('paginationPageSize', 25);
            await asyncSetTimeout(0);

            const pageSizeEvents = events.filter((e) => e.newPageSize);
            expect(pageSizeEvents[0].keepRenderedRows).toBe(true);
        });
    });

    describe('pagination toggle events', () => {
        test('enabling pagination fires paginationChanged with keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager, { pagination: false });
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('pagination', true);
            await asyncSetTimeout(0);

            expect(events.length).toBeGreaterThanOrEqual(1);
            expect(events[0].keepRenderedRows).toBe(true);
        });

        test('disabling pagination fires paginationChanged with keepRenderedRows=true', async () => {
            const api = createGrid(gridsManager);
            const events: PaginationChangedEvent[] = [];
            api.addEventListener('paginationChanged', (e) => events.push(e));

            api.setGridOption('pagination', false);
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
            await asyncSetTimeout(0);

            // Clear any init events
            events.length = 0;

            api.paginationGoToPage(2);
            await asyncSetTimeout(0);

            expect(events).toHaveLength(1);
            expect(events[0].newPage).toBe(true);
        });
    });
});
