import { ALL_SEVERITIES, TestGridsManager, isAgHtmlElementVisible } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

describe('dev validation overlay', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ValidationModule],
    });
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
        vitest.unstubAllGlobals();
    });

    test('does not show the overlay for a clean configuration', () => {
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
        gridsManager.createGrid('myGrid', { columnDefs, rowData });
        expect(hasErrorOverlay()).toBe(false);
    });

    test('shows the overlay when a diagnostic is captured (default showOverlayOn)', () => {
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
        gridsManager.createGrid('myGrid', withUnknownOption());

        expect(hasErrorOverlay()).toBe(true);
        const panel = document.querySelector('.ag-overlay-error-panel');
        expect(panel).not.toBeNull();
        expect(panel!.querySelector('.ag-overlay-error-body')?.childElementCount).toBeGreaterThan(0);
    });

    test('does not show the overlay when showOverlayOn is empty', () => {
        enableDevValidations({ showOverlayOn: [] });
        gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(false);
    });

    test("does not show warnings when showOverlayOn is ['error']", () => {
        enableDevValidations({ showOverlayOn: ['error'] });
        gridsManager.createGrid('myGrid', withUnknownOption());
        // The unknown-property diagnostic is a warning, so it is filtered out in errors-only mode.
        expect(hasErrorOverlay()).toBe(false);
    });

    test("shows warnings when showOverlayOn includes 'warning'", () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        gridsManager.createGrid('myGrid', withUnknownOption());
        // The unknown-property diagnostic is a warning, which the enabled 'warning' severity surfaces.
        expect(hasErrorOverlay()).toBe(true);
    });

    test('can be dismissed', () => {
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
        gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-dismiss')!.click();
        expect(hasErrorOverlay()).toBe(false);
    });

    test('takes priority over an imperative showLoadingOverlay()', () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        const api = gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        api.showLoadingOverlay();

        expect(hasErrorOverlay()).toBe(true);
        expect(isAgHtmlElementVisible('.ag-overlay-loading-wrapper')).toBe(false);
    });

    test('takes priority over an imperative showNoRowsOverlay()', () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        const api = gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        api.showNoRowsOverlay();

        expect(hasErrorOverlay()).toBe(true);
        expect(isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper')).toBe(false);
    });

    test('takes priority over an imperative export overlay', async () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        const api = gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        // Stubbed so the export's blob URL is observable and nothing real is allocated for it.
        const createObjectURL = vitest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
        const revokeObjectURL = vitest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        try {
            api.exportDataAsCsv();

            expect(hasErrorOverlay()).toBe(true);
            expect(isAgHtmlElementVisible('.ag-overlay-exporting-wrapper')).toBe(false);
            // The export itself still runs, it just does not show its overlay.
            expect(createObjectURL).toHaveBeenCalled();

            // Let the download's deferred revokeObjectURL (setTimeout 0) fire
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
        } finally {
            createObjectURL.mockRestore();
            revokeObjectURL.mockRestore();
        }
    });

    test('takes priority over a data-driven loading overlay', () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        // loading=true would normally show the loading overlay, but the captured diagnostic wins.
        gridsManager.createGrid('myGrid', { ...withUnknownOption(), loading: true });

        expect(hasErrorOverlay()).toBe(true);
        expect(isAgHtmlElementVisible('.ag-overlay-loading-wrapper')).toBe(false);
    });

    test('resumes normal overlays after the dev overlay is dismissed', () => {
        enableDevValidations({ showOverlayOn: ['warning', 'error'] });
        const api = gridsManager.createGrid('myGrid', withUnknownOption());
        expect(hasErrorOverlay()).toBe(true);

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-dismiss')!.click();
        expect(hasErrorOverlay()).toBe(false);

        api.showLoadingOverlay();
        expect(isAgHtmlElementVisible('.ag-overlay-loading-wrapper')).toBe(true);
    });

    test('copies diagnostics to the clipboard', () => {
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
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
