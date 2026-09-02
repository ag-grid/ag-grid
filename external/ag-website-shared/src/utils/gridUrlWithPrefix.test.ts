import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';

const siteBaseUrl = 'https://www.ag-grid.com';

describe('gridUrlWithPrefix', () => {
    // These become hrefs on the licence-pricing feature matrix, the landing pages and the homepage,
    // where the slash-less form costs a 301 on every click. `pathJoin` drops the trailing slash the
    // content json carries, so the builder has to put it back.
    test.each`
        url                                 | expected
        ${'./mcp-server/'}                  | ${'https://www.ag-grid.com/react-data-grid/mcp-server/'}
        ${'./mcp-server'}                   | ${'https://www.ag-grid.com/react-data-grid/mcp-server/'}
        ${'./license-install'}              | ${'https://www.ag-grid.com/react-data-grid/license-install/'}
        ${'/license-pricing'}               | ${'https://www.ag-grid.com/license-pricing/'}
        ${'./getting-started/#quick-start'} | ${'https://www.ag-grid.com/react-data-grid/getting-started/#quick-start'}
    `('returns $expected for $url', ({ url, expected }) => {
        expect(gridUrlWithPrefix({ url, framework: 'react', siteBaseUrl })).toBe(expected);
    });

    test('leaves a url it did not build alone', () => {
        const external = 'https://www.figma.com/community/file/1360600846643230092';
        expect(gridUrlWithPrefix({ url: external, framework: 'react', siteBaseUrl })).toBe(external);
    });
});

describe('chartsUrlWithPrefix', () => {
    test.each`
        url                    | expected
        ${'./bar-series/'}     | ${'https://www.ag-grid.com/charts/react/bar-series/'}
        ${'./bar-series'}      | ${'https://www.ag-grid.com/charts/react/bar-series/'}
        ${'/gallery'}          | ${'https://www.ag-grid.com/charts/gallery/'}
        ${'./themes/#palette'} | ${'https://www.ag-grid.com/charts/react/themes/#palette'}
    `('returns $expected for $url', ({ url, expected }) => {
        expect(chartsUrlWithPrefix({ url, framework: 'react', siteBaseUrl: 'https://www.ag-grid.com/charts' })).toBe(
            expected
        );
    });
});
