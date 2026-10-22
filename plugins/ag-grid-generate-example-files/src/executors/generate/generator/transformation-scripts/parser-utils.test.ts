import {
    DARK_INTEGRATED_END,
    DARK_INTEGRATED_START,
    extractDevValidationsArgs,
    getIntegratedDarkModeCode,
    getIntegratedDarkModeInitialChartThemesCode,
    getVanillaDevValidationsPreamble,
    removeModuleRegistration,
} from './parser-utils';

describe('getIntegratedDarkModeCode', () => {
    const exampleName = '/documentation/integrated-charts-chart-tool-panels/_examples/chart-tool-panels';

    it('returns nothing for an example that does not use charts', () => {
        expect(getIntegratedDarkModeCode('/documentation/row-sorting/_examples/basic')).toBeUndefined();
    });

    it('rewrites the api name', () => {
        const code = getIntegratedDarkModeCode(exampleName, false, 'gridApi')!;

        expect(code).toContain("gridApi.setGridOption('chartThemes'");
        expect(code).not.toContain('params.api');
    });

    describe.each([
        ['typescript', true],
        ['javascript', false],
    ])('%s', (_language, typescript) => {
        const code = getIntegratedDarkModeCode(exampleName, typescript)!;

        it('reads the theme mode at apply time rather than capturing it when the module runs', () => {
            expect(code).toContain('const readThemeMode =');
            expect(code).toContain('const themeMode = readThemeMode();');
        });

        it('waits for both the grid api and the theme mode before applying the initial themes', () => {
            expect(code).toContain('if (params.api && (themeMode !== undefined || lastTry))');
            expect(code).toContain('setTimeout(trySetInitial, 250);');
        });

        it('registers the color-scheme-change listener before the initial apply, so a change during the retry window is kept', () => {
            expect(code.indexOf("addEventListener('color-scheme-change'")).toBeLessThan(
                code.indexOf('trySetInitial();')
            );
        });

        it('falls back to light once the retry budget is spent, so an example that owns its theming still gets themes', () => {
            expect(code).toContain('const lastTry = tries >= maxTries;');
            expect(code).toContain('if (params.api && (themeMode !== undefined || lastTry))');
            expect(code).toContain("updateChartThemes(themeMode !== undefined && themeMode.includes('dark'));");
        });

        it('does not touch the api once the grid is destroyed, as the retry timer and listener can outlive it', () => {
            expect(code).toContain('if (params.api.isDestroyed()) return;');
        });

        it('does not push an unchanged theme list, which would re-render the chart', () => {
            expect(code).toContain('currentThemes.every((theme, i) => theme === modifiedThemes[i])');
        });
    });
});

describe('getIntegratedDarkModeInitialChartThemesCode', () => {
    const exampleName = '/documentation/integrated-charts-chart-tool-panels/_examples/chart-tool-panels';

    it('returns nothing for an example that does not use charts', () => {
        expect(
            getIntegratedDarkModeInitialChartThemesCode('/documentation/row-sorting/_examples/basic', [])
        ).toBeUndefined();
    });

    it('provides the themes globally, so a chart created while the grid initialises is themed on its first render', () => {
        const code = getIntegratedDarkModeInitialChartThemesCode(exampleName, [])!;

        expect(code).toContain('provideGlobalGridOptions({');
        expect(code).toContain("chartThemes: ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid']");
        expect(code).toContain("document.documentElement.dataset.agThemeMode?.includes('dark') ? '-dark' : ''");
    });

    it('is wrapped in the dark mode delimiters, so it is stripped from the code the user sees', () => {
        const code = getIntegratedDarkModeInitialChartThemesCode(exampleName, [])!;

        expect(code.startsWith(DARK_INTEGRATED_START)).toBe(true);
        expect(code.endsWith(DARK_INTEGRATED_END)).toBe(true);
    });

    it('imports provideGlobalGridOptions inside the delimiters, so the import is stripped along with it', () => {
        const code = getIntegratedDarkModeInitialChartThemesCode(exampleName, [
            "import { createGrid } from 'ag-grid-community';",
        ])!;

        expect(code).toContain("import { provideGlobalGridOptions } from 'ag-grid-community';");
    });

    it('does not add a duplicate import when the example already imports provideGlobalGridOptions', () => {
        const code = getIntegratedDarkModeInitialChartThemesCode(exampleName, [
            "import { createGrid, provideGlobalGridOptions } from 'ag-grid-community';",
        ])!;

        expect(code).not.toContain('import {');
    });
});

describe('dev validations guard', () => {
    const guarded = (call: string) =>
        `if (process.env.NODE_ENV !== 'production') {\n    // Enable extended validations only for development\n    ${call};\n}\n\nconst x = 1;\n`;

    it('strips a bare guard and builds a bare preamble', () => {
        const code = guarded('agGrid.enableDevValidations()');
        expect(removeModuleRegistration(code)).toBe('\nconst x = 1;\n');
        expect(extractDevValidationsArgs(code)).toBe('');
        expect(getVanillaDevValidationsPreamble(extractDevValidationsArgs(code))).toBe(
            '// Enable extended validations only for development\nagGrid.enableDevValidations();'
        );
    });

    it('strips a guard with { debug: true } and keeps the args in the preamble', () => {
        const code = guarded('agGrid.enableDevValidations({ debug: true })');
        expect(removeModuleRegistration(code)).toBe('\nconst x = 1;\n');
        expect(extractDevValidationsArgs(code)).toBe('{ debug: true }');
        expect(getVanillaDevValidationsPreamble(extractDevValidationsArgs(code))).toBe(
            '// Enable extended validations only for development\nagGrid.enableDevValidations({ debug: true });'
        );
    });

    it('strips a guard with { showOverlayOn: [] } preceded by a comment line', () => {
        const code = `// The overlay is turned off.\n${guarded('agGrid.enableDevValidations({ showOverlayOn: [] })')}`;
        const stripped = removeModuleRegistration(code);
        expect(stripped).toBe('\nconst x = 1;\n');
        expect(stripped).not.toContain('process.env');
        expect(extractDevValidationsArgs(code)).toBe('{ showOverlayOn: [] }');
    });

    it('keeps multi-line args containing a commented-out option', () => {
        const code = guarded('enableDevValidations({\n        // debug: true\n    })');
        expect(removeModuleRegistration(code)).toBe('\nconst x = 1;\n');
        expect(extractDevValidationsArgs(code)).toBe('{\n        // debug: true\n    }');
    });

    it('returns empty args when there is no guard', () => {
        expect(extractDevValidationsArgs('const x = 1;')).toBe('');
    });
});
