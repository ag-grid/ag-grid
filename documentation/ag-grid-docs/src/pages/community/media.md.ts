import { buildCommunityMediaMarkdown } from '@ag-website-shared/markdown-pages/community/buildCommunityMediaMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { GRID_PRODUCT_NAME, gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /community/media.md — a markdown twin of the /community/media page for LLMs, built
// from the same videos/podcasts/blogs JSON the page renders. Content-negotiates from the HTML
// URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }
    const output = buildCommunityMediaMarkdown({
        product: GRID_PRODUCT_NAME,
        currentSite: 'grid',
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ pageUrl: '/community/media/', siteRoot: SITE_URL }),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
