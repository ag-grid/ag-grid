import {
    type DecisionHubCard,
    type DecisionHubContent,
    sortHubCards,
} from '@ag-website-shared/components/decision-pages/decisionHub';
import { findStaleClaims } from '@ag-website-shared/components/decision-pages/decisionPageSchema';
import { alternativePageName, toIsoDate } from '@ag-website-shared/components/decision-pages/decisionPageText';
import type {
    AlternativePageContent,
    ClaimBearingContent,
    ComparisonPageContent,
    DecisionHubLink,
    DecisionPageSite,
    RelatedPageGroup,
    RelatedPageLink,
} from '@ag-website-shared/components/decision-pages/types';
import { ENTERPRISE_TRIAL_PATH } from '@ag-website-shared/components/license-pricing/pricingContent';
import agGridLogoMark from '@ag-website-shared/images/inline-svgs/ag-grid-logomark.svg?url';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/**
 * AG Grid's binding of the shared decision page templates (comparison and alternative pages; the
 * solution and migration clusters join as they are built). Kept free of
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

export const COMPARE_HUB_LINK: DecisionHubLink = { name: 'Compare', url: '/compare/' };
export const ALTERNATIVES_HUB_LINK: DecisionHubLink = { name: 'Alternatives', url: '/alternatives/' };

export const COMPARE_HUB: DecisionHubContent = {
    title: 'Compare AG Grid with Other Data Grids',
    description:
        'Feature, pricing and licensing comparisons between AG Grid and other JavaScript data grids and table libraries.',
    heading: 'Compare AG Grid with other data grids',
    subHeading:
        'How AG Grid compares with other JavaScript data grids and table libraries on features, pricing and licensing.',
    listHeading: 'Comparisons',
};

export const ALTERNATIVES_HUB: DecisionHubContent = {
    title: 'AG Grid as an Alternative to Other Data Grids',
    description:
        'Why teams switch to AG Grid from other JavaScript data grids and table libraries, with features, pricing and licensing at a glance.',
    heading: 'AG Grid as an alternative to other data grids',
    subHeading:
        'Why teams replacing another JavaScript data grid or table library choose AG Grid, with the features, pricing and licensing that matter when switching.',
    listHeading: 'Alternatives',
};

const { urls } = GRID_DECISION_SITE;

export const comparePageUrl = (slug: string): string => `${COMPARE_HUB_LINK.url}${slug}/`;
export const alternativePageUrl = (slug: string): string => `${ALTERNATIVES_HUB_LINK.url}${slug}/`;

export const compareHubCard = (slug: string, content: ComparisonPageContent): DecisionHubCard => ({
    title: content.hero.heading,
    description: content.meta.description,
    url: comparePageUrl(slug),
});

export const alternativeHubCard = (slug: string, content: AlternativePageContent): DecisionHubCard => ({
    title: alternativePageName(content.competitor),
    description: content.meta.description,
    url: alternativePageUrl(slug),
});

interface DecisionPageEntry<Content> {
    slug: string;
    content: Content;
}

/** Every page in the two clusters, so each page can link to the others. */
export interface DecisionPageClusters {
    comparisons: Array<DecisionPageEntry<ComparisonPageContent>>;
    alternatives: Array<DecisionPageEntry<AlternativePageContent>>;
}

const comparisonLink = ({ slug, content }: DecisionPageEntry<ComparisonPageContent>): RelatedPageLink => ({
    title: content.hero.heading,
    url: comparePageUrl(slug),
});

const alternativeLink = ({ slug, content }: DecisionPageEntry<AlternativePageContent>): RelatedPageLink => ({
    title: alternativePageName(content.competitor),
    url: alternativePageUrl(slug),
});

const PRODUCT_LINKS: RelatedPageGroup = {
    name: GRID_DECISION_SITE.productName,
    links: [
        { title: 'Community vs Enterprise', url: './community-vs-enterprise/' },
        { title: 'Pricing', url: urls.pricing },
        { title: 'Demos', url: urls.demo },
        { title: 'Documentation', url: urls.getStarted },
    ],
};

/**
 * The related-page links shown at the end of a decision page: every comparison and alternative
 * page except the current one, then where to go next on the site. The solution and migration
 * groups join here as those clusters are built.
 */
export function decisionRelatedPages({
    current,
    clusters,
}: {
    /** The page's own URL, left out of its links. */
    current: string;
    clusters: DecisionPageClusters;
}): RelatedPageGroup[] {
    const groups: RelatedPageGroup[] = [
        { name: COMPARE_HUB_LINK.name, links: sortHubCards(clusters.comparisons.map(comparisonLink)) },
        { name: ALTERNATIVES_HUB_LINK.name, links: sortHubCards(clusters.alternatives.map(alternativeLink)) },
    ]
        .map((group) => ({ ...group, links: group.links.filter(({ url }) => url !== current) }))
        .filter((group) => group.links.length > 0);

    return [...groups, PRODUCT_LINKS];
}

const toEntries = <Content>(entries: Array<{ id: string; data: Content }>): Array<DecisionPageEntry<Content>> =>
    entries.map(({ id, data }) => ({ slug: id, content: data }));

/**
 * `getStaticPaths` for a comparison page and its `.md` twin, so both build from the same entries
 * and related links.
 */
export function comparePagePaths({
    comparePages,
    alternativePages,
}: {
    comparePages: Array<{ id: string; data: ComparisonPageContent }>;
    alternativePages: Array<{ id: string; data: AlternativePageContent }>;
}) {
    const clusters = { comparisons: toEntries(comparePages), alternatives: toEntries(alternativePages) };
    return clusters.comparisons.map(({ slug, content }) => ({
        params: { comparePage: slug },
        props: { content, related: decisionRelatedPages({ current: comparePageUrl(slug), clusters }) },
    }));
}

/**
 * `getStaticPaths` for an alternative page and its `.md` twin. Each page links to the comparison
 * with the same competitor, when there is one.
 */
export function alternativePagePaths({
    comparePages,
    alternativePages,
}: {
    comparePages: Array<{ id: string; data: ComparisonPageContent }>;
    alternativePages: Array<{ id: string; data: AlternativePageContent }>;
}) {
    const clusters = { comparisons: toEntries(comparePages), alternatives: toEntries(alternativePages) };
    return clusters.alternatives.map(({ slug, content }) => {
        const comparison = clusters.comparisons.find(
            (page) => page.content.competitor.slug === content.competitor.slug
        );
        return {
            params: { alternativePage: slug },
            props: {
                content,
                comparison: comparison && comparisonLink(comparison),
                related: decisionRelatedPages({ current: alternativePageUrl(slug), clusters }),
            },
        };
    });
}

/**
 * Warns, without failing the build, about competitor claims due a re-check against their source.
 * Dates are judged against the build date. `cluster` names the pages in the warning, e.g. `compare`.
 */
export function warnStaleClaims(cluster: string, entries: Array<{ id: string; data: ClaimBearingContent }>): void {
    for (const { id, data } of entries) {
        for (const { path, sourceUrl, checkedOn } of findStaleClaims(data)) {
            // eslint-disable-next-line no-console
            console.warn(
                `[${cluster}/${id}] ${path} was last checked on ${toIsoDate(checkedOn)}: re-verify it against ${sourceUrl} and update checkedOn`
            );
        }
    }
}
