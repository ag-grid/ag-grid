import { listClaims } from '@ag-website-shared/components/decision-pages/decisionPageSchema';
import {
    COMPARISON_SECTIONS,
    FEATURE_STATUS,
    HERO_CTAS,
    PRICING_COST,
    featureCellLabel,
    formatLastUpdated,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import type { FeatureMatrixGroup } from '@ag-website-shared/components/decision-pages/featureMatrix';
import type {
    ClaimBearingContent,
    DecisionPageFaqItem,
    DecisionPageSite,
    FeatureCell,
    PricingCost,
    PricingRow,
    RelatedPageGroup,
} from '@ag-website-shared/components/decision-pages/types';

/**
 * Markdown for the sections every decision page twin shares, so a comparison page and an
 * alternative page render the same section the same way. Each returns a block: a list of
 * paragraphs that `joinBlocks` separates with blank lines.
 */

export type Block = string[];

/** Table cells cannot contain a raw pipe or a line break. */
const cell = (text: string): string => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');

const featureCell = (value: FeatureCell): string =>
    cell(
        [`${FEATURE_STATUS[value.status].symbol} ${featureCellLabel(value)}`, value.detail].filter(Boolean).join(': ')
    );

const pricingCost = (cost: PricingCost): string =>
    [PRICING_COST[cost].symbol, PRICING_COST[cost].label].filter(Boolean).join(' ');

const table = (header: string[], rows: string[][]): string =>
    [
        `| ${header.map(cell).join(' | ')} |`,
        `| ${header.map(() => '---').join(' | ')} |`,
        ...rows.map((row) => `| ${row.join(' | ')} |`),
    ].join('\n');

/** The page heading, its intro, the last-updated date and the hero's calls to action. */
export const heroMarkdown = ({
    hero,
    lastUpdated,
    site,
    absolute,
}: {
    hero: { heading: string; subHeading: string };
    lastUpdated: Date;
    site: Pick<DecisionPageSite, 'urls'>;
    absolute: (url: string) => string;
}): Block => [
    `# ${hero.heading}`,
    hero.subHeading,
    `Last updated ${formatLastUpdated(lastUpdated)}`,
    [
        `- [${HERO_CTAS.getStarted}](${absolute(site.urls.getStarted)})`,
        `- [${HERO_CTAS.demo}](${absolute(site.urls.demo)})`,
    ].join('\n'),
];

/** One table per feature group, under a `###` heading each; `columns` names the two cell columns. */
export const featureMatrixMarkdown = ({
    groups,
    columns,
    absolute,
}: {
    groups: FeatureMatrixGroup[];
    columns: [string, string];
    absolute: (url: string) => string;
}): Block =>
    groups.flatMap((group) => [
        `### ${group.name}`,
        table(
            ['Feature', ...columns],
            group.rows.map((row) => [
                row.docsUrl ? `[${cell(row.feature)}](${absolute(row.docsUrl)})` : cell(row.feature),
                ...row.cells.map(featureCell),
            ])
        ),
    ]);

/** One plan table per product, then the link to the product's own pricing page. */
export const pricingMarkdown = ({
    tables,
    site,
    absolute,
}: {
    tables: Array<{ name: string; rows: PricingRow[] }>;
    site: Pick<DecisionPageSite, 'productName' | 'urls'>;
    absolute: (url: string) => string;
}): Block => [
    ...tables.flatMap(({ name, rows }) => [
        `### ${name}`,
        table(
            ['Plan', 'Cost', 'Licence'],
            rows.map((row) => [cell(row.plan), pricingCost(row.cost), cell(row.licence)])
        ),
    ]),
    `See [${site.productName} pricing](${absolute(site.urls.pricing)}) for prices, volume and deployment terms.`,
];

export const faqMarkdown = (faq: DecisionPageFaqItem[], markdoc: (text: string) => string): Block =>
    faq.length
        ? [
              `## ${COMPARISON_SECTIONS.faq}`,
              ...faq.flatMap(({ question, answer }) => [`### ${question}`, markdoc(answer)]),
          ]
        : [];

export const relatedMarkdown = (related: RelatedPageGroup[], absolute: (url: string) => string): Block =>
    related.length
        ? [
              `## ${COMPARISON_SECTIONS.related}`,
              ...related.flatMap(({ name, links }) => [
                  `### ${name}`,
                  links.map(({ title, url }) => `- [${title}](${absolute(url)})`).join('\n'),
              ]),
          ]
        : [];

/**
 * Each distinct source, in the order the page first cites it, with its oldest `checkedOn`: the date
 * every claim citing it has been checked since.
 */
export const sourcesMarkdown = (content: ClaimBearingContent): Block => {
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

/** The twin's text: non-empty blocks, paragraphs separated by blank lines, ending in a newline. */
export const joinBlocks = (blocks: Block[]): string =>
    `${blocks
        .filter((block) => block.length > 0)
        .map((block) => block.join('\n\n'))
        .join('\n\n')}\n`;
