import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import faqData from '../../content/faqs/homepage.json';
import homepageData from '../../content/homepage/homepage.json';
import versionsData from '../../content/versions/ag-grid-versions.json';

// The page is framework-agnostic; resolve its framework-prefixed CTA links against a single
// framework, matching the other markdown twins (license-pricing, AGENTS.md).
const FRAMEWORK = 'javascript';
const NUM_WHATS_NEW = 3;

interface HomepageSection {
    id: string;
    tag?: string;
    heading?: string;
    headingHtml?: string;
    subHeading?: string;
    subHeadingHtml?: string;
    ctaTitle?: string;
    ctaUrl?: string;
    ctaUrlIsBaseUrl?: boolean;
}
interface FaqItem {
    question: string;
    answer: string;
}
interface VersionHighlight {
    text: string;
}
interface VersionEntry {
    version: string;
    date?: string;
    highlights?: VersionHighlight[];
}

function resolveCtaUrl(section: HomepageSection, siteRoot?: string): string | undefined {
    if (!section.ctaUrl) {
        return undefined;
    }
    // Framework CTAs store a './'-relative path resolved by the grid framework prefix at render;
    // the rest are already root-relative.
    const url = section.ctaUrl.startsWith('./')
        ? urlWithPrefix({ framework: FRAMEWORK, url: section.ctaUrl })
        : section.ctaUrl;
    return toAbsoluteUrl(url, siteRoot);
}

function whatsNewSection(): string {
    const versions = (versionsData as VersionEntry[])
        .filter((version) => version.version.endsWith('.0'))
        .slice(0, NUM_WHATS_NEW)
        .filter((version) => version.highlights);
    return versions
        .map((version) => {
            const date = version.date ? ` — ${version.date}` : '';
            const highlights = version.highlights!.map((highlight) => `- ${highlight.text}`).join('\n');
            return `### ${version.version}${date}\n\n${highlights}`;
        })
        .join('\n\n');
}

function faqSection(): string {
    return (faqData as FaqItem[]).map((item) => `### ${item.question}\n\n${item.answer}`).join('\n\n');
}

function sectionBlock(section: HomepageSection, siteRoot?: string): string {
    const heading = section.headingHtml ? htmlInlineToMarkdown(section.headingHtml, siteRoot) : section.heading;
    const subHeading = section.subHeadingHtml
        ? htmlInlineToMarkdown(section.subHeadingHtml, siteRoot)
        : section.subHeading;

    const parts = [`## ${heading}`];
    if (subHeading) {
        parts.push(subHeading);
    }
    const ctaUrl = resolveCtaUrl(section, siteRoot);
    if (ctaUrl && section.ctaTitle) {
        parts.push(`[${section.ctaTitle}](${ctaUrl})`);
    }
    if (section.id === 'whats-new') {
        parts.push(whatsNewSection());
    }
    if (section.id === 'faq-section') {
        parts.push(faqSection());
    }
    return parts.join('\n\n');
}

/**
 * Build the markdown twin of the homepage (/). Reads the shared homepage content (hero + section
 * copy), the homepage FAQ, and the versions data the page renders, so it stays in step with the
 * page. The bespoke interactive demos on the page are represented here by their section copy.
 */
export function buildHomepageMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const { hero, sections } = homepageData;

    const frontmatter = [
        '---',
        'title: "AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"',
        'description: "AG Grid is a feature-rich Data Grid for all major JavaScript frameworks, offering filtering, grouping, pivoting, and more. Free and open-source. Upgrade to Enterprise for advanced features."',
        '---',
    ].join('\n');

    const heroLinks = [
        `[${hero.seeDemosText}](${toAbsoluteUrl(urlWithPrefix({ framework: FRAMEWORK, url: hero.seeDemosUrl }), siteRoot)})`,
        `[${hero.githubText}](${hero.githubUrl})`,
    ].join(' | ');

    const document = [
        frontmatter,
        `# ${hero.headingPrefix} ${hero.headingSuffix}`,
        hero.subHeading,
        heroLinks,
        ...(sections as HomepageSection[]).map((section) => sectionBlock(section, siteRoot)),
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
