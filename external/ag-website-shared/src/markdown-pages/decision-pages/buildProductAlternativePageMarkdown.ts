import {
    ALTERNATIVE_SECTIONS,
    PRODUCT_ALTERNATIVE_SECTIONS,
    alternativePageName,
    communityEditionName,
    enterpriseEditionName,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import { editionFeatureMatrix } from '@ag-website-shared/components/decision-pages/featureMatrix';
import type {
    DecisionPageSite,
    ProductAlternativePageContent,
    RelatedPageGroup,
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
} from './decisionPageMarkdown';
import { getStartedMarkdown } from './getStartedMarkdown';

export interface BuildProductAlternativePageMarkdownOptions {
    /** The same collection entry the page renders. */
    content: ProductAlternativePageContent;
    site: DecisionPageSite;
    related: RelatedPageGroup[];
    /** Canonical origin, so links survive being read out of context. */
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}

/**
 * The markdown twin of the product's own alternative page. Walks the same content entry in the same
 * order as `ProductAlternativePage.astro`, with the same section labels, so agents read what
 * visitors see. It makes no competitor claims, so unlike the other twins it has no sources section.
 */
export function buildProductAlternativePageMarkdown({
    content,
    site,
    related,
    siteRoot,
    siteFrontmatter,
}: BuildProductAlternativePageMarkdownOptions): string {
    const { productName } = site;
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
            `*${alternativePageName({ name: productName })}*`,
            `## ${content.lighterOption.heading}`,
            content.lighterOption.reasons.map((reason) => `- ${reason}`).join('\n'),
        ],
        [
            `## ${PRODUCT_ALTERNATIVE_SECTIONS.betterFit(productName)}`,
            ...content.whyProduct.flatMap(({ title, body }) => [`### ${title}`, body]),
        ],
        [
            `## ${PRODUCT_ALTERNATIVE_SECTIONS.editions(productName)}`,
            content.editions.subHeading,
            ...featureMatrixMarkdown({
                groups: editionFeatureMatrix(content.editions.groups),
                columns: [communityEditionName(productName), enterpriseEditionName(productName)],
                absolute,
            }),
            ...(site.urls.editions
                ? [
                      `See [${PRODUCT_ALTERNATIVE_SECTIONS.editionsLink(productName)}](${absolute(site.urls.editions)}) for every feature in each edition, and how to try Enterprise for free.`,
                  ]
                : []),
        ],
        [
            `## ${ALTERNATIVE_SECTIONS.pricing}`,
            content.pricing.subHeading,
            ...pricingMarkdown({ tables: [{ name: productName, rows: content.pricing.product }], site, absolute }),
        ],
        faqMarkdown(content.faq, markdoc),
        getStartedMarkdown(site, absolute),
        relatedMarkdown(related, absolute),
    ]);
}
