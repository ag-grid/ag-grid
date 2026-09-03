import { getSitemapConfig } from './sitemap';

describe('sitemap filter (SE-165)', () => {
    const { filter } = getSitemapConfig({});

    test.each([
        'https://www.ag-grid.com/reference/',
        'https://www.ag-grid.com/licensing/',
        'https://www.ag-grid.com/documentation/',
        'https://www.ag-grid.com/react-data-grid/',
        'https://www.ag-grid.com/angular-data-grid/',
        'https://www.ag-grid.com/javascript-data-grid/',
        'https://www.ag-grid.com/vue-data-grid/',
        'https://www.ag-grid.com/data-grid/getting-started/',
    ])('excludes the forward-on stub page %s', (page) => {
        expect(filter(page)).toBe(false);
    });

    test.each([
        'https://www.ag-grid.com/theme-builder/',
        'https://www.ag-grid.com/sitemap/',
        'https://www.ag-grid.com/landing-pages/react-data-grid/',
        'https://www.ag-grid.com/react-data-grid/reference/',
    ])('keeps the real page %s', (page) => {
        expect(filter(page)).toBe(true);
    });
});
