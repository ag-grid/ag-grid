import { COMPARISON_SECTIONS, GET_STARTED_CTAS } from '@ag-website-shared/components/decision-pages/decisionPageText';
import type { DecisionPageSite } from '@ag-website-shared/components/decision-pages/types';

/** The get started panel as markdown, so every decision page twin closes on the same calls to action. */
export function getStartedMarkdown(
    site: Pick<DecisionPageSite, 'getStarted' | 'urls'>,
    absolute: (url: string) => string
): string[] {
    return [
        `## ${COMPARISON_SECTIONS.getStarted}`,
        `### ${site.getStarted.heading}`,
        site.getStarted.body,
        [
            `- [${GET_STARTED_CTAS.docs}](${absolute(site.urls.getStarted)})`,
            `- [${GET_STARTED_CTAS.trial}](${absolute(site.urls.trial)})`,
        ].join('\n'),
    ];
}
