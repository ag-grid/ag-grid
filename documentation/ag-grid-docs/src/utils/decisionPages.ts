import {
    type DecisionHubCard,
    type DecisionHubContent,
    sortHubCards,
} from '@ag-website-shared/components/decision-pages/decisionHub';
import { findStaleClaims } from '@ag-website-shared/components/decision-pages/decisionPageSchema';
import { alternativePageName, toIsoDate } from '@ag-website-shared/components/decision-pages/decisionPageText';
import { resolveAlternativePage } from '@ag-website-shared/components/decision-pages/resolveAlternativePage';
import type {
    AlternativePageSource,
    ClaimBearingContent,
    ComparisonPageContent,
    DecisionHubLink,
    DecisionPageSite,
    ProductAlternativePageContent,
    RelatedPageGroup,
    RelatedPageLink,
    SolutionPageContent,
} from '@ag-website-shared/components/decision-pages/types';
import { ENTERPRISE_TRIAL_PATH } from '@ag-website-shared/components/license-pricing/pricingContent';
import agGridLogoMark from '@ag-website-shared/images/inline-svgs/ag-grid-logomark.svg?url';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/**
 * AG Grid's binding of the shared decision page templates (comparison, alternative and solution
 * pages; the migration cluster joins when it is built). Kept free of
 * `astro:content`, so the page and its `.md` twin take the same values and stay unit-testable.
 */

/** Docs links on the decision pages go to the React docs, the most common framework. */
const DECISION_PAGE_FRAMEWORK = 'react';

const EDITIONS_URL = './community-vs-enterprise/';

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
        editions: EDITIONS_URL,
    },
    getStarted: {
        heading: 'Try AG Grid with your own data',
        body: 'Start with AG Grid Community for free, and request a 30-day trial licence when you want to evaluate Enterprise features.',
    },
};

export const COMPARE_HUB_LINK: DecisionHubLink = { name: 'Compare', url: '/compare/' };
export const ALTERNATIVES_HUB_LINK: DecisionHubLink = { name: 'Alternatives', url: '/alternatives/' };
export const SOLUTIONS_HUB_LINK: DecisionHubLink = { name: 'Solutions', url: '/solutions/' };

/** The related-pages group listing the solution pages. */
const SOLUTIONS_RELATED_GROUP_NAME = 'Use cases';

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

export const SOLUTIONS_HUB: DecisionHubContent = {
    title: 'AG Grid Solutions: Data Grids for Every Use Case',
    description:
        'How AG Grid fits trading dashboards, pivot tables, inventory, portfolio, project and order management, spreadsheet-style editing, tree data, large data sets and Excel export.',
    heading: 'AG Grid for every use case',
    subHeading:
        'How AG Grid fits the jobs teams build data grids for, each with a working example, the features it uses and how to build it.',
    listHeading: 'Use cases',
};

const { urls } = GRID_DECISION_SITE;

/** AG Grid's own alternative page, served by its own route rather than the competitor alternatives route. */
export const PRODUCT_ALTERNATIVE_SLUG = 'ag-grid-alternative';

export const comparePageUrl = (slug: string): string => `${COMPARE_HUB_LINK.url}${slug}/`;
export const alternativePageUrl = (slug: string): string => `${ALTERNATIVES_HUB_LINK.url}${slug}/`;
export const solutionPageUrl = (slug: string): string => `${SOLUTIONS_HUB_LINK.url}${slug}/`;

export const compareHubCard = (slug: string, content: ComparisonPageContent): DecisionHubCard => ({
    title: content.hero.heading,
    description: content.meta.description,
    url: comparePageUrl(slug),
});

const alternativeHubCard = (slug: string, content: AlternativePageSource): DecisionHubCard => ({
    title: alternativePageName(content.competitor),
    description: content.meta.description,
    url: alternativePageUrl(slug),
});

