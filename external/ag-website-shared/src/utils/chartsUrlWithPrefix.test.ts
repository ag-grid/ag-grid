import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';

const siteBaseUrl = 'https://www.ag-grid.com/charts';

describe('chartsUrlWithPrefix', () => {
    // Every docs page is a directory index, so a slashless URL costs the visitor a 301 (SE-166). The
    // slash goes into the pathname, ahead of any query string or anchor; files and URLs the builder
    // did not assemble are left as they came in.
    test.each`
        url                               | framework  | expected
        ${'./bar-series/'}                | ${'react'} | ${'https://www.ag-grid.com/charts/react/bar-series/'}
        ${'./high-frequency-data'}        | ${'react'} | ${'https://www.ag-grid.com/charts/react/high-frequency-data/'}
        ${'/gallery'}                     | ${'react'} | ${'https://www.ag-grid.com/charts/gallery/'}
        ${'/gallery?utm_source=x'}        | ${'react'} | ${'https://www.ag-grid.com/charts/gallery/?utm_source=x'}
        ${'/changelog?fixVersion=14.1.0'} | ${'react'} | ${'https://www.ag-grid.com/charts/changelog/?fixVersion=14.1.0'}
        ${'./tooltips/#renderer'}         | ${'vue'}   | ${'https://www.ag-grid.com/charts/vue/tooltips/#renderer'}
        ${'./themes#palette'}             | ${'vue'}   | ${'https://www.ag-grid.com/charts/vue/themes/#palette'}
        ${'./guide.pdf'}                  | ${'react'} | ${'https://www.ag-grid.com/charts/react/guide.pdf'}
        ${'/example.json'}                | ${'react'} | ${'https://www.ag-grid.com/charts/example.json'}
        ${'#section'}                     | ${'react'} | ${'#section'}
        ${''}                             | ${'react'} | ${''}
        ${'https://example.com/other'}    | ${'react'} | ${'https://example.com/other'}
    `('$url (framework=$framework) -> $expected', ({ url, framework, expected }) => {
        expect(chartsUrlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });
});
