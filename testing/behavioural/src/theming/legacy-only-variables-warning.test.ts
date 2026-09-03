import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, enableDevValidations, themeQuartz } from 'ag-grid-community';

/**
 * The Theming API does not read the v32 legacy theme variables, so setting one has no effect at
 * all. Nothing used to say so, which is how a "compact" preset built from `--ag-grid-size` came to
 * look like a grid bug: the preset lowers `--ag-grid-size` and `--ag-font-size`, the grid ignores
 * the former outright and clamps the latter with `max(iconSize, cellFontSize)`, so the row height
 * never moves. That is a silently ignored variable, not a row-model defect.
 *
 * Loading the legacy stylesheet alongside the Theming API is a different mistake, already reported
 * as error #106/#239, so these variables are only reported when that stylesheet is absent.
 */
describe('legacy-only theme variables under the Theming API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        // This file asserts on validation diagnostics; the global throw-on-validation must be off here.
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
     * Applications set theme variables on their own wrapper - `document.body` in the docs example
     * these repros came from - and CSS inheritance carries them down to the grid's styled root,
     * which is where the grid resolves them. happy-dom's `getComputedStyle` does not implement
     * custom-property inheritance, so the variables are set directly on that styled root here.
     *
     * `beans` is not public API, but the styled root is created by the grid and has no accessor;
     * `document.querySelector` is not usable because popups add styled roots of their own.
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

        // Switching away from a Theming API theme is what actually re-runs the check; setting
        // `theme` to the value it already holds fires no property change at all.
        styledRootOf(api).style.setProperty('--ag-grid-size', '3px');
        api.setGridOption('theme', 'legacy');

        expect(warningsRaised()).toHaveLength(0);
    });
});
