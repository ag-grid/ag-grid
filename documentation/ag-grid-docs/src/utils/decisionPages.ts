import { findStaleClaims } from '@ag-website-shared/components/decision-pages/comparisonPageSchema';
import {
    type DecisionHubCard,
    type DecisionHubContent,
    sortHubCards,
} from '@ag-website-shared/components/decision-pages/decisionHub';
import { toIsoDate } from '@ag-website-shared/components/decision-pages/decisionPageText';
import type {
    ComparisonPageContent,
    DecisionPageSite,
    RelatedPageGroup,
} from '@ag-website-shared/components/decision-pages/types';
import { ENTERPRISE_TRIAL_PATH } from '@ag-website-shared/components/license-pricing/pricingContent';
import agGridLogoMark from '@ag-website-shared/images/inline-svgs/ag-grid-logomark.svg?url';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/**
 * AG Grid's binding of the shared decision page templates (comparison pages for now; the
 * alternative, solution and migration clusters join as they are built). Kept free of
 * `astro:content`, so the page and its `.md` twin take the same values and stay unit-testable.
 */

/** Docs links on the decision pages go to the React docs, the most common framework. */
const DECISION_PAGE_FRAMEWORK = 'react';

export const GRID_DECISION_SITE: DecisionPageSite = {
    productName: 'AG Grid',
    productKey: 'grid',
    productLogo: agGridLogoMark,
    framework: DECISION_PAGE_FRAMEWORK,
    resolveUrl: (url) => urlWithPrefix({ url, framework: DECISION_PAGE_FRAMEWORK }),
    urls: {
        home: '/',
        hub: '/compare/',
        pricing: '/license-pricing/',
        getStarted: './getting-started/',
        demo: '/example/',
        trial: ENTERPRISE_TRIAL_PATH,
    },
    getStarted: {
        heading: 'Try AG Grid with your own data',
        body: 'Start with AG Grid Community for free, and request a 30-day trial licence when you want to evaluate Enterprise features.',
    },
};

export const COMPARE_HUB: DecisionHubContent = {
    title: 'Compare AG Grid with Other Data Grids',
    description:
        'Feature, pricing and licensing comparisons between AG Grid and other JavaScript data grids and table libraries.',
    heading: 'Compare AG Grid with other data grids',
    subHeading:
        'How AG Grid compares with other JavaScript data grids and table libraries on features, pricing and licensing.',
    listHeading: 'Comparisons',
};

export const COMPARE_HUB_NAME = 'Compare';

export const comparePageUrl = (slug: string): string => `/compare/${slug}/`;

export const compareHubCard = (slug: string, content: ComparisonPageContent): DecisionHubCard => ({
    title: content.hero.heading,
    description: content.meta.description,
    url: comparePageUrl(slug),
});

/**
 * The related-page links shown at the end of a comparison page: the other comparisons, then
 * where to go next on the site. The alternative, solution and migration groups join here as
 * those clusters are built.
 */
export function compareRelatedPages({
    slug,
    pages,
}: {
    slug: string;
    pages: Array<{ slug: string; content: ComparisonPageContent }>;
}): RelatedPageGroup[] {
    const otherComparisons = sortHubCards(
        pages
            .filter((page) => page.slug !== slug)
            .map((page) => ({ title: page.content.hero.heading, url: comparePageUrl(page.slug) }))
    );

    return [
        ...(otherComparisons.length ? [{ name: 'Compare', links: otherComparisons }] : []),
        {
            name: 'AG Grid',
            links: [
                { title: 'Community vs Enterprise', url: './community-vs-enterprise/' },
                { title: 'Pricing', url: '/license-pricing/' },
                { title: 'Demos', url: '/example/' },
                { title: 'Documentation', url: './getting-started/' },
            ],
        },
    ];
}

/**
 * `getStaticPaths` for a comparison page and its `.md` twin, so both build from the same entries
 * and related links.
 */
export function comparePagePaths<Content extends ComparisonPageContent>(entries: Array<{ id: string; data: Content }>) {
    const pages = entries.map(({ id, data }) => ({ slug: id, content: data }));
    return pages.map(({ slug, content }) => ({
        params: { comparePage: slug },
        props: { content, related: compareRelatedPages({ slug, pages }) },
    }));
}

/**
 * Warns, without failing the build, about competitor claims due a re-check against their source.
 * Dates are judged against the build date.
 */
export function warnStaleClaims(entries: Array<{ id: string; data: ComparisonPageContent }>): void {
    for (const { id, data } of entries) {
        for (const { path, sourceUrl, checkedOn } of findStaleClaims(data)) {
            // eslint-disable-next-line no-console
            console.warn(
                `[compare/${id}] ${path} was last checked on ${toIsoDate(checkedOn)}: re-verify it against ${sourceUrl} and update checkedOn`
            );
        }
    }
}
