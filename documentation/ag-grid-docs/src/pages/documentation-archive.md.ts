import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildDocumentationArchiveMarkdown } from '@utils/markdown-pages/buildDocumentationArchiveMarkdown';

// Served at /documentation-archive.md — a markdown twin of the /documentation-archive/ page
// for LLMs. Generated at build time from the same versions data the page renders, so it
// cannot drift. The HTML URL content-negotiates to this file on Accept: text/markdown (see
// the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildDocumentationArchiveMarkdown({ siteRoot: SITE_URL });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
