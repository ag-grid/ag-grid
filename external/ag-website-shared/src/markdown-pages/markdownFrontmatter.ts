/**
 * The single YAML frontmatter block every served `.md` twin opens with.
 *
 * Product-agnostic: every value comes from the caller, so a twin cannot end up with a
 * hand-rolled block that drifts from the rest.
 */

export interface RelatedLink {
    title: string;
    /** Absolute, so the link still resolves when the `.md` is read detached from the site. */
    url: string;
}

export interface MarkdownFrontmatterInput {
    /** e.g. `AG Grid`. */
    product?: string;
    title?: string;
    /** The same text the HTML page uses as its meta description. */
    description?: string;
    /** Only emitted when the page is Enterprise-only, matching the source frontmatter. */
    enterprise?: boolean;
    /** Docs twins only; standalone pages have no framework. */
    framework?: string;
    version?: string;
    /** In the order they should be offered. */
    related?: RelatedLink[];
    /** Absolute URL of the site's `llms.txt`. */
    llmsTxt?: string;
}

/**
 * The fields that come from the site rather than the page, so a shared builder does not need
 * to know which product is rendering it.
 */
export type SiteFrontmatterFields = Pick<MarkdownFrontmatterInput, 'product' | 'related' | 'llmsTxt'>;

/** JSON string syntax is a subset of YAML's, so this quotes and escapes in one step. */
function scalar(value: string): string {
    return JSON.stringify(value);
}

/** Key order is identity, then classification, then navigation. Unsupplied fields are omitted. */
export function buildMarkdownFrontmatter({
    product,
    title,
    description,
    enterprise,
    framework,
    version,
    related,
    llmsTxt,
}: MarkdownFrontmatterInput): string {
    const lines = ['---'];
    if (product) {
        lines.push(`product: ${scalar(product)}`);
    }
    if (title) {
        lines.push(`title: ${scalar(title)}`);
    }
    if (description) {
        lines.push(`description: ${scalar(description)}`);
    }
    if (enterprise) {
        lines.push('enterprise: true');
    }
    // Bare rather than quoted: a fixed keyword, not free text.
    if (framework) {
        lines.push(`framework: ${framework}`);
    }
    if (version) {
        lines.push(`version: ${scalar(version)}`);
    }
    if (related?.length) {
        lines.push('related:');
        for (const link of related) {
            lines.push(`    - title: ${scalar(link.title)}`);
            lines.push(`      url: ${scalar(link.url)}`);
        }
    }
    if (llmsTxt) {
        lines.push(`llms: ${scalar(llmsTxt)}`);
    }
    lines.push('---');
    return lines.join('\n');
}
