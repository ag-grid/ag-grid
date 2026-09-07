import { htmlBlockToMarkdown } from '@ag-website-shared/markdoc/htmlInlineToMarkdown';
import type {
    BryntumCampaignContent,
    BryntumCta,
    BryntumSection,
} from '@components/campaigns-components/bryntum/types';
import { decorateBryntumHtml, resolveBryntumHref } from '@utils/bryntumCampaignAssets';

import { buildGridFrontmatter } from './gridFrontmatter';

/** The page's title/description fallbacks, shared so the twin's frontmatter matches its meta. */
export function campaignMeta(content: BryntumCampaignContent) {
    return {
        title: content.meta?.og_title ?? content.title,
        description: content.meta?.description ?? '',
    };
}

function ctaList(ctas: BryntumCta[] | undefined): string | undefined {
    if (!ctas?.length) {
        return undefined;
    }
    return ctas.map((cta) => `[${cta.text}](${resolveBryntumHref(cta.href)})`).join(' | ');
}

/**
 * Body copy for a section. `body_html` is preferred over the plain-text `body_text` twin the
 * content ships, because it carries the links and emphasis; hrefs are resolved through the same
 * `decorateBryntumHtml` the page uses, so they land on bryntum.com with the campaign's UTM tags.
 */
function bodyMarkdown(section: BryntumSection): string | undefined {
    const html = 'body_html' in section ? section.body_html : undefined;
    if (html) {
        return htmlBlockToMarkdown(decorateBryntumHtml(html));
    }
    return 'body_text' in section ? section.body_text : undefined;
}

function itemsMarkdown(section: BryntumSection): string | undefined {
    if (!('items' in section) || !section.items?.length) {
        return undefined;
    }
    const items = section.items.map((item) => {
        const label = ('heading' in item ? item.heading : undefined) ?? ('label' in item ? item.label : undefined);
        const text = label ? (item.href ? `[${label}](${resolveBryntumHref(item.href)})` : label) : undefined;
        const detail =
            ('body_text' in item ? item.body_text : undefined) ??
            ('description' in item ? item.description : undefined);
        if (!text) {
            return undefined;
        }
        return detail ? `- **${text}** — ${detail}` : `- ${text}`;
    });
    const rendered = items.filter(Boolean);
    return rendered.length ? rendered.join('\n') : undefined;
}

function sectionMarkdown(section: BryntumSection): string[] {
    const parts: string[] = [];
    if (section.eyebrow) {
        // The small label above the heading on the page; kept as an emphasised kicker so it
        // holds that reading order without adding a heading level.
        parts.push(`*${section.eyebrow}*`);
    }
    if (section.heading) {
        parts.push(`## ${section.heading}`);
    }
    const body = bodyMarkdown(section);
    if (body) {
        parts.push(body);
    }
    const items = itemsMarkdown(section);
    if (items) {
        parts.push(items);
    }
    const ctas = ctaList('ctas' in section ? section.ctas : undefined);
    if (ctas) {
        parts.push(ctas);
    }
    // `section.links` is deliberately not rendered: the page never renders it either, and its
    // entries are a flattened copy of the anchors already inside `body_html`.
    return parts;
}

/**
 * Build the markdown twin of a `/campaigns/bryntum-<product>` page. Reads the same campaign JSON
 * `BryntumCampaign.astro` renders and walks its sections in page order. The embedded live demos,
 * videos and logo walls have no markdown representation, so those sections contribute their
 * heading and supporting copy only.
 */
export function buildCampaignMarkdown({
    content,
    siteRoot,
}: {
    content: BryntumCampaignContent;
    siteRoot?: string;
}): string {
    const { title, description } = campaignMeta(content);
    // The hero is the page title; every other section keeps page order below it.
    const [hero, ...rest] = content.sections;

    const document: string[] = [
        // No pageUrl: the campaign pages are partner landing pages, not listed in the footer,
        // so they carry no related links.
        buildGridFrontmatter({ siteRoot, title, description }),
        `# ${hero?.heading ?? content.title}`,
    ];

    if (hero) {
        const body = bodyMarkdown(hero);
        if (body) {
            document.push(body);
        }
        const ctas = ctaList('ctas' in hero ? hero.ctas : undefined);
        if (ctas) {
            document.push(ctas);
        }
    }
    document.push(...rest.flatMap(sectionMarkdown));

    return `${document.join('\n\n').trimEnd()}\n`;
}
