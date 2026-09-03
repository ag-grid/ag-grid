import { getSitemapIgnorePaths } from './sitemapPages';

describe('getSitemapIgnorePaths', () => {
    test('includes the searchQuery wildcard unmodified by the trailing-slash mapping', async () => {
        const ignorePaths = await getSitemapIgnorePaths();

        expect(ignorePaths).toContain('/*searchQuery=');
        expect(ignorePaths).not.toContain('/*searchQuery=/');
    });
});
