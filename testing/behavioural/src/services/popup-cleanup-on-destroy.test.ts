import type { ColDef, GridOptions } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

const columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }];
const rowData = [{ a: 1, b: 2 }];

describe('ag-grid popup cleanup on destroy', () => {
    const gridsManager = new TestGridsManager({
        modules: [ColumnMenuModule],
    });

    // jsdom has no layout engine, so offsetParent and dimensions are all 0.
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
