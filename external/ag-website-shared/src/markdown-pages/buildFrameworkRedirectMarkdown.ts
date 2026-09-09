import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from './markdownFrontmatter';

export interface BuildFrameworkRedirectMarkdownOptions {
    title: string;
    description: string;
    /** H1 for the twin — the page's own heading is redirect chrome ("Redirecting to…"). */
    heading: string;
    /** One entry per framework: its display name and the URL the page would redirect to. */
    destinations: Array<{ label: string; url: string }>;
    siteRoot?: string;
    /** Site-wide frontmatter fields (product, related links, llms.txt) from the rendering site. */
    siteFrontmatter?: SiteFrontmatterFields;
}

/**
 * Build the markdown twin of a framework-redirect stub (`/reference`, `/licensing`). These pages
 * carry no content of their own: they bounce the visitor to the docs page for the framework held
 * in their local storage. A reader with no local storage — an LLM — needs the destinations spelled
 * out, so the twin lists one link per framework instead of the redirect notice.
 *
 * Product-agnostic: the caller supplies the destinations, so AG Grid, AG Charts and AG Studio
 * share this module.
 */
export function buildFrameworkRedirectMarkdown({
    title,
    description,
    heading,
    destinations,
    siteRoot,
    siteFrontmatter,
}: BuildFrameworkRedirectMarkdownOptions): string {
    const document = [
        buildMarkdownFrontmatter({ ...siteFrontmatter, title, description }),
        `# ${heading}`,
        description,
        'This page redirects to the version for your framework. Pick one:',
        destinations.map(({ label, url }) => `- [${label}](${toAbsoluteUrl(url, siteRoot)})`).join('\n'),
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}
