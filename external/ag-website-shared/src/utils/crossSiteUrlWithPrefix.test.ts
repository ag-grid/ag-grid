import { chartsUrlWithPrefix } from '@ag-website-shared/utils/chartsUrlWithPrefix';
import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';

// The grid and charts sites are trailing-slash canonical, so a cross-site link built without one
// costs a 301 hop. `pathJoin` strips the slash, so these builders have to put it back - except on
// a file (`.pdf`, `.json`), where a trailing slash turns a valid download into a 404.
describe('chartsUrlWithPrefix', () => {
    const siteBaseUrl = 'https://www.ag-grid.com/charts';

    test.each`
        url                          | framework       | expected
        ${'./bar-series'}            | ${'javascript'} | ${'https://www.ag-grid.com/charts/javascript/bar-series/'}
        ${'./bar-series/'}           | ${'react'}      | ${'https://www.ag-grid.com/charts/react/bar-series/'}
        ${'./bar-series/#formatter'} | ${'react'}      | ${'https://www.ag-grid.com/charts/react/bar-series/#formatter'}
        ${'./bar-series#formatter'}  | ${'react'}      | ${'https://www.ag-grid.com/charts/react/bar-series/#formatter'}
        ${'/gallery'}                | ${'react'}      | ${'https://www.ag-grid.com/charts/gallery/'}
        ${'/gallery?series=bar'}     | ${'react'}      | ${'https://www.ag-grid.com/charts/gallery/?series=bar'}
        ${'./guide.pdf'}             | ${'react'}      | ${'https://www.ag-grid.com/charts/react/guide.pdf'}
        ${'./example.json#data'}     | ${'react'}      | ${'https://www.ag-grid.com/charts/react/example.json#data'}
        ${'https://youtube.com'}     | ${'react'}      | ${'https://youtube.com'}
    `('$url -> $expected', ({ url, framework, expected }) => {
        expect(chartsUrlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });
});

describe('gridUrlWithPrefix', () => {
    const siteBaseUrl = 'https://www.ag-grid.com';

    test.each`
        url                                  | framework  | expected
        ${'./license-install'}               | ${'react'} | ${'https://www.ag-grid.com/react-data-grid/license-install/'}
        ${'./license-install/'}              | ${'react'} | ${'https://www.ag-grid.com/react-data-grid/license-install/'}
        ${'./community-vs-enterprise#trial'} | ${'react'} | ${'https://www.ag-grid.com/react-data-grid/community-vs-enterprise/#trial'}
        ${'/license-pricing'}                | ${'react'} | ${'https://www.ag-grid.com/license-pricing/'}
        ${'/license-pricing?tab=trial'}      | ${'react'} | ${'https://www.ag-grid.com/license-pricing/?tab=trial'}
        ${'./example.json'}                  | ${'react'} | ${'https://www.ag-grid.com/react-data-grid/example.json'}
        ${'./guide.pdf'}                     | ${'react'} | ${'https://www.ag-grid.com/react-data-grid/guide.pdf'}
        ${'https://youtube.com'}             | ${'react'} | ${'https://youtube.com'}
    `('$url -> $expected', ({ url, framework, expected }) => {
        expect(gridUrlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });
});
