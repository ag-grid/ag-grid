import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildDemoMarkdown } from '@utils/markdown-pages/buildDemoMarkdown';

// Served at /example-finance.md — a markdown twin of the finance demo page, built from the same
// shared copy the page renders. Content-negotiates from the HTML URL on Accept: text/markdown
// (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }
    return new Response(buildDemoMarkdown({ demo: 'finance', siteRoot: SITE_URL }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
