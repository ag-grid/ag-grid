import { htmlInlineToMarkdown, resolveContentLink } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';

import aboutData from '../../content/about/about.json';
import { buildGridFrontmatter } from './gridFrontmatter';

interface Principle {
    title: string;
    description: string;
}
interface Leader {
    name: string;
    role: string;
    bio: string;
}
interface TimelineEntry {
    year: string;
    title: string;
    description: string;
}
interface ResourceItem {
    title: string;
    description: string;
    url: string;
    external?: boolean;
}
interface Social {
    label: string;
    url: string;
}

function historySection(siteRoot?: string): string {
    const { history } = aboutData.prose;
    const timeline = (aboutData.timeline as TimelineEntry[]).map(
        (entry) => `- **${entry.year} — ${entry.title}**: ${htmlInlineToMarkdown(entry.description, siteRoot)}`
    );
    return `## ${history.heading}\n\n${history.paragraph}\n\n${timeline.join('\n')}`;
}

function principlesSection(): string {
    const { principles } = aboutData.prose;
    const items = (aboutData.principles as Principle[]).map((item) => `- **${item.title}** — ${item.description}`);
    return `## ${principles.heading}\n\n${principles.subheading}\n\n${items.join('\n')}`;
}

function leadershipSection(): string {
    const { leadership } = aboutData.prose;
    const items = (aboutData.leadershipTeam as Leader[]).map(
        (leader) => `- **${leader.name}, ${leader.role}** — ${leader.bio}`
    );
    return `## ${leadership.heading}\n\n${leadership.subheading}\n\n${items.join('\n')}`;
}

function resourcesSection(siteRoot?: string): string {
    const { resources } = aboutData.prose;
    const items = (resources.items as ResourceItem[]).map(
        (item) => `- [${item.title}](${resolveContentLink(item.url, siteRoot)}) — ${item.description}`
    );
    return `## ${resources.heading}\n\n${resources.subheading}\n\n${items.join('\n')}`;
}

function contactSection(siteRoot?: string): string {
    const { contact, office, socials } = aboutData.prose;
    const address = office.addressLines.join(', ');
    const mapLink = `[${office.mapCta}](${office.mapUrl})`;
    const socialLinks = (socials as Social[]).map(
        (social) => `[${social.label}](${resolveContentLink(social.url, siteRoot)})`
    );
    return [
        `## ${contact.heading}`,
        contact.subheading,
        `**${office.heading}:** ${address} (${mapLink})`,
        `Socials: ${socialLinks.join(', ')}`,
    ].join('\n\n');
}

/**
 * Build the markdown twin of the /about page: the company intro, history timeline, principles,
 * leadership team, and contact details. The page is data-driven from about.json (prose,
 * timeline, principles, leadership), so this reads the same file and cannot drift.
 */
export function buildAboutMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const { prose } = aboutData;

    const frontmatter = buildGridFrontmatter({
        pageUrl: '/about/',
        siteRoot,
        title: 'About AG Grid: Our Mission, Principles & Team',
        description:
            'AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are.',
    });

    const memoriam = [
        `## ${prose.memoriam.heading}`,
        prose.memoriam.paragraph,
        `[${prose.memoriam.linkText}](${resolveContentLink(prose.memoriam.linkUrl, siteRoot)})`,
    ].join('\n\n');

    const document = [
        frontmatter,
        '# About Us',
        `**${prose.intro.headingLine1} ${prose.intro.headingLine2}**`,
        htmlInlineToMarkdown(prose.intro.paragraphHtml),
        prose.customerLogosFootnote,
        memoriam,
        historySection(siteRoot),
        principlesSection(),
        leadershipSection(),
        `## ${prose.lifeAt.heading}\n\n${prose.lifeAt.paragraph}`,
        resourcesSection(siteRoot),
        contactSection(siteRoot),
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
