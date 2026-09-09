import type { PolicyContent, PolicyName } from '@ag-website-shared/components/policies/policyContent';
import { POLICY_CONTENT, policyHeading } from '@ag-website-shared/components/policies/policyContent';
import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import type { MarkdocConfigLike, MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';

/** Policies whose page renders a `.mdoc` body. `cookies` renders the Enzuzo embed instead. */
export type MdocPolicyName = Exclude<PolicyName, 'cookies'>;

interface PolicyBodyOptions {
    /** Raw `.mdoc` source for the policy body. Import it with Vite's `?raw` suffix. */
    body: string;
    /** The product's Markdoc config, so tags and functions resolve exactly as on the page. */
    markdocConfig: MarkdocConfigLike;
    resolvers?: MarkdownResolvers;
    siteRoot?: string;
    /** Site-wide frontmatter fields (product, related links, llms.txt) from the rendering site. */
    siteFrontmatter?: SiteFrontmatterFields;
}

export interface BuildPolicyMarkdownOptions extends PolicyBodyOptions {
    policy: MdocPolicyName;
    /** Product name substituted into the heading, e.g. `AG Grid`. */
    name: string;
}

export interface BuildPolicyPageMarkdownOptions extends PolicyBodyOptions {
    /** Heading, meta and intro copy shared with the page, with any `{name}` already resolved. */
    content: PolicyContent;
    /** Product name for the frontmatter title, e.g. `AG Grid`. */
    name: string;
    /** URL slug of the page, e.g. `terms-of-use`. */
    pageName: string;
}

/**
 * Build the markdown twin of a legal/policy page: the shared heading, effective-date block and
 * intro paragraphs from `POLICY_CONTENT`, followed by the policy body rendered from the same
 * `.mdoc` the page renders. The page's in-page table of contents is omitted — it is navigation
 * chrome, and the headings it links to are present in the markdown already.
 *
 * Product-agnostic: AG Grid, AG Charts and AG Studio share this module and differ only in the
 * `name` they render and the Markdoc config they pass.
 */
export async function buildPolicyMarkdown({ policy, name, ...options }: BuildPolicyMarkdownOptions): Promise<string> {
    const content = { ...POLICY_CONTENT[policy], heading: policyHeading(policy, name) };

    return buildPolicyPageMarkdown({ content, name, pageName: policy, ...options });
}

/**
 * The same twin for a policy page whose copy is not in `POLICY_CONTENT` — one a single site
 * publishes on its own, with its content defined alongside its page.
 */
export async function buildPolicyPageMarkdown({
    content,
    name,
    pageName,
    body,
    markdocConfig,
    resolvers,
    siteRoot,
    siteFrontmatter,
}: BuildPolicyPageMarkdownOptions): Promise<string> {
    // The policy body carries its own numbered `###` headings, so render it without a frontmatter
    // title and prepend the shared preamble here — otherwise the twin would have two H1s.
    const renderedBody = await renderMarkdocToMarkdown({
        body,
        framework: 'javascript',
        pageName,
        markdocConfig,
        resolvers,
    });
    // Strip the frontmatter block the renderer emits; this page supplies its own below.
    const policyBody = renderedBody.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();

    const document = [
        frontmatter(content, name, siteFrontmatter),
        `# ${content.heading}`,
        ...content.meta.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        ...content.intro.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        policyBody,
    ].filter(Boolean);

    return `${document.join('\n\n').trimEnd()}\n`;
}

/**
 * The `/cookies.md` twin. The cookies page renders the Enzuzo embed, which builds the policy in the
 * browser from an automated scan (AG-18194), so there is no source this can re-render as markdown
 * the way the other policies' twins re-render their `.mdoc`. Point readers at the page instead of
 * fetching the embed at build time, which would make the build depend on a third-party request.
 */
export function buildCookiesMarkdown({
    name,
    siteRoot,
    siteFrontmatter,
}: {
    name: string;
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}): string {
    const policy = 'cookies';
    const url = `${(siteRoot ?? '/').replace(/\/$/, '')}/cookies/`;

    const document = [
        frontmatter(POLICY_CONTENT[policy], name, siteFrontmatter),
        `# ${policyHeading(policy, name)}`,
        `${POLICY_CONTENT[policy].description} It is generated from our consent-management platform, which scans the site for the cookies actually in use, and is published in full at [${url}](${url}).`,
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}

/** The frontmatter block every policy twin opens with, from the copy shared with its page. */
function frontmatter(content: PolicyContent, name: string, siteFrontmatter?: SiteFrontmatterFields): string {
    return buildMarkdownFrontmatter({
        ...siteFrontmatter,
        title: `${name}: ${content.metaTitle}`,
        description: content.description,
    });
}
