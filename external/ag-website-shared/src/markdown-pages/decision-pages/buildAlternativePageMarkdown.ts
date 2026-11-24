import {
    ALTERNATIVE_SECTIONS,
    alternativePageName,
    fullComparisonLinkText,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import { competitorFeatureMatrix } from '@ag-website-shared/components/decision-pages/featureMatrix';
import type {
    AlternativePageContent,
    DecisionPageSite,
    RelatedPageGroup,
    RelatedPageLink,
} from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { resolveMarkdownLinks } from '../landing-pages/buildLandingPageMarkdown';
import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';
import {
    faqMarkdown,
    featureMatrixMarkdown,
    heroMarkdown,
    joinBlocks,
    pricingMarkdown,
    relatedMarkdown,
    sourcesMarkdown,
} from './decisionPageMarkdown';
import { getStartedMarkdown } from './getStartedMarkdown';

export interface BuildAlternativePageMarkdownOptions {
    /** The same content the alternative page renders. */
    content: AlternativePageContent;
    site: DecisionPageSite;
    /** The comparison page for the same competitor. */
    comparison: RelatedPageLink;
    related: RelatedPageGroup[];
    /** Canonical origin, so links survive being read out of context. */
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}

/**
 * The markdown twin of an alternative page. Walks the same content in the same order as
 * `AlternativePage.astro`, with the same section labels, so agents read what visitors see.
 * Product-agnostic: the site supplies its name, URLs and link resolver.
 */
export function buildAlternativePageMarkdown({
    content,
    site,
    comparison,
    related,
    siteRoot,
    siteFrontmatter,
}: BuildAlternativePageMarkdownOptions): string {
    const { productName } = site;
    const competitorName = content.competitor.name;
    const absolute = (url: string) => toAbsoluteUrl(site.resolveUrl(url), siteRoot);
    const markdoc = (text: string) => resolveMarkdownLinks(text, site.resolveUrl, siteRoot);

    return joinBlocks([
        [
            buildMarkdownFrontmatter({
                ...siteFrontmatter,
                title: content.meta.title,
                description: content.meta.description,
            }),
        ],
        heroMarkdown({ hero: content.hero, lastUpdated: content.lastUpdated, site, absolute }),
        [
            `*${alternativePageName(content.competitor)}*`,
            `## ${content.whySwitch.heading}`,
            content.whySwitch.reasons.map((reason) => `- ${reason}`).join('\n'),
        ],
        [
            `## ${ALTERNATIVE_SECTIONS.whyProduct(productName)}`,
            ...content.whyProduct.flatMap(({ title, body }) => [`### ${title}`, body]),
        ],
        [
            `## ${ALTERNATIVE_SECTIONS.atAGlance(productName, competitorName)}`,
            ...featureMatrixMarkdown({
                groups: competitorFeatureMatrix(content.features.groups),
                columns: [productName, competitorName],
                absolute,
            }),
            `See the [${fullComparisonLinkText(comparison.title)}](${absolute(comparison.url)}) for every feature, pricing and licensing.`,
        ],
        [
            `## ${ALTERNATIVE_SECTIONS.pricing}`,
            content.pricing.subHeading,
            ...pricingMarkdown({
                tables: [
                    { name: productName, rows: content.pricing.product },
                    { name: competitorName, rows: content.pricing.competitor },
                ],
                site,
                absolute,
            }),
        ],
        faqMarkdown(content.faq, markdoc),
        getStartedMarkdown(site, absolute),
        relatedMarkdown(related, absolute),
        sourcesMarkdown(content),
    ]);
}
