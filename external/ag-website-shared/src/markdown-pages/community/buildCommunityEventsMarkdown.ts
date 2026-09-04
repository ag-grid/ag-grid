import { buildMarkdownFrontmatter } from '../markdownFrontmatter';
import { type CommunityMarkdownOptions, eventsByDate, renderEvents } from './communityContent';

/**
 * Build the markdown twin of /community/events: every event the product has sponsored or spoken
 * at, split into upcoming and past. Reads the same events.json the page renders.
 */
export function buildCommunityEventsMarkdown({ product, siteRoot, siteFrontmatter }: CommunityMarkdownOptions): string {
    const { upcoming, past } = eventsByDate();

    const frontmatter = buildMarkdownFrontmatter({
        ...siteFrontmatter,
        title: `${product}: Events`,
        description: `${product} is a regular sponsor and speaker at some of the biggest conferences in the world. Take a look at where we'll be this year or browse through all the events we've sponsored and held since 2018.`,
    });

    const document = [
        frontmatter,
        '# Global Event Participation',
        `${product} is a regular sponsor and speaker at some of the biggest conferences in the world. Take a look at where we'll be this year or browse through all the events we've sponsored and held since 2018.`,
        `## Upcoming Events\n\n${renderEvents(upcoming, siteRoot)}`,
        `## Past Events\n\n${renderEvents(past, siteRoot)}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
