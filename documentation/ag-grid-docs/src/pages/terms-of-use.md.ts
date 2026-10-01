import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';
import { buildTermsOfUseMarkdown } from '@utils/markdown-pages/buildTermsOfUseMarkdown';

// Served at /terms-of-use.md — the markdown twin of the page, rendered from the same preamble
// and the same policies/terms-of-use.mdoc body the page renders. Content-negotiates from the
// HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = await buildTermsOfUseMarkdown({
        siteRoot: SITE_URL,
        resolvers: createGridMarkdownResolvers({ siteRoot: SITE_URL }),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
