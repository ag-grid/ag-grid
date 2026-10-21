import { isStockTheme } from './chartTheme';

describe('isStockTheme', () => {
    test.each([
        'ag-default',
        'ag-default-dark',
        'ag-sheets',
        'ag-sheets-dark',
        'ag-polychroma',
        'ag-polychroma-dark',
        'ag-vivid',
        'ag-vivid-dark',
        'ag-material',
        'ag-material-dark',
        'ag-financial',
        'ag-financial-dark',
    ])('%s is a stock theme', (themeName) => {
        expect(isStockTheme(themeName)).toBe(true);
    });

    test.each(['my-custom', 'constructor', 'toString', '__proto__', ''])('%j is not a stock theme', (themeName) => {
        expect(isStockTheme(themeName)).toBe(false);
    });
});
