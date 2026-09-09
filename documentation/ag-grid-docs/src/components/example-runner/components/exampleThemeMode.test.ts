import { shouldNavigateExample, withThemeMode } from './exampleThemeMode';

describe('withThemeMode', () => {
    test('appends the dark theme mode when the site is in dark mode', () => {
        expect(withThemeMode('/examples/grid/vanilla/', true)).toBe('/examples/grid/vanilla/?agThemeMode=dark-blue');
    });

    test('appends the light theme mode when the site is in light mode', () => {
        expect(withThemeMode('/examples/grid/vanilla/', false)).toBe('/examples/grid/vanilla/?agThemeMode=light');
    });

    test('appends nothing when the example suppresses dark mode', () => {
        expect(withThemeMode('/examples/grid/vanilla/', true, true)).toBe('/examples/grid/vanilla/');
    });

    test('appends nothing when the colour scheme has not resolved yet', () => {
        expect(withThemeMode('/examples/grid/vanilla/', undefined)).toBe('/examples/grid/vanilla/');
    });

    test('preserves an existing query string', () => {
        expect(withThemeMode('/examples/grid/vanilla/?prod=false', true)).toBe(
            '/examples/grid/vanilla/?prod=false&agThemeMode=dark-blue'
        );
    });

    test('leaves the pathname untouched, so the iframe re-navigation guard still matches', () => {
        const url = '/examples/grid/vanilla/';

        expect(new URL(withThemeMode(url, true), 'https://ag-grid.invalid').pathname).toBe(url);
        expect(new URL(withThemeMode(url, false), 'https://ag-grid.invalid').pathname).toBe(url);
    });
});

describe('shouldNavigateExample', () => {
    const url = '/examples/grid/vanilla/';
    const dark = `${url}?agThemeMode=dark-blue`;
    const light = `${url}?agThemeMode=light`;

    test('navigates when the iframe has not loaded anything yet', () => {
        expect(shouldNavigateExample({ currentPathname: undefined, url, nextSrc: light })).toBe(true);
    });

    test('navigates when the example itself changed', () => {
        expect(shouldNavigateExample({ currentPathname: '/examples/grid/other/', url, nextSrc: light })).toBe(true);
    });

    test('does not reload a loaded example when the colour scheme changes', () => {
        expect(shouldNavigateExample({ currentPathname: url, url, nextSrc: dark })).toBe(false);
    });

    test('re-points an in-flight navigation whose theme mode has been superseded', () => {
        expect(shouldNavigateExample({ currentPathname: url, url, nextSrc: dark, pendingSrc: light })).toBe(true);
    });

    test('leaves an in-flight navigation alone when its theme mode still matches', () => {
        expect(shouldNavigateExample({ currentPathname: url, url, nextSrc: dark, pendingSrc: dark })).toBe(false);
    });
});
