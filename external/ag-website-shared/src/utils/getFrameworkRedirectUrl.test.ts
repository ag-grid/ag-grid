import { getFrameworkRedirectUrl } from '@ag-website-shared/utils/getFrameworkRedirectUrl';

const FRAMEWORKS = ['react', 'angular', 'vue', 'javascript'];

// Charts: `https://charts-staging.ag-grid.com/javascript/bar-series/`
const CHARTS_URL_SHAPE = {
    frameworkPathIndex: 1,
    pageNamePathIndex: 2,
    frameworkPaths: FRAMEWORKS,
    redirectPath: 'r',
};

// Charts on production, which is served under a `/charts` base url
const CHARTS_BASE_URL_SHAPE = {
    ...CHARTS_URL_SHAPE,
    frameworkPathIndex: 2,
    pageNamePathIndex: 3,
};

// Grid: `https://www.ag-grid.com/react-data-grid/getting-started/`
const GRID_URL_SHAPE = {
    frameworkPathIndex: 1,
    pageNamePathIndex: 2,
    frameworkPaths: FRAMEWORKS.map((framework) => `${framework}-data-grid`),
    redirectPath: 'data-grid',
};

describe('getFrameworkRedirectUrl', () => {
    test.each`
        url                                                                | expected
        ${'https://charts-staging.ag-grid.com/javascript/bar-series/'}     | ${'https://charts-staging.ag-grid.com/r/bar-series/'}
        ${'https://charts-staging.ag-grid.com/react/bar-series'}           | ${'https://charts-staging.ag-grid.com/r/bar-series'}
        ${'https://charts-staging.ag-grid.com/vue/overview/#formatter'}    | ${'https://charts-staging.ag-grid.com/r/overview/#formatter'}
        ${'https://charts-staging.ag-grid.com/angular/themes/?debug=true'} | ${'https://charts-staging.ag-grid.com/r/themes/?debug=true'}
        ${'http://localhost:4600/javascript/bar-series/'}                  | ${'http://localhost:4600/r/bar-series/'}
    `('charts url shape: $url -> $expected', ({ url, expected }) => {
        expect(getFrameworkRedirectUrl(url, CHARTS_URL_SHAPE)).toBe(expected);
    });

    test.each`
        url                                                                            | reason
        ${'https://charts-staging.ag-grid.com/gallery/simple-bar/'}                    | ${'not a framework page'}
        ${'https://charts-staging.ag-grid.com/javascript/'}                            | ${'no page name'}
        ${'https://charts-staging.ag-grid.com/'}                                       | ${'site root'}
        ${'https://charts-staging.ag-grid.com/javascript/bar-series/examples/simple/'} | ${'nested below the page name'}
        ${'https://charts-staging.ag-grid.com/javascript-charts/'}                     | ${'framework page name, not a framework path'}
        ${'#formatter'}                                                                | ${'not an absolute url'}
    `('returns undefined for $url ($reason)', ({ url }) => {
        expect(getFrameworkRedirectUrl(url, CHARTS_URL_SHAPE)).toBeUndefined();
    });

    test('handles a site base url', () => {
        expect(getFrameworkRedirectUrl('https://www.ag-grid.com/charts/react/bar-series/', CHARTS_BASE_URL_SHAPE)).toBe(
            'https://www.ag-grid.com/charts/r/bar-series/'
        );
        expect(
            getFrameworkRedirectUrl('https://www.ag-grid.com/react/bar-series/', CHARTS_BASE_URL_SHAPE)
        ).toBeUndefined();
    });

    test.each`
        url                                                           | expected
        ${'https://www.ag-grid.com/react-data-grid/getting-started/'} | ${'https://www.ag-grid.com/data-grid/getting-started/'}
        ${'https://www.ag-grid.com/vue-data-grid/filter-text/#api'}   | ${'https://www.ag-grid.com/data-grid/filter-text/#api'}
        ${'https://www.ag-grid.com/data-grid/getting-started/'}       | ${undefined}
        ${'https://www.ag-grid.com/license-pricing/'}                 | ${undefined}
    `('grid url shape: $url -> $expected', ({ url, expected }) => {
        expect(getFrameworkRedirectUrl(url, GRID_URL_SHAPE)).toBe(expected);
    });
});
