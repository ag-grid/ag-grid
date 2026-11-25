import { fallbackBlogTagSitemap, filterBlogTagSitemap } from './blogTagSitemap';

const GHOST_XML =
    '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="//www.ag-grid.com/blog/sitemap.xsl"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' +
    '<url><loc>https://www.ag-grid.com/blog/tag/charts/</loc><lastmod>2026-11-20T18:13:16.000Z</lastmod></url>' +
    '<url><loc>https://www.ag-grid.com/blog/tag/how-to/</loc><lastmod>2022-09-06T12:35:40.000Z</lastmod></url>' +
    '<url><loc>https://www.ag-grid.com/blog/tag/react-data-grid/</loc><lastmod>2022-08-26T13:46:53.000Z</lastmod>' +
    '<image:image><image:loc>https://www.ag-grid.com/blog/content/images/2019/03/ghost-cover-react.png</image:loc></image:image></url>' +
    '<url><loc>https://www.ag-grid.com/blog/tag/tutorial/</loc><lastmod>2022-08-26T13:46:53.000Z</lastmod></url>' +
    '<url><loc>https://www.ag-grid.com/blog/tag/testing/</loc><lastmod>2022-08-01T10:00:00.000Z</lastmod></url>' +
    '</urlset>';

describe('blog tag sitemap (SE-106)', () => {
    test('keeps only the indexable tags, with Ghost lastmod', () => {
        const { xml } = filterBlogTagSitemap(GHOST_XML, ['tutorial', 'how-to', 'testing']);

        expect(xml).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
                '<url><loc>https://www.ag-grid.com/blog/tag/how-to/</loc><lastmod>2022-09-06T12:35:40.000Z</lastmod></url>' +
                '<url><loc>https://www.ag-grid.com/blog/tag/tutorial/</loc><lastmod>2022-08-26T13:46:53.000Z</lastmod></url>' +
                '<url><loc>https://www.ag-grid.com/blog/tag/testing/</loc><lastmod>2022-08-01T10:00:00.000Z</lastmod></url>' +
                '</urlset>\n'
        );
    });

    test('drops the noindexed tags', () => {
        const { xml } = filterBlogTagSitemap(GHOST_XML);

        expect(xml).not.toContain('/tag/charts/');
        expect(xml).not.toContain('/tag/react-data-grid/');
        expect(xml).not.toContain('image:');
    });

    test('reports an indexable tag Ghost did not list', () => {
        expect(filterBlogTagSitemap(GHOST_XML).missing).toEqual(['version-release']);
    });

    test('does not match a tag by prefix', () => {
        const xml = '<urlset><url><loc>https://www.ag-grid.com/blog/tag/testing-library/</loc></url></urlset>';

        expect(filterBlogTagSitemap(xml, ['testing']).missing).toEqual(['testing']);
    });

    test('falls back to the tag URLs without lastmod', () => {
        expect(fallbackBlogTagSitemap('https://www.ag-grid.com/blog/sitemap-tags.xml', ['tutorial'])).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
                '<url><loc>https://www.ag-grid.com/blog/tag/tutorial/</loc></url>' +
                '</urlset>\n'
        );
    });
});
