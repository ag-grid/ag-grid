import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { STATIC_PAGE_CONTENT } from '@utils/markdown-pages/staticPageContent';
import { urlWithPrefix } from '@utils/urlWithPrefix';

// Served at /theme-builder.md — the markdown twin of the Theme Builder page. The page IS the
// tool, so there is no prose to mirror; the twin explains what the tool does and points at the
// theming docs, which is what an agent asked about theming actually needs. Content-negotiates
// from the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const content = STATIC_PAGE_CONTENT['theme-builder'];
    const docsUrl = (path: string) => toAbsoluteUrl(urlWithPrefix({ framework: 'javascript', url: path }), SITE_URL);

    const output =
        [
            [
                '---',
                `title: ${JSON.stringify(content.title)}`,
                `description: ${JSON.stringify(content.description)}`,
                '---',
            ].join('\n'),
            `# ${content.heading}`,
            content.description,
            'Theme Builder is an interactive tool, so it has no text version. It runs in the browser at ' +
                `[${content.heading}](${toAbsoluteUrl('/theme-builder/', SITE_URL)}).`,
            'To build a theme in code instead, see the theming documentation:',
            [
                `- [Theming](${docsUrl('./theming/')})`,
                `- [Theming API](${docsUrl('./theming-api/')})`,
                `- [Applying Themes](${docsUrl('./theming-applying-themes/')})`,
            ].join('\n'),
        ].join('\n\n') + '\n';

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
