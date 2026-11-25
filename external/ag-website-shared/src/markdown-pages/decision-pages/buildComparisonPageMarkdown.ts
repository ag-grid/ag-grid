import {
    COMPARISON_SECTIONS,
    HERO_CTAS,
    chooseIfHeading,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import { competitorFeatureMatrix } from '@ag-website-shared/components/decision-pages/featureMatrix';
import type {
    ComparisonPageContent,
    DecisionPageSite,
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
    sourcesMarkdown,
} from './decisionPageMarkdown';
import { getStartedMarkdown } from './getStartedMarkdown';

export interface BuildComparisonPageMarkdownOptions {
    /** The same collection entry the comparison page renders. */
    content: ComparisonPageContent;
    site: DecisionPageSite;
    related: RelatedPageGroup[];
    /** Canonical origin, so links survive being read out of context. */
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}

/**
 * The markdown twin of a comparison page. Walks the same content entry in the same order as
 * `ComparisonPage.astro`, using the same section labels (`COMPARISON_SECTIONS`), so agents read
 * what visitors see. Product-agnostic: the site supplies its name, URLs and link resolver.
 */
export function buildComparisonPageMarkdown({
    content,
    site,
    related,
    siteRoot,
    siteFrontmatter,
}: BuildComparisonPageMarkdownOptions): string {
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
        [`## ${COMPARISON_SECTIONS.shortAnswer}`, markdoc(content.shortAnswer)],
        [
            `## ${COMPARISON_SECTIONS.keyFigures}`,
            content.keyFigures
                .map(
                    ({ value, valueSuffix, label, detail }) =>
                        `- **${[value, valueSuffix].filter(Boolean).join(' ')}** ${label}: ${detail}`
                )
                .join('\n'),
        ],
        [
            `## ${COMPARISON_SECTIONS.features}`,
            content.features.subHeading,
            ...featureMatrixMarkdown({
                groups: competitorFeatureMatrix(content.features.groups),
                columns: [productName, competitorName],
                absolute,
            }),
        ],
        [
            `## ${COMPARISON_SECTIONS.pricing}`,
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
        [
            `## ${COMPARISON_SECTIONS.chooseIf}`,
            ...[
                { name: productName, reasons: content.chooseIf.product },
                { name: competitorName, reasons: content.chooseIf.competitor },
            ].flatMap(({ name, reasons }, index) => [
                `### ${chooseIfHeading(name)}`,
                reasons.map((reason) => `- ${reason}`).join('\n'),
                // The product's card carries the page's get started button.
                ...(index === 0 ? [`[${HERO_CTAS.getStarted}](${absolute(site.urls.getStarted)})`] : []),
            ]),
        ],
        faqMarkdown(content.faq, markdoc),
        getStartedMarkdown(site, absolute),
        relatedMarkdown(related, absolute),
        sourcesMarkdown(content),
    ]);
}
