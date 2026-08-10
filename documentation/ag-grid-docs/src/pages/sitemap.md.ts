import parseSitemap from '@ag-website-shared/components/sitemap/utils/sitemaputils';
import { SITEMAP_CACHE_DIR } from '@ag-website-shared/constants';
import { getSitemapXml } from '@ag-website-shared/utils/getSitemapXml';
import { DISABLE_MARKDOWN_DOCS, LIVE_SITEMAP_URL, PRODUCTION_GRID_SITE_URL } from '@constants';
import { STATIC_PAGE_CONTENT } from '@utils/markdown-pages/staticPageContent';

// Served at /sitemap.md — the markdown twin of the HTML sitemap page, built from the same parsed
// sitemap XML the page renders, so the two list the same pages under the same categories.
// Content-negotiates from the HTML URL on Accept: text/markdown (see htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const sitemapUrl = LIVE_SITEMAP_URL || `${PRODUCTION_GRID_SITE_URL}/sitemap-0.xml`;
    const xmlSitemap = await getSitemapXml({ cacheDir: SITEMAP_CACHE_DIR, sitemapUrl });
    const parsedSitemap = parseSitemap(xmlSitemap);

    const content = STATIC_PAGE_CONTENT.sitemap;
    const sections = Object.entries(parsedSitemap).map(([category, pages]) => {
        const links = pages.map(({ url, pageName }) => `- [${pageName}](${url})`).join('\n');
        return `## ${category}\n\n${links}`;
    });

    const output =
        [
            [
                '---',
                `title: ${JSON.stringify(content.title)}`,
                `description: ${JSON.stringify(content.description)}`,
                '---',
            ].join('\n'),
            `# ${content.heading}`,
            content.description,
            'Every page listed here also has a markdown version: append `.md` to its URL.',
            ...sections,
        ].join('\n\n') + '\n';

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
