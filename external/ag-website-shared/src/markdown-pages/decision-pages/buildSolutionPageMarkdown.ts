import {
    COMPARISON_SECTIONS,
    FEATURE_STATUS,
    SOLUTION_SECTIONS,
} from '@ag-website-shared/components/decision-pages/decisionPageText';
import type {
    DecisionPageSite,
    RelatedPageGroup,
    SolutionPageContent,
} from '@ag-website-shared/components/decision-pages/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

import { resolveMarkdownLinks } from '../landing-pages/buildLandingPageMarkdown';
import { type SiteFrontmatterFields, buildMarkdownFrontmatter } from '../markdownFrontmatter';
import { faqMarkdown, heroMarkdown, joinBlocks, relatedMarkdown, sourcesMarkdown } from './decisionPageMarkdown';
import { getStartedMarkdown } from './getStartedMarkdown';

export interface BuildSolutionPageMarkdownOptions {
    /** The same collection entry the solution page renders. */
    content: SolutionPageContent;
    site: DecisionPageSite;
    related: RelatedPageGroup[];
    /** Canonical origin, so links survive being read out of context. */
    siteRoot?: string;
    siteFrontmatter?: SiteFrontmatterFields;
}

/**
 * The markdown twin of a solution page. Walks the same content entry in the same order as
 * `SolutionPage.astro`, with the same section labels, so agents read what visitors see. The live
 * example cannot run in markdown, so the twin keeps its description and the how-to code.
 */
export function buildSolutionPageMarkdown({
    content,
    site,
    related,
    siteRoot,
    siteFrontmatter,
}: BuildSolutionPageMarkdownOptions): string {
    const absolute = (url: string) => toAbsoluteUrl(site.resolveUrl(url), siteRoot);
    const markdoc = (text: string) => resolveMarkdownLinks(text, site.resolveUrl, siteRoot);
    const { keyFigures, capabilities, howTo } = content;

    return joinBlocks([
        [
            buildMarkdownFrontmatter({
                ...siteFrontmatter,
                title: content.meta.title,
                description: content.meta.description,
            }),
        ],
        heroMarkdown({ hero: content.hero, lastUpdated: content.lastUpdated, site, absolute }),
        [`*${content.topic.name}*`, `## ${COMPARISON_SECTIONS.shortAnswer}`, markdoc(content.shortAnswer)],
        [`## ${SOLUTION_SECTIONS.liveExample}`, content.example.intro, content.example.note],
        [
            `## ${keyFigures.heading}`,
            keyFigures.figures
                .map(
                    ({ value, valueSuffix, label, detail }) =>
                        `- **${[value, valueSuffix].filter(Boolean).join(' ')}** ${label}: ${detail}`
                )
                .join('\n'),
        ],
        [
            `## ${capabilities.heading}`,
            ...capabilities.items.flatMap(({ title, docsUrl, plan, body }) => [
                `### ${docsUrl ? `[${title}](${absolute(docsUrl)})` : title} (${FEATURE_STATUS.yes.symbol} ${plan})`,
                body,
            ]),
        ],
        [
            `## ${howTo.heading}`,
            howTo.steps.map(({ title, body }, index) => `${index + 1}. **${title}**: ${markdoc(body)}`).join('\n'),
            ['```tsx', howTo.code, '```'].join('\n'),
            markdoc(howTo.outro),
        ],
        faqMarkdown(content.faq, markdoc),
        getStartedMarkdown(site, absolute),
        relatedMarkdown(related, absolute),
        sourcesMarkdown(content, `Claims about ${site.productName} on this page were checked against these sources:`),
    ]);
}
