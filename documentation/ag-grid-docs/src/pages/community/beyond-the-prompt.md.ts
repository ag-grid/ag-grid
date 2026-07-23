import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { buildCommunityBeyondThePromptMarkdown } from '@utils/markdown-pages/buildCommunityBeyondThePromptMarkdown';

// Served at /community/beyond-the-prompt.md — a markdown twin of the /community/beyond-the-prompt
// page for LLMs, built from the same SESSIONS data the page renders. Content-negotiates from the
// HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }
    return new Response(buildCommunityBeyondThePromptMarkdown({ siteRoot: SITE_URL }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
