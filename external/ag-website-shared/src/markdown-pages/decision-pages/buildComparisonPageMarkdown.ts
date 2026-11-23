import { listClaims } from '@ag-website-shared/components/decision-pages/comparisonPageSchema';
import {
    COMPARISON_SECTIONS,
    FEATURE_STATUS,
    HERO_CTAS,
    PRICING_COST,
    chooseIfHeading,
    featureCellLabel,
    formatLastUpdated,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import type {
    ComparisonPageContent,
    DecisionPageSite,
    FeatureCell,
    PricingCost,
    RelatedPageGroup,
} from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { resolveMarkdownLinks } from '../landing-pages/buildLandingPageMarkdown';
import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';
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

/** Table cells cannot contain a raw pipe or a line break. */
const cell = (text: string): string => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');

const featureCell = (value: FeatureCell): string =>
    cell(
        [`${FEATURE_STATUS[value.status].symbol} ${featureCellLabel(value)}`, value.detail].filter(Boolean).join(': ')
    );

const pricingCost = (cost: PricingCost): string =>
    [PRICING_COST[cost].symbol, PRICING_COST[cost].label].filter(Boolean).join(' ');

/**
 * Each distinct source, in the order the page first cites it, with its oldest `checkedOn`: the date
 * every claim citing it has been checked since.
 */
const sourcesMarkdown = (content: ComparisonPageContent): string[] => {
    const oldestCheck = new Map<string, Date>();
    for (const { sourceUrl, checkedOn } of listClaims(content)) {
        const seen = oldestCheck.get(sourceUrl);
        if (!seen || checkedOn < seen) {
            oldestCheck.set(sourceUrl, checkedOn);
        }
    }
    return [
        `## ${COMPARISON_SECTIONS.sources}`,
        'Competitor claims on this page were checked against these sources:',
        [...oldestCheck]
            .map(([sourceUrl, checkedOn]) => `- <${sourceUrl}> (checked ${formatLastUpdated(checkedOn)})`)
            .join('\n'),
    ];
};

const table = (header: string[], rows: string[][]): string[] => [
    `| ${header.map(cell).join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
];

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

    const blocks: string[][] = [
        [
            buildMarkdownFrontmatter({
                ...siteFrontmatter,
                title: content.meta.title,
                description: content.meta.description,
            }),
        ],
        [
            `# ${content.hero.heading}`,
            content.hero.subHeading,
            `Last updated ${formatLastUpdated(content.lastUpdated)}`,
            [
                `- [${HERO_CTAS.getStarted}](${absolute(site.urls.getStarted)})`,
                `- [${HERO_CTAS.demo}](${absolute(site.urls.demo)})`,
            ].join('\n'),
        ],
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
            ...content.features.groups.flatMap((group) => [
                `### ${group.name}`,
                table(
                    ['Feature', productName, competitorName],
                    group.rows.map((row) => [
                        row.docsUrl ? `[${cell(row.feature)}](${absolute(row.docsUrl)})` : cell(row.feature),
                        featureCell(row.product),
                        featureCell(row.competitor),
                    ])
                ).join('\n'),
            ]),
        ],
        [
            `## ${COMPARISON_SECTIONS.pricing}`,
            content.pricing.subHeading,
            ...[
                { name: productName, rows: content.pricing.product },
                { name: competitorName, rows: content.pricing.competitor },
            ].flatMap(({ name, rows }) => [
                `### ${name}`,
                table(
                    ['Plan', 'Cost', 'Licence'],
                    rows.map((row) => [cell(row.plan), pricingCost(row.cost), cell(row.licence)])
                ).join('\n'),
            ]),
            `See [${productName} pricing](${absolute(site.urls.pricing)}) for prices, volume and deployment terms.`,
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
        content.faq.length
            ? [
                  `## ${COMPARISON_SECTIONS.faq}`,
                  ...content.faq.flatMap(({ question, answer }) => [`### ${question}`, markdoc(answer)]),
              ]
            : [],
        getStartedMarkdown(site, absolute),
        related.length
            ? [
                  `## ${COMPARISON_SECTIONS.related}`,
                  ...related.flatMap(({ name, links }) => [
                      `### ${name}`,
                      links.map(({ title, url }) => `- [${title}](${absolute(url)})`).join('\n'),
                  ]),
              ]
            : [],
        sourcesMarkdown(content),
    ];

    return `${blocks
        .filter((block) => block.length > 0)
        .map((block) => block.join('\n\n'))
        .join('\n\n')}\n`;
}
