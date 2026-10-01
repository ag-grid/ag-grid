import { TestGridsManager, isAgHtmlElementVisible } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

// The missing-module error id, thrown when a dynamic bean's module (here `DateFilterModule`) is not registered.
const MISSING_MODULE_ID = 200;

// Errors the grid throws, rather than logs, must still reach the dev error overlay and `issueRaised`, or
// they only ever appear in the console.
describe('dev validation overlay for thrown errors', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, ValidationModule],
    });
    const rowData = [{ d: new Date(2020, 1, 1) }, { d: new Date(2021, 1, 1) }];
    // The inferred `date` cell data type defaults the column to the date filter, whose module is missing.
    const dateFilterModel = { d: { filterType: 'date', type: 'equals', dateFrom: '2020-02-01' } };
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    const beansOf = (api: GridApi): any => (api.getAllGridColumns()?.[0] as any)?.beans;
    const capturedIds = (api: GridApi): number[] =>
        beansOf(api)
            .errorOverlay.getDiagnostics()
            .map((diagnostic: any) => diagnostic.id);

    const createDateGrid = (id: string, extra: GridOptions = {}): GridApi =>
        gridsManager.createGrid(id, { columnDefs: [{ field: 'd', filter: true }], rowData, ...extra });

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

    test('shows the overlay and raises an issue for a missing filter module', () => {
        enableDevValidations({ showOverlayOn: ['error'] });
        const onIssueRaised = vitest.fn();
        const api = createDateGrid('myGrid', { onIssueRaised });

        expect(() => api.setFilterModel(dateFilterModel)).toThrow(/#200.*DateFilterModule/s);

        expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true);
        expect(onIssueRaised).toHaveBeenCalledWith(
            expect.objectContaining({ id: MISSING_MODULE_ID, severity: 'error', attributedToThisGrid: true })
        );
    });

    test('attributes the thrown error to the grid that threw it', () => {
        enableDevValidations({ showOverlayOn: ['error'] });
        const apiClean = gridsManager.createGrid('cleanGrid', { columnDefs: [{ field: 'd' }], rowData });
        const apiThrowing = createDateGrid('throwingGrid');

        expect(() => apiThrowing.setFilterModel(dateFilterModel)).toThrow();

        expect(capturedIds(apiThrowing)).toContain(MISSING_MODULE_ID);
        expect(capturedIds(apiClean)).not.toContain(MISSING_MODULE_ID);
    });

    test('does not capture a suppressed id, but still throws', () => {
        enableDevValidations({ showOverlayOn: ['error'], suppress: [MISSING_MODULE_ID] });
        const onIssueRaised = vitest.fn();
        const api = createDateGrid('myGrid', { onIssueRaised });

        expect(() => api.setFilterModel(dateFilterModel)).toThrow(/#200/);

        expect(onIssueRaised).not.toHaveBeenCalled();
        expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(false);
    });
});
