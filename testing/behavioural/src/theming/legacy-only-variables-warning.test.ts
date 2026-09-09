import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, enableDevValidations, themeQuartz } from 'ag-grid-community';

/**
 * The Theming API does not read the v32 legacy theme variables, so setting one has no effect - a
 * "compact" preset built from `--ag-grid-size` looks like a row-height bug rather than an ignored
 * variable. Loading the legacy stylesheet alongside is the separate error #106/#239.
 */
describe('legacy-only theme variables under the Theming API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        // this file asserts on validation diagnostics, so the global throw-on-validation must be off
        enableDevValidations({ throwOn: [] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
    });

    const gridOptions = { columnDefs: [{ field: 'a' }], rowData: [{ a: 1 }] };

    /**
     * The grid resolves variables on its styled root, and happy-dom does not inherit custom
     * properties, so they are set there directly rather than on a wrapper as an application would.
     */
    const styledRootOf = (api: GridApi): HTMLElement =>
        (api.getDisplayedRowAtIndex(0) as any).beans.environment.eRootDiv;

    /** Sets the variables where the grid reads them, then changes the theme so the check re-runs. */
    const setVariablesAndRefreshTheme = (api: GridApi, variables: Record<string, string>) => {
        const eStyledRoot = styledRootOf(api);
        for (const [name, value] of Object.entries(variables)) {
            eStyledRoot.style.setProperty(name, value);
        }
        api.setGridOption('theme', themeQuartz.withParams({ accentColor: 'red' }));
    };

    const warningsRaised = () =>
        consoleWarnSpy.mock.calls.filter((call) => String(call[0]).includes('warning #332')) as unknown[][];

    test('warns that --ag-grid-size is ignored, naming --ag-spacing as the replacement', () => {
        const api = gridsManager.createGrid('myGrid', gridOptions);
        consoleWarnSpy.mockClear();

        setVariablesAndRefreshTheme(api, { '--ag-grid-size': '3px' });

        expect(warningsRaised()).toHaveLength(1);
        expect(String(warningsRaised()[0][1])).toContain('--ag-grid-size (use --ag-spacing)');
    });

    test('reports every ignored variable in a single warning', () => {
        const api = gridsManager.createGrid('myGrid', gridOptions);
        consoleWarnSpy.mockClear();

        setVariablesAndRefreshTheme(api, {
            '--ag-grid-size': '3px',
            '--ag-alpine-active-color': 'red',
        });

        const warnings = warningsRaised();
        expect(warnings).toHaveLength(1);
        expect(String(warnings[0][1])).toContain('--ag-grid-size (use --ag-spacing)');
        expect(String(warnings[0][1])).toContain('--ag-alpine-active-color (use --ag-accent-color)');
    });

    test('does not warn for Theming API variables, which the grid does read', () => {
        const api = gridsManager.createGrid('myGrid', gridOptions);
        consoleWarnSpy.mockClear();

        setVariablesAndRefreshTheme(api, { '--ag-spacing': '3px', '--ag-font-size': '10px' });

        expect(warningsRaised()).toHaveLength(0);
    });

    test('does not warn when the legacy themes are in use, as the variables then apply', () => {
        const api = gridsManager.createGrid('myGrid', gridOptions);
        consoleWarnSpy.mockClear();

        // switching away from a Theming API theme is what re-runs the check
        styledRootOf(api).style.setProperty('--ag-grid-size', '3px');
        api.setGridOption('theme', 'legacy');

        expect(warningsRaised()).toHaveLength(0);
    });
});
