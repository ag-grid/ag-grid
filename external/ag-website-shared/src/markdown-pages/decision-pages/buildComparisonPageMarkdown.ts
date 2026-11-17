import {
    COMPARISON_SECTIONS,
    FEATURE_STATUS,
    chooseIfHeading,
    featureCellLabel,
    formatLastUpdated,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import type {
    ComparisonPageContent,
    DecisionPageSite,
    FeatureCell,
    RelatedPageGroup,
} from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { resolveMarkdownLinks } from '../landing-pages/buildLandingPageMarkdown';
import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';

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
        ],
        [`## ${COMPARISON_SECTIONS.shortAnswer}`, markdoc(content.shortAnswer)],
        [
            `## ${COMPARISON_SECTIONS.keyFigures}`,
            content.keyFigures
                .map(({ value, valueSuffix, label, detail }) => `- **${[value, valueSuffix].filter(Boolean).join(' ')}** ${label}: ${detail}`)
                .join('\n'),
        ],
        [
            `## ${COMPARISON_SECTIONS.features}`,
            content.features.subHeading,
            ...content.features.groups.flatMap((group) => [
                `### ${group.name}`,
                table(
                    ['Feature', productName, competitorName],
                    group.rows.map((row) => [cell(row.feature), featureCell(row.product), featureCell(row.competitor)])
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
                    ['Plan', 'Price', 'Licence'],
                    rows.map((row) => [cell(row.plan), cell(row.price), cell(row.licence)])
                ).join('\n'),
            ]),
            `See [${productName} pricing](${absolute(site.urls.pricing)}) for volume and deployment terms.`,
        ],
        [
            `## ${COMPARISON_SECTIONS.chooseIf}`,
            ...[
                { name: productName, reasons: content.chooseIf.product },
                { name: competitorName, reasons: content.chooseIf.competitor },
            ].flatMap(({ name, reasons }) => [
                `### ${chooseIfHeading(name)}`,
                reasons.map((reason) => `- ${reason}`).join('\n'),
            ]),
        ],
        content.faq.length
            ? [
                  `## ${COMPARISON_SECTIONS.faq}`,
                  ...content.faq.flatMap(({ question, answer }) => [`### ${question}`, markdoc(answer)]),
              ]
            : [],
        [
            `## ${COMPARISON_SECTIONS.getStarted}`,
            `### ${site.getStarted.heading}`,
            site.getStarted.body,
            [
                `- [Get started](${absolute(site.urls.getStarted)})`,
                `- [See the live demo](${absolute(site.urls.demo)})`,
                `- [Start a free trial](${absolute(site.urls.trial)})`,
            ].join('\n'),
        ],
        related.length
            ? [
                  `## ${COMPARISON_SECTIONS.related}`,
                  ...related.flatMap(({ name, links }) => [
                      `### ${name}`,
                      links.map(({ title, url }) => `- [${title}](${absolute(url)})`).join('\n'),
                  ]),
              ]
            : [],
    ];

    return `${blocks
        .filter((block) => block.length > 0)
        .map((block) => block.join('\n\n'))
        .join('\n\n')}\n`;
}
