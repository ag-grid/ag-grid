import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildCommunityLicenceMarkdown } from '@utils/markdown-pages/buildCommunityLicenceMarkdown';

// Served at /eula/community.md — the markdown twin of the page, rendered from the same preamble
// and the same package LICENSE.txt the page renders. Content-negotiates from the HTML URL on
// Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildCommunityLicenceMarkdown({ siteRoot: SITE_URL });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
