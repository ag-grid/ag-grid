import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('new filters tool panel requires enableFilterHandlers', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { id: '1', name: 'Alice', age: 30 },
        { id: '2', name: 'Bob', age: 25 },
    ];
    const columnDefs = [{ field: 'id' }, { field: 'name' }, { field: 'age' }];

    afterEach(() => {
        gridsManager.reset();
        vi.resetAllMocks();
    });

    test('warns #282 and renders an empty panel when enableFilterHandlers is not set', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar: 'filters-new',
        });
        await asyncSetTimeout(50);

        expect(consoleWarnSpy.mock.calls.some((call) => String(call[0]).includes('warning #282'))).toBe(true);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        // grid rendered despite the missing flag
        const gridElement = getGridElement(api);
        expect(gridElement).toBeTruthy();
        expect(api.getToolPanelInstance('filters-new')).toBeTruthy();
        // the tool panel wrapper is rendered in the DOM rather than crashing
        expect(gridElement!.querySelector('.ag-tool-panel-wrapper')).toBeTruthy();

        // No filter applied: both data rows still render despite the missing-flag warning.
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'empty panel: all rows still rendered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30
            └── LEAF id:1 id:"2" name:"Bob" age:25
        `);
    });

    test('does not warn #282 when enableFilterHandlers is set', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar: 'filters-new',
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(50);

        expect(consoleWarnSpy.mock.calls.some((call) => String(call[0]).includes('warning #282'))).toBe(false);
        expect(api.getToolPanelInstance('filters-new')).toBeTruthy();

        // No filter applied: both data rows render with the handlers-enabled panel.
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'handlers enabled: all rows rendered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30
            └── LEAF id:1 id:"2" name:"Bob" age:25
        `);
    });
});
