import type {
    ExtractSection,
    LandingPageContent,
    LandingPageSectionType,
} from '@ag-website-shared/components/landing-pages/types';
import { htmlInlineToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';

export interface LandingPageVersion {
    version: string;
    landingPageHighlight?: string;
}

export interface BuildLandingPageMarkdownOptions {
    /** The same `landingPages` collection entry `LandingPage.astro` renders. */
    content: LandingPageContent;
    /** The `versions` collection, for the hero's version badge. */
    versions?: LandingPageVersion[];
    /** Canonical origin, so links survive being read out of context. */
    siteRoot?: string;
    /**
     * Resolve a content URL to a site-relative path — the site's `urlWithBaseUrl`. Section CTAs,
     * feature links and example links store `./`-prefixed paths that ALREADY include the framework
     * segment (`./react-data-grid/getting-started`), so this must be the base-URL helper.
     */
    resolveUrl: (url: string) => string;
    /**
     * Resolve a link inside an FAQ answer — the site's `urlWithPrefix` bound to the page's
     * framework. FAQ answers are Markdoc, rendered by `renderFAQAnswers` with the page framework,
     * so their `./` links are framework-RELATIVE (`./getting-started/`) and need the prefixing
     * helper instead. Defaults to `resolveUrl` for sites without a framework dimension.
     */
    resolveFaqUrl?: (url: string) => string;
    /** Site-wide frontmatter fields (product, related links, llms.txt) from the rendering site. */
    siteFrontmatter?: SiteFrontmatterFields;
}

export type Resolve = (url: string) => string;

export function link(text: string, url: string, resolve: Resolve, siteRoot?: string): string {
    return `[${text}](${url.startsWith('http') ? url : toAbsoluteUrl(resolve(url), siteRoot)})`;
}

/**
 * Rewrite the targets of markdown links already present in authored copy (FAQ answers are
 * Markdoc, so they arrive as markdown rather than as a URL field to resolve).
 */
export function resolveMarkdownLinks(markdown: string, resolve: Resolve, siteRoot?: string): string {
    return markdown.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (match, text: string, target: string) => {
        if (target.startsWith('http') || target.startsWith('mailto') || target.startsWith('#')) {
            return match;
        }
        return `[${text}](${toAbsoluteUrl(resolve(target), siteRoot)})`;
    });
}

/**
 * The eyebrow headline that labels a section above its heading on the page. Kept as an
 * emphasised kicker so it holds that reading order without adding a heading level —
 * matching how the homepage twin renders its section tags.
 */
export function sectionHeader(
    section: { tag?: string; heading?: string; headingHtml?: string; subHeading?: string; subHeadingHtml?: string },
    siteRoot?: string
): string[] {
    const heading = section.headingHtml ? htmlInlineToMarkdown(section.headingHtml, siteRoot) : section.heading;
    const subHeading = section.subHeadingHtml
        ? htmlInlineToMarkdown(section.subHeadingHtml, siteRoot)
        : section.subHeading;

    const parts: string[] = [];
    if (section.tag) {
        parts.push(`*${section.tag}*`);
    }
    if (heading) {
        parts.push(`## ${heading}`);
    }
    if (subHeading) {
        parts.push(subHeading);
    }
    return parts;
}

function featuresBody(section: ExtractSection<'features'>, resolve: Resolve, siteRoot?: string): string[] {
    return section.items.map((item) => {
        const title = item.isEnterprise ? `### ${item.title} (Enterprise)` : `### ${item.title}`;
        const bullets = item.features.map((feature) => {
            const heading = feature.link
                ? `**${link(feature.heading, feature.link, resolve, siteRoot)}**`
                : `**${feature.heading}**`;
            return `- ${heading} — ${feature.detail}`;
        });
        const more = item.docsLink ? `\n\n${link(`More on ${item.title}`, item.docsLink, resolve, siteRoot)}` : '';
        return `${title}\n\n${bullets.join('\n')}${more}`;
    });
}

