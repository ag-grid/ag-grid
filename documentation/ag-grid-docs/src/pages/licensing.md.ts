import { buildFrameworkRedirectMarkdown } from '@ag-website-shared/markdown-pages/buildFrameworkRedirectMarkdown';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { DISABLE_MARKDOWN_DOCS, FRAMEWORKS, FRAMEWORK_DISPLAY_TEXT, SITE_URL } from '@constants';
import { STATIC_PAGE_CONTENT } from '@utils/markdown-pages/staticPageContent';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

// Served at /licensing.md — the markdown twin of the /licensing redirect stub. The page bounces
// the visitor to their remembered framework, which a non-browser reader cannot do, so the twin
// lists every framework destination instead. Content-negotiates from the HTML URL on
// Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const content = STATIC_PAGE_CONTENT.licensing;
    const output = buildFrameworkRedirectMarkdown({
        title: content.title,
        description: content.description,
        heading: content.heading,
        destinations: FRAMEWORKS.map((framework) => ({
            label: FRAMEWORK_DISPLAY_TEXT[framework],
            url: urlWithBaseUrl(`/${getFrameworkPath(framework)}/${content.redirectPageName}/`),
        })),
        siteRoot: SITE_URL,
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
