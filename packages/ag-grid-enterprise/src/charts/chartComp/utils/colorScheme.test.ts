import { isDarkColorScheme, toDarkThemeNames } from './colorScheme';

// The scheme itself is only resolvable by a real browser - jsdom does not substitute `var()` - so it
// is covered by the integrated-charts docs e2e, which samples the rendered chart canvas. Only the
// contract for an element that cannot be measured is asserted here.
describe('isDarkColorScheme', () => {
    test.each([undefined, null])('%s element -> undefined', (element) => {
        expect(isDarkColorScheme(element)).toBeUndefined();
    });

    test('an element whose background does not resolve -> undefined, so the light default is kept', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);

        expect(isDarkColorScheme(element)).toBeUndefined();

        element.remove();
    });
});

describe('toDarkThemeNames', () => {
    const stockThemes = { 'ag-default': {}, 'ag-default-dark': {}, 'ag-vivid': {} };

    test('maps stock themes that have a dark variant', () => {
        expect(toDarkThemeNames(['ag-default'], stockThemes)).toEqual(['ag-default-dark']);
    });

    test('leaves a theme without a dark variant alone', () => {
        expect(toDarkThemeNames(['ag-vivid', 'my-custom-theme'], stockThemes)).toEqual(['ag-vivid', 'my-custom-theme']);
    });

    test('is idempotent', () => {
        expect(toDarkThemeNames(toDarkThemeNames(['ag-default'], stockThemes), stockThemes)).toEqual([
            'ag-default-dark',
        ]);
    });
});
