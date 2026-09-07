import { buildCommunityMarkdown } from '@ag-website-shared/markdown-pages/community/buildCommunityMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { GRID_PRODUCT_NAME, gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /community.md — a markdown twin of the /community/ page for LLMs. Generated at
// build time from the same shared community JSON the page renders, so it cannot drift. The
// HTML URL content-negotiates to this file on Accept: text/markdown (see the SE-80 rules in
// htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildCommunityMarkdown({
        product: GRID_PRODUCT_NAME,
        currentSite: 'grid',
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ pageUrl: '/community/', siteRoot: SITE_URL }),
    });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
