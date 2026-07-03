import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('dev validation overlay', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValidationModule] });
    const columnDefs = [{ field: 'athlete' }];
    const rowData = [{ athlete: 'Michael Phelps' }];
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    // A grid option that is not a recognised property; emits an "invalid property" warning at init.
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

    test('does not show the overlay for a clean configuration', () => {
        enableDevValidations({ overlay: 'deprecation' });
        gridsManager.createGrid('myGrid', { columnDefs, rowData });
        expect(hasErrorOverlay()).toBe(false);
    });

    test("shows the overlay when a diagnostic is captured (overlay: 'deprecation')", () => {
        enableDevValidations({ overlay: 'deprecation' });
        gridsManager.createGrid('myGrid', withUnknownOption());

        expect(hasErrorOverlay()).toBe(true);
        const panel = document.querySelector('.ag-overlay-error-panel');
        expect(panel).not.toBeNull();
        expect(panel!.querySelector('.ag-overlay-error-body')?.childElementCount).toBeGreaterThan(0);
    });

    test('does not show the overlay when overlay is false', () => {
        enableDevValidations({ overlay: false });
        gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(false);
    });

    test("does not show warnings when overlay is 'error'", () => {
        enableDevValidations({ overlay: 'error' });
        gridsManager.createGrid('myGrid', withUnknownOption());
        // The unknown-property diagnostic is a warning, so it is filtered out in errors-only mode.
        expect(hasErrorOverlay()).toBe(false);
    });

    test("shows warnings when overlay is 'warning'", () => {
        enableDevValidations({ overlay: 'warning' });
        gridsManager.createGrid('myGrid', withUnknownOption());
        // The unknown-property diagnostic is a warning, which the inclusive 'warning' threshold surfaces.
        expect(hasErrorOverlay()).toBe(true);
    });

    test('can be dismissed', () => {
        enableDevValidations({ overlay: 'deprecation' });
        gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-dismiss')!.click();
        expect(hasErrorOverlay()).toBe(false);
    });

    test('copies diagnostics to the clipboard', () => {
        enableDevValidations({ overlay: 'deprecation' });
        gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        const writeText = vitest.fn().mockResolvedValue(undefined);
        vitest.stubGlobal('navigator', { clipboard: { writeText } });

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-copy')!.click();
        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0][0]).toContain('#');

        vitest.unstubAllGlobals();
    });
});
