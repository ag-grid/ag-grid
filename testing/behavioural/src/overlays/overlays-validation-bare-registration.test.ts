import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

// Registering the ValidationModule directly (no enableDevValidations / ValidationModule.with) is the
// low-level opt-in. Its onRegister hook enables diagnostic capture, so the overlay still appears using
// the default 'all' mode. This file never calls enableDevValidations, so the global overlay mode stays
// at its default for these assertions.
describe('dev validation overlay (bare module registration)', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValidationModule] });
    const columnDefs = [{ field: 'athlete' }];
    const rowData = [{ athlete: 'Michael Phelps' }];
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    const withUnknownOption = (): GridOptions =>
        ({ columnDefs, rowData, thisOptionDoesNotExist: true }) as unknown as GridOptions;

    function hasErrorOverlay(): boolean {
        return isAgHtmlElementVisible('.ag-overlay-error-wrapper');
    }

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('shows the overlay for a captured diagnostic without enableDevValidations', () => {
        gridsManager.createGrid('myGrid', withUnknownOption());

        expect(hasErrorOverlay()).toBe(true);
        const panel = document.querySelector('.ag-overlay-error-panel');
        expect(panel).not.toBeNull();
        expect(panel!.querySelector('.ag-overlay-error-body')?.childElementCount).toBeGreaterThan(0);
    });

    test('does not show the overlay for a clean configuration', () => {
        gridsManager.createGrid('myGrid', { columnDefs, rowData });
        expect(hasErrorOverlay()).toBe(false);
    });
});
