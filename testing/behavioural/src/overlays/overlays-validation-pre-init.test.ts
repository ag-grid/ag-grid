import { ALL_SEVERITIES, TestGridsManager, isAgHtmlElementVisible } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, ValidationModule, enableDevValidations } from 'ag-grid-community';
import { IntegratedChartsModule, SparklinesModule } from 'ag-grid-enterprise';

describe('dev validation overlay for pre-init errors', () => {
    const columnDefs = [{ field: 'athlete' }];
    const rowData = [{ athlete: 'Michael Phelps' }];
    let consoleErrorSpy: MockInstance;

    const overlayBodyText = () => document.querySelector('.ag-overlay-error-body')?.textContent ?? '';

    beforeEach(() => {
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    // Registering the module without `.with()` fails its `validate()` before any grid exists, so the
    // diagnostic has to survive registration to be shown once the grid starts up.
    test.each([
        ['IntegratedChartsModule', IntegratedChartsModule, '257'],
        ['SparklinesModule', SparklinesModule, '258'],
    ])('shows the missing AG Charts error for %s registered without with()', (_name, module, errorId) => {
        const gridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, ValidationModule, module],
        });

        gridsManager.createGrid('myGrid', { columnDefs, rowData });

        expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true);
        expect(overlayBodyText()).toContain(errorId);

        gridsManager.reset();
    });
});
