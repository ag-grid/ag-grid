import whatsNewData from '@ag-website-shared/content/whats-new/data.json';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';

/** How many versions the page lists; the twin matches it so the two show the same releases. */
const MAX_VERSIONS = 12;

export interface WhatsNewVersion {
    version: string;
    date?: string;
    /** Mirrors the page's `Highlight` component: an absolute `url`, a product-docs `path`, or a charts-docs `chartsPath`. */
    highlights?: Array<{ text: string; url?: string; path?: string; chartsPath?: string }>;
    notesPath?: string;
    hideBlogPostLink?: boolean;
}

export interface BuildWhatsNewMarkdownOptions {
    /** Product key into the shared whats-new data (`grid`, `charts`, `studio`). */
    site: keyof typeof whatsNewData;
    /** The `versions` collection, as the page receives it. */
    versionsData: WhatsNewVersion[];
    siteRoot?: string;
    /**
     * Resolve a highlight's `./`-prefixed docs path — the site's `urlWithPrefix` bound to a
     * framework. Highlights link into framework docs, so a product without a framework dimension
     * can pass its plain base-URL helper instead.
     */
    resolveUrl: (url: string) => string;
    /** Resolve a highlight's `chartsPath` into the charts docs, as the page's `Highlight` does. */
    resolveChartsUrl?: (url: string) => string;
}

/** The page title and description, shared so the twin's frontmatter matches the page's meta. */
export function whatsNewMeta(site: BuildWhatsNewMarkdownOptions['site']) {
    const { name } = whatsNewData[site];
    return {
        title: `${name} What's new`,
        description: `See what's new in recent ${name} versions. View feature highlights, browse release notes or read our release blogs. Includes major and minor releases.`,
    };
}

/**
 * Build the markdown twin of the What's New page. Reads the same `versions` data and shared
 * product metadata the page renders, applies the same "has highlights" filter and the same
 * 12-version cap, and derives blog URLs the same way — so the two cannot drift.
 *
 * Product-agnostic: AG Grid, AG Charts and AG Studio share this module.
 */
export function buildWhatsNewMarkdown({
    site,
    versionsData,
    siteRoot,
    resolveUrl,
    resolveChartsUrl,
}: BuildWhatsNewMarkdownOptions): string {
    const { name, blogPrefix } = whatsNewData[site];
    const { title, description } = whatsNewMeta(site);

    const versions = versionsData.filter((version) => version.highlights).slice(0, MAX_VERSIONS);

    const document: string[] = [
        ['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, '---'].join('\n'),
        `# What's New in ${name}`,
        `See what's new in recent ${name} versions.`,
    ];

    for (const [index, versionInfo] of versions.entries()) {
        const { major, minor, isMajor } = parseVersion(versionInfo.version);
        const blogUrl = `${minor ? `${blogPrefix}${major}-${minor}` : `${blogPrefix}${major}`}/`;

        const heading = [
            `## ${versionInfo.version}`,
            index === 0 ? '(latest)' : '',
            versionInfo.date ? `— ${versionInfo.date}` : '',
        ]
            .filter(Boolean)
            .join(' ');
        document.push(heading);
        document.push('Feature Highlights');

        // Same precedence as the page's `Highlight` component: absolute url, then product docs
        // path, then charts docs path, else plain text.
        const highlights = (versionInfo.highlights ?? []).map(({ text, url, path, chartsPath }) => {
            if (url) {
                return `- [${text}](${url})`;
            }
            if (path) {
                return `- [${text}](${toAbsoluteUrl(resolveUrl(path), siteRoot)})`;
            }
            if (chartsPath && resolveChartsUrl) {
                return `- [${text}](${toAbsoluteUrl(resolveChartsUrl(chartsPath), siteRoot)})`;
            }
            return `- ${text}`;
        });
        if (highlights.length) {
            document.push(highlights.join('\n'));
        }

        const links = [
            // The page labels this button by release kind; keep the same wording.
            versionInfo.notesPath
                ? `[${isMajor ? 'See migration guide' : 'See release notes'}](${toAbsoluteUrl(resolveUrl(versionInfo.notesPath), siteRoot)})`
                : undefined,
            versionInfo.hideBlogPostLink ? undefined : `[Read more](${blogUrl})`,
        ].filter(Boolean);
        if (links.length) {
            document.push(links.join(' | '));
        }
    }

    return `${document.join('\n\n').trimEnd()}\n`;
}
