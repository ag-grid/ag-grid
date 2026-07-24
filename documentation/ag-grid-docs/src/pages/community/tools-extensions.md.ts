import { buildCommunityToolsExtensionsMarkdown } from '@ag-website-shared/markdown-pages/community/buildCommunityToolsExtensionsMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';

// Served at /community/tools-extensions.md — a markdown twin of the /community/tools-extensions
// page for LLMs, built from the same tools-extensions.json the page renders. Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }
    return new Response(
        buildCommunityToolsExtensionsMarkdown({ product: 'AG Grid', currentSite: 'grid', siteRoot: SITE_URL }),
        {
            status: 200,
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        }
    );
}
