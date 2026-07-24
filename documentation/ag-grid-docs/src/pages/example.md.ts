import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildExampleMarkdown } from '@utils/markdown-pages/buildExampleMarkdown';

// Served at /example.md — a markdown twin of the /example (demo) page for LLMs. The page is a
// live interactive grid, so the twin is a short index of the available demos and resources,
// sharing its demo list with the page (demosData). The HTML URL content-negotiates to this
// file on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildExampleMarkdown({ siteRoot: SITE_URL });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
