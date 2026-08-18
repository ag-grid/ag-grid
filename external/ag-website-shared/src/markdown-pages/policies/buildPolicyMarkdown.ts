import type { PolicyName } from '@ag-website-shared/components/policies/policyContent';
import { POLICY_CONTENT, policyHeading } from '@ag-website-shared/components/policies/policyContent';
import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import type { MarkdocConfigLike, MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';

/** Policies whose page renders a `.mdoc` body. `cookies` renders the Enzuzo embed instead. */
export type MdocPolicyName = Exclude<PolicyName, 'cookies'>;

export interface BuildPolicyMarkdownOptions {
    policy: MdocPolicyName;
    /** Product name substituted into the heading, e.g. `AG Grid`. */
    name: string;
    /** Raw `.mdoc` source for the policy body. Import it with Vite's `?raw` suffix. */
    body: string;
    /** The product's Markdoc config, so tags and functions resolve exactly as on the page. */
    markdocConfig: MarkdocConfigLike;
    resolvers?: MarkdownResolvers;
    siteRoot?: string;
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
export async function buildPolicyMarkdown({
    policy,
    name,
    body,
    markdocConfig,
    resolvers,
    siteRoot,
}: BuildPolicyMarkdownOptions): Promise<string> {
    const content = POLICY_CONTENT[policy];
    const heading = policyHeading(policy, name);

    // The policy body carries its own numbered `###` headings, so render it without a frontmatter
    // title and prepend the shared preamble here — otherwise the twin would have two H1s.
    const renderedBody = await renderMarkdocToMarkdown({
        body,
        framework: 'javascript',
        pageName: policy,
        markdocConfig,
        resolvers,
    });
    // Strip the frontmatter block the renderer emits; this page supplies its own below.
    const policyBody = renderedBody.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();

    const document = [
        frontmatter(policy, name),
        `# ${heading}`,
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
export function buildCookiesMarkdown({ name, siteRoot }: { name: string; siteRoot?: string }): string {
    const policy = 'cookies';
    const url = `${(siteRoot ?? '/').replace(/\/$/, '')}/cookies/`;

    const document = [
        frontmatter(policy, name),
        `# ${policyHeading(policy, name)}`,
        `${POLICY_CONTENT[policy].description} It is generated from our consent-management platform, which scans the site for the cookies actually in use, and is published in full at [${url}](${url}).`,
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}

/** The frontmatter block every policy twin opens with, from the copy shared with its page. */
function frontmatter(policy: PolicyName, name: string): string {
    const content = POLICY_CONTENT[policy];

    return [
        '---',
        `title: ${JSON.stringify(`${name}: ${content.metaTitle}`)}`,
        `description: ${JSON.stringify(content.description)}`,
        '---',
    ].join('\n');
}
