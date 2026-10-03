import { ROUTE_FILES, sampleRoutePath } from './pageRoutes.test-utils';
import { productionRobotsTxt } from './robotsTxt';
import { isAllowedByRobots, parseRobotsTxt } from './robotsTxt.test-utils';
import { getSitemapConfig } from './sitemap';
import { getSitemapAllowPaths, getSitemapIgnorePaths } from './sitemapPages';

const ROBOTS = parseRobotsTxt(productionRobotsTxt(await getSitemapAllowPaths(), await getSitemapIgnorePaths()));

describe('sitemap filter (SE-165)', () => {
    const { filter } = getSitemapConfig({});

    test.each([
        'https://www.ag-grid.com/reference/',
        'https://www.ag-grid.com/licensing/',
        'https://www.ag-grid.com/documentation/',
        'https://www.ag-grid.com/javascript-data-grid/',
        'https://www.ag-grid.com/data-grid/getting-started/',
    ])('excludes the forward-on stub page %s', (page) => {
        expect(filter(page)).toBe(false);
    });

    test.each([
        'https://www.ag-grid.com/theme-builder/',
        'https://www.ag-grid.com/sitemap/',
        'https://www.ag-grid.com/landing-pages/react-data-grid/',
        'https://www.ag-grid.com/react-data-grid/reference/',
        'https://www.ag-grid.com/react-data-grid/',
        'https://www.ag-grid.com/angular-data-grid/',
        'https://www.ag-grid.com/vue-data-grid/',
    ])('keeps the real page %s', (page) => {
        expect(filter(page)).toBe(true);
    });
});

describe('sitemap filter — non-public page classes (SE-186)', () => {
    const { filter } = getSitemapConfig({});

    test.each([
        'https://www.ag-grid.com/examples/cell-editing/basic/reactFunctional/',
        'https://www.ag-grid.com/debug/docs-examples/',
        'https://www.ag-grid.com/react-data-grid/errors/200/',
        'https://www.ag-grid.com/react-data-grid/cell-editing-batch-test/',
        'https://www.ag-grid.com/react-data-grid/cell-editing-batch-test',
        'https://www.ag-grid.com/style-guide/',
        'https://www.ag-grid.com/contact/success/',
        'https://www.ag-grid.com/contact/failure/',
        'https://www.ag-grid.com/privacy/your-choice/',
    ])('excludes %s', (page) => {
        expect(filter(page)).toBe(false);
    });

    test.each([
        'https://www.ag-grid.com/contact/',
        'https://www.ag-grid.com/privacy/',
        'https://www.ag-grid.com/example/',
        'https://www.ag-grid.com/react-data-grid/testing/',
        'https://www.ag-grid.com/react-data-grid/error-handling/',
    ])('keeps the similarly named real page %s', (page) => {
        expect(filter(page)).toBe(true);
    });
});

describe('sitemap index children (SE-85, SE-186)', () => {
    test('lists the charts, studio and blog child sitemaps, in that order', () => {
        const { customSitemaps } = getSitemapConfig({
            chartsSitemap: 'https://www.ag-grid.com/charts/sitemap-0.xml',
            studioSitemap: 'https://www.ag-grid.com/studio/sitemap-0.xml',
            blogSitemaps: [
                'https://www.ag-grid.com/blog/sitemap-posts.xml',
                'https://www.ag-grid.com/blog/sitemap-pages.xml',
            ],
        });

        expect(customSitemaps).toEqual([
            'https://www.ag-grid.com/charts/sitemap-0.xml',
            'https://www.ag-grid.com/studio/sitemap-0.xml',
            'https://www.ag-grid.com/blog/sitemap-posts.xml',
            'https://www.ag-grid.com/blog/sitemap-pages.xml',
        ]);
    });

    test('omits a child whose URL is not configured, rather than listing an empty entry', () => {
        expect(getSitemapConfig({}).customSitemaps).toEqual([]);
        expect(
            getSitemapConfig({ studioSitemap: 'https://www.ag-grid.com/studio/sitemap-0.xml' }).customSitemaps
        ).toEqual(['https://www.ag-grid.com/studio/sitemap-0.xml']);
    });
});

// A sitemap URL that robots.txt blocks is reported by Search Console as "submitted URL blocked by
// robots.txt", so every page the filter keeps must be crawlable by search engines.
describe('sitemap and robots.txt agree', () => {
    const { filter } = getSitemapConfig({});
    const SAMPLE_PARAMS = {
        framework: 'react',
        pageName: 'getting-started',
        code: '200',
        bryntumProduct: 'bryntum-gantt',
        slug: 'sample-session',
        exampleName: 'basic',
        internalFramework: 'reactFunctional',
    };
    // Noindexed, so agSitemapFilterNoindex drops them from the production sitemap even though this
    // filter keeps them (see PAGES_WITHOUT_TWINS in markdownPages.test.ts).
    const NOINDEXED_CAMPAIGNS = ['/campaigns/power-of-ag-charts/', '/campaigns/return-to-support/'];
    const listedPages = ROUTE_FILES.filter((file) => file.endsWith('.astro'))
        .map((file) => sampleRoutePath(file, SAMPLE_PARAMS).replace(/\/?$/, '/'))
        // Astro never lists its 404 page.
        .filter((path) => path !== '/404/' && !NOINDEXED_CAMPAIGNS.includes(path))
        .filter((path) => filter(`https://www.ag-grid.com${path}`));

    test('covers the page routes, so the check below is not vacuous', () => {
        expect(listedPages.length).toBeGreaterThan(30);
    });

    test.each(listedPages)('%s is in the sitemap, so search engines may crawl it', (path) => {
        expect(isAllowedByRobots(ROBOTS, 'Googlebot', path)).toBe(true);
    });

    test.each(NOINDEXED_CAMPAIGNS)('%s is robots-blocked, so it must stay noindexed out of the sitemap', (path) => {
        expect(isAllowedByRobots(ROBOTS, 'Googlebot', path)).toBe(false);
    });
});
