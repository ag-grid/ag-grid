import events from '@ag-website-shared/content/community/events.json';
import blogs from '@ag-website-shared/content/community/news-updates/blogs.json';
import podcasts from '@ag-website-shared/content/community/news-updates/podcasts.json';
import videos from '@ag-website-shared/content/community/news-updates/videos.json';
import showcase from '@ag-website-shared/content/community/showcase.json';
import socialChannels from '@ag-website-shared/content/community/socials.json';
import supportSites from '@ag-website-shared/content/community/support.json';
import tools from '@ag-website-shared/content/community/tools-extensions.json';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import type { SiteFrontmatterFields } from '../markdownFrontmatter';

// Shared renderers for the /community landing twin and the community subpage twins, all reading
// the same community JSON the pages render, so the markdown cannot drift from the site. The
// community section is shared across AG products, so the builders are parameterised by the
// product brand (used in headings) and the current site (used to pick per-site support links).

export type CommunitySite = 'grid' | 'charts' | 'studio';

export interface CommunityMarkdownOptions {
    /** Product brand used in headings/frontmatter, e.g. "AG Grid", "AG Charts", "AG Studio". */
    product: string;
    /** Which site is rendering, used to pick per-site links (e.g. Support gridLink vs chartsLink). */
    currentSite: CommunitySite;
    /** Canonical site root with trailing slash, for absolutising internal links. */
    siteRoot?: string;
    /** Site-wide frontmatter fields (product, related links, llms.txt) from the rendering site. */
    siteFrontmatter?: SiteFrontmatterFields;
}

export interface CommunityEvent {
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate?: string;
    eventPage: string;
}
export interface ShowcaseItem {
    title: string;
    description: string;
    link?: string;
    repo?: string;
    tags?: string[];
    frameworks?: string[];
}
interface ToolItem {
    title: string;
    description: string;
    link: string;
}
interface Video {
    title: string;
    link: string;
    author: string;
    published: string;
}
interface Podcast {
    title: string;
    website?: string;
    link?: string;
    description: string;
}
interface Blog {
    title: string;
    description: string;
    link: string;
}
interface SupportSite {
    title: string;
    desc: string;
    gridLink: string;
    chartsLink: string;
}
interface Social {
    url: string;
}

export function mdLink(text: string, url: string | undefined, siteRoot?: string): string {
    return url ? `[${text}](${toAbsoluteUrl(url, siteRoot)})` : text;
}

/* ------------------------------------------------------------------------ events */

// Same filter as UpcomingEvents.tsx: this calendar year's events, chronological, last `limit`.
export function upcomingThisYear(limit: number): CommunityEvent[] {
    const year = new Date().getFullYear();
    const filtered = (events as CommunityEvent[]).filter((event) => new Date(event.startDate).getFullYear() === year);
    return filtered
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(filtered.length - limit);
}

// Same split as Events.tsx: startDate in the future is upcoming, otherwise past (newest first).
export function eventsByDate(): { upcoming: CommunityEvent[]; past: CommunityEvent[] } {
    const now = new Date();
    const byDateDesc = (a: CommunityEvent, b: CommunityEvent) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    const upcoming = (events as CommunityEvent[]).filter((event) => new Date(event.startDate) >= now).sort(byDateDesc);
    const past = (events as CommunityEvent[]).filter((event) => new Date(event.startDate) < now).sort(byDateDesc);
    return { upcoming, past };
}

export function renderEvents(list: CommunityEvent[], siteRoot?: string): string {
    if (!list.length) {
        return '_None recorded._';
    }
    return list
        .map((event) => {
            const dates = event.endDate ? `${event.startDate} – ${event.endDate}` : event.startDate;
            return `- **${mdLink(event.title, event.eventPage, siteRoot)}** — ${event.location}, ${dates}: ${event.description}`;
        })
        .join('\n');
}

/* --------------------------------------------------------------------- showcase */

export function showcaseFavourites(): ShowcaseItem[] {
    return (showcase as { favourites: ShowcaseItem[] }).favourites ?? [];
}

// The Showcase "Full Showcase" view renders `other` (favouritesOnly ? favourites : other).
export function showcaseOther(): ShowcaseItem[] {
    return (showcase as { other?: ShowcaseItem[] }).other ?? [];
}

export function renderShowcase(list: ShowcaseItem[], siteRoot?: string): string {
    return list
        .map((item) => {
            const meta = [item.tags?.join(', '), item.frameworks?.join(', ')].filter(Boolean).join('; ');
            const suffix = meta ? ` (${meta})` : '';
            const repo = item.repo ? ` — ${mdLink('repo', item.repo, siteRoot)}` : '';
            return `- **${mdLink(item.title, item.link ?? item.repo, siteRoot)}** — ${item.description}${suffix}${repo}`;
        })
        .join('\n');
}

/* ------------------------------------------------------------- tools & media */

export function allTools(): ToolItem[] {
    return tools as ToolItem[];
}

export function renderTools(list: ToolItem[], siteRoot?: string): string {
    return list.map((tool) => `- **${mdLink(tool.title, tool.link, siteRoot)}** — ${tool.description}`).join('\n');
}

export function renderVideosTable(siteRoot?: string): string {
    const rows = (videos as Video[]).map((video) => [
        mdLink(video.title, video.link, siteRoot),
        video.author,
        video.published,
    ]);
    return markdownTable(['Title', 'Author', 'Published'], rows);
}

export function renderPodcasts(siteRoot?: string): string {
    return (podcasts as Podcast[])
        .map(
            (podcast) =>
                `- **${mdLink(podcast.title, podcast.website ?? podcast.link, siteRoot)}** — ${podcast.description}`
        )
        .join('\n');
}

export function renderBlogs(siteRoot?: string): string {
    return (blogs as Blog[])
        .map((blog) => `- **${mdLink(blog.title, blog.link, siteRoot)}** — ${blog.description}`)
        .join('\n');
}

/* --------------------------------------------------------------------- support */

// Mirror the Support component: grid uses gridLink, every other site uses chartsLink.
export function renderSupport(currentSite: CommunitySite, siteRoot?: string): string {
    return (supportSites as SupportSite[])
        .map((site) => {
            const link = currentSite === 'grid' ? site.gridLink : site.chartsLink;
            return `- **${mdLink(site.title, link, siteRoot)}** — ${site.desc}`;
        })
        .join('\n');
}

export function renderSocialsLine(siteRoot?: string): string {
    return (socialChannels as Social[]).map((social) => mdLink(social.url, social.url, siteRoot)).join(', ');
}
