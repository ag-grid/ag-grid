import parseSitemap from '@ag-website-shared/components/sitemap/utils/sitemaputils';
import { SITEMAP_BUILD_DIR, SITEMAP_CACHE_DIR } from '@ag-website-shared/constants';
import { getSitemapXml } from '@ag-website-shared/utils/getSitemapXml';
import { DISABLE_MARKDOWN_DOCS, LIVE_SITEMAP_URL, PRODUCTION_GRID_SITE_URL, SITE_URL } from '@constants';
import { buildGridFrontmatter } from '@utils/markdown-pages/gridFrontmatter';
import { STATIC_PAGE_CONTENT } from '@utils/markdown-pages/staticPageContent';

// Served at /sitemap.md — the markdown twin of the HTML sitemap page, built from the same parsed
// sitemap XML the page renders, so the two list the same pages under the same categories.
// Content-negotiates from the HTML URL on Accept: text/markdown (see htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const sitemapUrl = LIVE_SITEMAP_URL || `${PRODUCTION_GRID_SITE_URL}/sitemap-0.xml`;
    const xmlSitemap = await getSitemapXml({
        cacheDir: SITEMAP_CACHE_DIR,
        sitemapUrl,
        recordDir: SITEMAP_BUILD_DIR,
    });
    const parsedSitemap = parseSitemap(xmlSitemap);

    const content = STATIC_PAGE_CONTENT.sitemap;
    const sections = Object.entries(parsedSitemap).map(([category, pages]) => {
        const links = pages.map(({ url, pageName }) => `- [${pageName}](${url})`).join('\n');
        return `## ${category}\n\n${links}`;
    });

    const output =
        [
            buildGridFrontmatter({
                pageUrl: '/sitemap/',
                siteRoot: SITE_URL,
                title: content.title,
                description: content.description,
            }),
            `# ${content.heading}`,
            content.description,
            `Every page listed here also has a markdown version: append \`.md\` to its URL. The homepage is the one URL with no \`.md\` suffix - its copy is ${PRODUCTION_GRID_SITE_URL}/index.md.`,
            ...sections,
        ].join('\n\n') + '\n';

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
