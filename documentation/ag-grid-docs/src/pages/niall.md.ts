import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildNiallMarkdown } from '@utils/markdown-pages/buildNiallMarkdown';

// Served at /niall.md — a markdown twin of the /niall memorial page, built from the same
// niall.json the page renders. Content-negotiates from the HTML URL on Accept: text/markdown
// (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }
    return new Response(buildNiallMarkdown({ siteRoot: SITE_URL }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
