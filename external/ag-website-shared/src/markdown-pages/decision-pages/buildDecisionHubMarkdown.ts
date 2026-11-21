import type { DecisionHubCard, DecisionHubContent } from '@ag-website-shared/components/decision-pages/decisionHub';
import type { DecisionPageSite } from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';

/** The markdown twin of a cluster hub, listing the same cards in the same order as the page. */
export function buildDecisionHubMarkdown({
    hub,
    cards,
    site,
    siteRoot,
    siteFrontmatter,
}: {
    hub: DecisionHubContent;
    cards: DecisionHubCard[];
    site: Pick<DecisionPageSite, 'resolveUrl'>;
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}): string {
    const blocks = [
        buildMarkdownFrontmatter({ ...siteFrontmatter, title: hub.title, description: hub.description }),
        `# ${hub.heading}`,
        hub.subHeading,
        `## ${hub.listHeading}`,
        cards
            .map(
                ({ title, description, url }) =>
                    `- [${title}](${toAbsoluteUrl(site.resolveUrl(url), siteRoot)}): ${description}`
            )
            .join('\n'),
    ];
    return `${blocks.join('\n\n')}\n`;
}
