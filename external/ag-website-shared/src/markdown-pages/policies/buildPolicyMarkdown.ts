import type { PolicyContent, PolicyName } from '@ag-website-shared/components/policies/policyContent';
import { POLICY_CONTENT, policyHeading } from '@ag-website-shared/components/policies/policyContent';
import cookiesData from '@ag-website-shared/content/policies/cookies-data-07-08-26.json';
import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import type { MarkdocConfigLike, MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';

export interface BuildPolicyMarkdownOptions {
    policy: PolicyName;
    /** Product name substituted into the heading, e.g. `AG Grid`. */
    name: string;
    /**
     * Raw `.mdoc` source for the policy body, or undefined for a policy with no numbered body
     * (`your-choice` is intro prose only). Import it with Vite's `?raw` suffix.
     */
    body?: string;
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
    const renderedBody = body
        ? await renderMarkdocToMarkdown({
              body,
              framework: 'javascript',
              pageName: policy,
              markdocConfig,
              resolvers,
          })
        : '';
    // Strip the frontmatter block the renderer emits; this page supplies its own below.
    const policyBody = renderedBody.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();

    const document = [
        [
            '---',
            `title: ${JSON.stringify(`${name}: ${content.metaTitle}`)}`,
            `description: ${JSON.stringify(content.description)}`,
            '---',
        ].join('\n'),
        `# ${heading}`,
        ...content.meta.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        ...content.intro.map((line) => htmlInlineToMarkdown(line, siteRoot)),
        policyBody,
        ...cookiesInventory(content.cookiesSection),
    ].filter(Boolean);

    return `${document.join('\n\n').trimEnd()}\n`;
}

/**
 * The cookie inventory the page renders below the policy body via `CookiesTable` (AG-18105), as one
 * markdown table per category. Reads the same JSON the component does, so the two cannot drift.
 * Returns nothing for policies with no such section.
 */
function cookiesInventory(section: PolicyContent['cookiesSection']): string[] {
    if (!section) {
        return [];
    }
    const categories = cookiesData.categories.flatMap(({ name, description, cookies }) => {
        // Mirrors the component: a few entries cover a whole domain rather than a named cookie.
        const rows = cookies.map(({ name: cookieName, subgroup, party, moreInfo }) => {
            const label = cookieName ?? '—';
            return [subgroup, moreInfo ? `[${label}](${moreInfo})` : label, party];
        });
        return [`### ${name}`, description, markdownTable(['Cookie Subgroup', 'Cookies', 'Cookies used'], rows)];
    });
    return [`## ${section.heading}`, section.note, ...categories].filter(Boolean);
}
