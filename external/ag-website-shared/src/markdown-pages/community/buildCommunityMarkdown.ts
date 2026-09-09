import {
    COMMUNITY_EVENTS_LIMIT,
    COMMUNITY_SHOWCASE_LIMIT,
    COMMUNITY_TOOLS_LIMIT,
} from '@ag-website-shared/components/community/constants';

import { buildMarkdownFrontmatter } from '../markdownFrontmatter';
import {
    type CommunityMarkdownOptions,
    allTools,
    renderEvents,
    renderShowcase,
    renderSocialsLine,
    renderSupport,
    renderTools,
    renderVideosTable,
    showcaseFavourites,
    upcomingThisYear,
} from './communityContent';

/**
 * Build the markdown twin of the /community/ landing page: this year's events, showcase
 * favourites, community tools & extensions, media, and support/social channels. The page and
 * its content are shared across AG products, so this reads the same community JSON and is
 * parameterised by product brand and current site.
 */
export function buildCommunityMarkdown({
    product,
    currentSite,
    siteRoot,
    siteFrontmatter,
}: CommunityMarkdownOptions): string {
    const frontmatter = buildMarkdownFrontmatter({
        ...siteFrontmatter,
        title: `${product} Community`,
        description: `Dedicated to our open-source ${product} community. Browse open-source projects, find 3rd party Data Grid tools, and stay up-to-date with the latest news.`,
    });

    const document = [
        frontmatter,
        `# ${product} Community`,
        `Dedicated to our open-source ${product} community — open-source projects, third-party Data Grid tools, events, media, and support channels.`,
        `## Events\n\n${renderEvents(upcomingThisYear(COMMUNITY_EVENTS_LIMIT), siteRoot)}`,
        `## Showcase\n\n${renderShowcase(showcaseFavourites().slice(0, COMMUNITY_SHOWCASE_LIMIT), siteRoot)}`,
        `## Tools & Extensions\n\n${renderTools(allTools().slice(0, COMMUNITY_TOOLS_LIMIT), siteRoot)}`,
        `## Media\n\n${renderVideosTable(siteRoot)}`,
        `## Support & Socials\n\n${renderSupport(currentSite, siteRoot)}\n\nSocials: ${renderSocialsLine(siteRoot)}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
