import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildAboutMarkdown } from '@utils/markdown-pages/buildAboutMarkdown';

// Served at /about.md — a markdown twin of the /about page for LLMs. Generated at build time
// from the same about.json content the page renders, so it cannot drift. The HTML URL
// content-negotiates to this file on Accept: text/markdown (see the SE-80 rules in
// htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildAboutMarkdown({ siteRoot: SITE_URL });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