const productAlternativeHubCard = (slug: string, content: ProductAlternativePageContent): DecisionHubCard => ({
    title: alternativePageName({ name: GRID_DECISION_SITE.productName }),
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
    alternatives: Array<DecisionPageEntry<AlternativePageSource>>;
    /** AG Grid's own alternative page, listed with the other alternatives. */
    productAlternatives: Array<DecisionPageEntry<ProductAlternativePageContent>>;
    solutions: Array<DecisionPageEntry<SolutionPageContent>>;
}

/** The decision page content collections, as `getDecisionPageCollections` loads them. */
export interface DecisionPageCollections {
    comparePages: Array<{ id: string; data: ComparisonPageContent }>;
    alternativePages: Array<{ id: string; data: AlternativePageSource }>;
    productAlternativePages: Array<{ id: string; data: ProductAlternativePageContent }>;
    solutionPages: Array<{ id: string; data: SolutionPageContent }>;
}

const comparisonLink = ({ slug, content }: DecisionPageEntry<ComparisonPageContent>): RelatedPageLink => ({
    title: content.hero.heading,
    url: comparePageUrl(slug),
});

const alternativeLink = ({ slug, content }: DecisionPageEntry<AlternativePageSource>): RelatedPageLink => ({
    title: alternativePageName(content.competitor),
    url: alternativePageUrl(slug),
});

const productAlternativeLink = ({ slug }: DecisionPageEntry<ProductAlternativePageContent>): RelatedPageLink => ({
    title: alternativePageName({ name: GRID_DECISION_SITE.productName }),
    url: alternativePageUrl(slug),
});

const solutionLink = ({ slug, content }: DecisionPageEntry<SolutionPageContent>): RelatedPageLink => ({
    title: content.topic.name,
    url: solutionPageUrl(slug),
});

/** The /solutions/ hub's cards, by title. */
export const solutionsHubCards = ({
    solutionPages,
}: Pick<DecisionPageCollections, 'solutionPages'>): DecisionHubCard[] =>
    sortHubCards(
        solutionPages.map(({ id, data }) => ({
            title: data.topic.name,
            description: data.meta.description,
            url: solutionPageUrl(id),
        }))
    );

/** The /alternatives/ hub's cards: AG Grid's own alternative page and every competitor's, by title. */
export const alternativesHubCards = ({
    alternativePages,
    productAlternativePages,
}: Pick<DecisionPageCollections, 'alternativePages' | 'productAlternativePages'>): DecisionHubCard[] =>
    sortHubCards([
        ...productAlternativePages.map(({ id, data }) => productAlternativeHubCard(id, data)),
        ...alternativePages.map(({ id, data }) => alternativeHubCard(id, data)),
    ]);

const PRODUCT_LINKS: RelatedPageGroup = {
    name: GRID_DECISION_SITE.productName,
    links: [
        { title: 'Community vs Enterprise', url: EDITIONS_URL },
        { title: 'Pricing', url: urls.pricing },
        { title: 'Demos', url: urls.demo },
        { title: 'Documentation', url: urls.getStarted },
    ],
};

/**
 * The related-page links shown at the end of a decision page: every comparison, alternative and
 * solution page except the current one, then where to go next on the site. The migration group
 * joins here when that cluster is built.
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
        {
            name: ALTERNATIVES_HUB_LINK.name,
            links: sortHubCards([
                ...clusters.productAlternatives.map(productAlternativeLink),
                ...clusters.alternatives.map(alternativeLink),
            ]),
        },
        { name: SOLUTIONS_RELATED_GROUP_NAME, links: sortHubCards(clusters.solutions.map(solutionLink)) },
    ]
        .map((group) => ({ ...group, links: group.links.filter(({ url }) => url !== current) }))
        .filter((group) => group.links.length > 0);

    return [...groups, PRODUCT_LINKS];
}

const toEntries = <Content>(entries: Array<{ id: string; data: Content }>): Array<DecisionPageEntry<Content>> =>
    entries.map(({ id, data }) => ({ slug: id, content: data }));

const toClusters = (collections: DecisionPageCollections): DecisionPageClusters => ({
    comparisons: toEntries(collections.comparePages),
    alternatives: toEntries(collections.alternativePages),
    productAlternatives: toEntries(collections.productAlternativePages),
    solutions: toEntries(collections.solutionPages),
});

/**
 * `getStaticPaths` for a comparison page and its `.md` twin, so both build from the same entries
 * and related links.
 */
export function comparePagePaths(collections: DecisionPageCollections) {
    const clusters = toClusters(collections);
    return clusters.comparisons.map(({ slug, content }) => ({
        params: { comparePage: slug },
        props: { content, related: decisionRelatedPages({ current: comparePageUrl(slug), clusters }) },
    }));
}

/**
 * `getStaticPaths` for an alternative page and its `.md` twin. Each page takes its feature rows and
 * pricing from the comparison with the same competitor, and links to it; an alternative page with
 * no comparison fails the build.
 */
export function alternativePagePaths(collections: DecisionPageCollections) {
    const clusters = toClusters(collections);
    return clusters.alternatives.map(({ slug, content }) => {
        const comparison = clusters.comparisons.find(
            (page) => page.content.competitor.slug === content.competitor.slug
        );
        if (!comparison) {
            throw new Error(
                `alternatives/${slug} has no comparison page: add compare/ag-grid-vs-${content.competitor.slug}, which it takes its features and pricing from`
            );
        }
        return {
            params: { alternativePage: slug },
            props: {
                content: resolveAlternativePage(content, comparison.content),
                comparison: comparisonLink(comparison),
                related: decisionRelatedPages({ current: alternativePageUrl(slug), clusters }),
            },
        };
    });
}

/** `getStaticPaths` for a solution page and its `.md` twin. */
export function solutionPagePaths(collections: DecisionPageCollections) {
    const clusters = toClusters(collections);
    return clusters.solutions.map(({ slug, content }) => ({
        params: { solutionPage: slug },
        props: { content, related: decisionRelatedPages({ current: solutionPageUrl(slug), clusters }) },
    }));
}

/** The props for AG Grid's own alternative page and its `.md` twin, which share one content entry. */
export function productAlternativePageProps(collections: DecisionPageCollections, slug: string) {
    const clusters = toClusters(collections);
    const entry = clusters.productAlternatives.find((page) => page.slug === slug);
    if (!entry) {
        throw new Error(`No productAlternativePages entry named ${slug}`);
    }
    return {
        content: entry.content,
        related: decisionRelatedPages({ current: alternativePageUrl(slug), clusters }),
    };
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
