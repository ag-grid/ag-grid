import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { buildContactMarkdown } from '@ag-website-shared/markdown-pages/buildContactMarkdown';
import { DISABLE_MARKDOWN_DOCS, LIBRARY, SITE_URL } from '@constants';

// Served at /contact.md — the markdown twin of the /contact page, built from the same shared copy
// and links the page renders. Content-negotiates from the HTML URL on Accept: text/markdown
// (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildContactMarkdown({
        library: LIBRARY,
        contactUrl: toAbsoluteUrl('/contact/', SITE_URL),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
