/**
 * SE-106: the blog tag archives that are indexable. Every other tag archive is noindex, because the
 * main site owns the framework and charts terms.
 *
 * This list must match the allowlist in the blog theme (ag-grid-blog-theme,
 * `partials/indexable-tag.hbs`), which is what actually sets the noindex.
 */
export const INDEXABLE_BLOG_TAGS = ['tutorial', 'how-to', 'testing', 'version-release'];

/** Written to the root of the build output, and listed in the sitemap index. */
export const BLOG_TAG_SITEMAP_FILE = 'sitemap-blog-tags.xml';

type SitemapUrl = { loc: string; lastmod?: string };

const getTagSlug = (loc: string) => loc.match(/\/tag\/([^/]+)\/?$/)?.[1];

const toXml = (urls: SitemapUrl[]) =>
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls
        .map(({ loc, lastmod }) => `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
        .join('') +
    '</urlset>\n';

/**
 * Ghost's `sitemap-tags.xml` lists every public tag and cannot be filtered from the theme, so
 * listing it in the sitemap index would point crawlers at the noindexed archives. Instead, keep
 * only the indexable tags' entries, with Ghost's own lastmod.
 *
 * `missing` lists indexable tags Ghost did not return (a tag that was deleted or merged).
 */
export function filterBlogTagSitemap(ghostXml: string, tags: string[] = INDEXABLE_BLOG_TAGS) {
    const urls: SitemapUrl[] = [];
    for (const [block] of ghostXml.matchAll(/<url>[\s\S]*?<\/url>/g)) {
        const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
        const slug = loc && getTagSlug(loc);
        if (!loc || !slug || !tags.includes(slug)) {
            continue;
        }
        urls.push({ loc, lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() });
    }

    const found = new Set(urls.map(({ loc }) => getTagSlug(loc)));
    return { xml: toXml(urls), missing: tags.filter((tag) => !found.has(tag)) };
}

/**
 * Used when Ghost's sitemap cannot be fetched, so a blog outage does not fail the docs build. The
 * tag URLs are built from the Ghost sitemap's location and carry no lastmod.
 */
export function fallbackBlogTagSitemap(ghostSitemapUrl: string, tags: string[] = INDEXABLE_BLOG_TAGS) {
    return toXml(tags.map((tag) => ({ loc: new URL(`tag/${tag}/`, ghostSitemapUrl).href })));
}
