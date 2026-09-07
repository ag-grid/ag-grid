import { getSitemapIgnorePaths } from './sitemapPages';

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