function examplesBody(section: ExtractSection<'examples'>, resolve: Resolve, siteRoot?: string): string[] {
    const items = section.items.map((item) => {
        const demo = item.demo ? ` (${link('live demo', item.demo, resolve, siteRoot)})` : '';
        return `- **${link(item.title, item.docs, resolve, siteRoot)}** — ${item.content}${demo}`;
    });
    return [items.join('\n')];
}

function pricingBody(section: ExtractSection<'pricing'>, resolve: Resolve, siteRoot?: string): string[] {
    return section.cards.map((card) => {
        const features = card.features.map((feature) => `- ${feature}`).join('\n');
        return [
            `### ${card.title} — ${card.price}`,
            `*${card.priceNote}*`,
            features,
            link(card.ctaText, card.ctaUrl, resolve, siteRoot),
        ].join('\n\n');
    });
}

/** Section body beyond the shared tag/heading/subheading header. */
export function sectionBody(
    section: LandingPageSectionType,
    resolve: Resolve,
    resolveFaq: Resolve,
    siteRoot?: string
): string[] {
    switch (section.type) {
        case 'features':
            return featuresBody(section, resolve, siteRoot);
        case 'examples':
            return examplesBody(section, resolve, siteRoot);
        case 'faq':
            return section.items.map(
                (item) => `### ${item.question}\n\n${resolveMarkdownLinks(item.answer, resolveFaq, siteRoot)}`
            );
        case 'contact':
            return [section.features.map((feature) => `- ${feature}`).join('\n')];
        case 'pricing':
            return pricingBody(section, resolve, siteRoot);
        // The remaining sections are interactive on the page (a showcase carousel, the customer
        // logo wall, the automated integrated-charts demo, the comparison table, the theme
        // builder video). They carry no further prose, so their heading and subheading are the
        // whole of their content here.
        case 'hero':
        case 'showcase':
        case 'customers':
        case 'integrated-charts':
        case 'theme-builder':
        case 'comparison':
            return [];
    }
}

/**
 * Build the markdown twin of a content-driven landing page. Reads the same `landingPages`
 * collection entry `LandingPage.astro` renders and walks the same `sections` discriminated
 * union in the same order, so the two cannot drift.
 *
 * Product-agnostic: the caller injects `resolveUrl` (its site's `urlWithBaseUrl`), so AG Grid,
 * AG Charts and AG Studio share this module and differ only in how they resolve content URLs.
 */
export function buildLandingPageMarkdown({
    content,
    versions,
    siteRoot,
    resolveUrl,
    resolveFaqUrl = resolveUrl,
    siteFrontmatter,
}: BuildLandingPageMarkdownOptions): string {
    const hero = content.sections.find((section) => section.type === 'hero');
    const latestVersion = versions?.find((version) => version.landingPageHighlight);

    const frontmatter = buildMarkdownFrontmatter({
        ...siteFrontmatter,
        title: content.meta.title,
        description: content.meta.description,
    });

    const intro: string[] = [];
    if (hero) {
        const heading = hero.headingHtml ? htmlInlineToMarkdown(hero.headingHtml, siteRoot) : hero.heading;
        intro.push(`# ${heading}`);
        intro.push(hero.subHeadingHtml ? htmlInlineToMarkdown(hero.subHeadingHtml, siteRoot) : hero.subHeading);
        if (hero.showVersionBadge && latestVersion) {
            intro.push(`**Latest version:** v${latestVersion.version} — ${latestVersion.landingPageHighlight}`);
        }
        if (content.packageName) {
            intro.push(`Install: \`npm install ${content.packageName}\``);
        }
        if (hero.secondaryCta?.url) {
            intro.push(link(hero.secondaryCta.text, hero.secondaryCta.url, resolveUrl, siteRoot));
        }
    }

    // The hero is rendered above as the page title; every other section keeps page order.
    const body = content.sections
        .filter((section) => section.type !== 'hero')
        .flatMap((section) => [
            ...sectionHeader(section, siteRoot),
            ...sectionBody(section, resolveUrl, resolveFaqUrl, siteRoot),
        ]);

    return `${[frontmatter, ...intro, ...body].join('\n\n').trimEnd()}\n`;
}
