import { getSitemapAllowPaths, getSitemapIgnorePaths } from './sitemapPages';

// SE-182 (waf-finding.md §12). Which URLs these open is evaluated in robotsTxt.test.ts.
describe('getSitemapAllowPaths', () => {
    test('opens the exact archive roots with `$` anchors left unmodified by the trailing-slash mapping', async () => {
        const allowPaths = await getSitemapAllowPaths();

        expect(allowPaths.filter((path) => path.includes('$'))).toEqual(['/archive/$', '/charts/archive/$']);
    });
});

describe('getSitemapIgnorePaths', () => {
    test('includes the searchQuery wildcard unmodified by the trailing-slash mapping', async () => {
        const ignorePaths = await getSitemapIgnorePaths();

        expect(ignorePaths).toContain('/*searchQuery=');
        expect(ignorePaths).not.toContain('/*searchQuery=/');
    });

    test('does not block the /data-grid/ framework redirect pages, so crawlers can follow their framework links', async () => {
        const ignorePaths = await getSitemapIgnorePaths();

        expect(ignorePaths).not.toContain('/data-grid/');
    });
});
