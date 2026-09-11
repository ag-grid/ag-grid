import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';
import { buildEulaMarkdown } from '@utils/markdown-pages/buildEulaMarkdown';

// Served at /eula.md — the markdown twin of the page, rendered from the same preamble
// and the same policies/eula.mdoc body the page renders. Content-negotiates from the
// HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = await buildEulaMarkdown({
        siteRoot: SITE_URL,
        resolvers: createGridMarkdownResolvers({ siteRoot: SITE_URL }),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
