import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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
        expect(getGridElement(api)).toBeTruthy();
        const toolPanel = api.getToolPanelInstance('filters-new') as any;
        expect(toolPanel).toBeTruthy();
        expect(toolPanel.getGui()).toBeInstanceOf(HTMLElement);
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
    });
});
