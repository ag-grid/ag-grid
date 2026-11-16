import { GridColumns, GridRows, TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridOptions } from 'ag-grid-community';
import { TextFilterModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

const columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }];
const rowData = [{ a: 1, b: 2 }];

describe('ag-grid popup cleanup on destroy', () => {
    const gridsManager = new TestGridsManager({
        modules: [ColumnMenuModule],
    });

    // happy-dom has no layout engine, so offsetParent and dimensions are all 0.
    // The column chooser dialog needs these to position itself.
    const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            get() {
                return this.parentNode;
            },
            configurable: true,
        });
    });

    afterAll(() => {
        if (originalOffsetParent) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
        } else {
            delete (HTMLElement.prototype as any).offsetParent;
        }
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('popups are removed from DOM when grid is destroyed', async () => {
        const popupParent = document.createElement('div');
        document.body.appendChild(popupParent);

        const gridOptions: GridOptions = {
            columnDefs,
            rowData,
            popupParent,
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `popups are removed from DOM when grid is destroyed setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);
        await new GridRows(api, `popups are removed from DOM when grid is destroyed setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:1 b:2
        `);

        // Open the column chooser popup
        api.showColumnChooser();

        expect(popupParent.querySelectorAll('.ag-popup').length).toBeGreaterThan(0);

        // Destroy the grid
        api.destroy();

        // All popup elements should have been removed from the popup parent
        expect(popupParent.querySelectorAll('.ag-popup').length).toBe(0);

        popupParent.remove();
    });

    test('destroying the grid stops repositioning its open filter popup', async () => {
        const api = await gridsManager.createGridAndWait(
            null,
            { columnDefs: [{ field: 'a', filter: 'agTextColumnFilter' }], rowData },
            { modules: [TextFilterModule] }
        );
        vi.useFakeTimers();
        try {
            api.showColumnFilter('a');
            await vi.advanceTimersByTimeAsync(500);
            expect(document.querySelectorAll('.ag-popup').length).toBe(1);
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            api.destroy();
            await vi.advanceTimersByTimeAsync(1000);
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test.each([
        ['a filter popup open after its listeners attach', 'filter', 500],
        ['the column chooser open in the tick it opened', 'chooser', 0],
    ] as const)('destroying the grid with %s leaves no listener on the document', async (_case, popup, openFor) => {
        const live = new Set<unknown>();
        const add = document.addEventListener.bind(document);
        const remove = document.removeEventListener.bind(document);
        vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
            live.add(listener);
            add(type, listener, options);
        });
        vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
            live.delete(listener);
            remove(type, listener, options);
        });
        const api = await gridsManager.createGridAndWait(
            null,
            { columnDefs: [{ field: 'a', filter: 'agTextColumnFilter' }], rowData },
            { modules: [TextFilterModule] }
        );
        vi.useFakeTimers();
        try {
            if (popup === 'filter') {
                api.showColumnFilter('a');
            } else {
                api.showColumnChooser();
            }
            if (openFor > 0) {
                await vi.advanceTimersByTimeAsync(openFor);
            }
            expect(document.querySelectorAll('.ag-popup').length).toBe(1);
            api.destroy();
            await vi.advanceTimersByTimeAsync(1000);
            expect(live.size).toBe(0);
        } finally {
            vi.useRealTimers();
            vi.restoreAllMocks();
        }
    });

    test('no duplicate popups after grid remount', () => {
        const popupParent = document.createElement('div');
        document.body.appendChild(popupParent);

        const container = document.createElement('div');
        document.body.appendChild(container);

        const gridOptions: GridOptions = {
            columnDefs,
            rowData,
            popupParent,
        };

        // First grid: open column chooser then destroy
        const api1 = gridsManager.createGrid(container, gridOptions);
        api1.showColumnChooser();
        expect(popupParent.querySelectorAll('.ag-popup').length).toBeGreaterThan(0);
        api1.destroy();

        // Second grid: open column chooser
        const api2 = gridsManager.createGrid(container, gridOptions);
        api2.showColumnChooser();

        // Should only have popups from the second grid, not leftover from the first
        expect(popupParent.querySelectorAll('.ag-popup').length).toBe(1);

        api2.destroy();
        popupParent.remove();
        container.remove();
    });
});
