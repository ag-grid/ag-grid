import type { DecisionHubCard, DecisionHubContent } from '@ag-website-shared/components/decision-pages/decisionHub';
import type { DecisionPageSite } from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';
import { getStartedMarkdown } from './getStartedMarkdown';

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
    site: Pick<DecisionPageSite, 'resolveUrl' | 'getStarted' | 'urls'>;
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}): string {
    const absolute = (url: string) => toAbsoluteUrl(site.resolveUrl(url), siteRoot);
    const blocks = [
        buildMarkdownFrontmatter({ ...siteFrontmatter, title: hub.title, description: hub.description }),
        `# ${hub.heading}`,
        hub.subHeading,
        `## ${hub.listHeading}`,
        cards.map(({ title, description, url }) => `- [${title}](${absolute(url)}): ${description}`).join('\n'),
        ...getStartedMarkdown(site, absolute),
    ];
    return `${blocks.join('\n\n')}\n`;
}
