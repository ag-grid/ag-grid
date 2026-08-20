import { getIntegratedDarkModeCode } from './parser-utils';

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

    // The typescript and javascript bodies are maintained separately, and a change applied to only
    // one of them is a silent half-fix across the frameworks that use the other.
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
            expect(code).toContain('if (params.api && themeMode !== undefined)');
        });

        it('registers the color-scheme-change listener before the initial apply, so a change during the retry window is kept', () => {
            expect(code.indexOf("addEventListener('color-scheme-change'")).toBeLessThan(
                code.indexOf('trySetInitial();')
            );
        });

        it('does not push an unchanged theme list, which would re-render the chart', () => {
            expect(code).toContain('currentThemes.every((theme, i) => theme === modifiedThemes[i])');
        });
    });
});
