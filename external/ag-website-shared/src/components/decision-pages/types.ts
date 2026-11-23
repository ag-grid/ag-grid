import type { Framework } from '@ag-grid-types';

/**
 * Content types for the purchase-decision pages (comparison, alternative, solution and migration
 * pages). Shared by AG Grid, AG Charts and AG Studio: every product-specific value (product name,
 * URLs, reviewer) comes from the content entry or from the rendering site.
 *
 * The matching Zod schema is `createComparisonPageSchema` in `./comparisonPageSchema`.
 */

/** Whether a product includes a feature. Rendered as ✓, ◐ or –. */
export type FeatureStatus = 'yes' | 'limited' | 'no';

/**
 * A fact about a competitor, with the public source it was checked against and when. Every
 * competitor claim a page states carries one, so the claims register (SE-148) is the content
 * itself. The build refuses an unsourced claim and warns on a stale one (`findStaleClaims`).
 */
export interface ClaimSource {
    sourceUrl: string;
    /** ISO date (`YYYY-MM-DD`) the claim was last checked against `sourceUrl`. */
    checkedOn: Date;
}

export interface FeatureCell {
    status: FeatureStatus;
    /** Plan label shown under the status, e.g. `Free` or `Enterprise`. */
    plan?: string;
    detail?: string;
}

export type CompetitorFeatureCell = FeatureCell & ClaimSource;

export interface FeatureRow {
    feature: string;
    /** The product's own docs page for this feature, framework relative (e.g. `./pivoting/`). */
    docsUrl?: string;
    product: FeatureCell;
    competitor: CompetitorFeatureCell;
}

export interface FeatureGroup {
    name: string;
    rows: FeatureRow[];
}

/**
 * What a plan costs, without the amount: list prices go stale and each pricing page states its own.
 * `conditional` is free only on terms, e.g. non-commercial use or a revenue limit; `on-request`
 * is quoted by sales.
 */
export type PricingCost = 'free' | 'paid' | 'conditional' | 'on-request';

export interface PricingRow {
    plan: string;
    cost: PricingCost;
    licence: string;
}

export type CompetitorPricingRow = PricingRow & ClaimSource;

export interface KeyFigure {
    value: string;
    /** Smaller text after the value, e.g. `vs 1` after `4`. */
    valueSuffix?: string;
    label: string;
    detail: string;
}

export interface DecisionPageFaqItem {
    question: string;
    /** Markdoc. Link `./page/` for a docs page in the site framework, `/page/` for any other site page. */
    answer: string;
}

/** A competitor claim made in prose (short answer, choose-if lists, FAQ answers). */
export interface ProseClaim extends ClaimSource {
    claim: string;
}

export interface DecisionPageMeta {
    title: string;
    description: string;
    /** The search term the page is written to rank for; it must appear in the title, H1 and intro. */
    targetTerm: string;
    /** US monthly search volume behind `targetTerm`, recorded so each page states why it exists. */
    monthlySearches?: number;
    demandSource?: string;
}

export interface Competitor {
    name: string;
    /** URL segment, e.g. `tanstack-table` in `/compare/ag-grid-vs-tanstack-table/`. */
    slug: string;
    /** The competitor product's own page, which the structured data names as its `sameAs`. */
    url: string;
    /** Site-root path of the competitor's logo, shown beside its name in table headings. */
    logo?: string;
}

export interface ComparisonPageContent {
    meta: DecisionPageMeta;
    /** Prefix for Plausible tagged-event names on this page's CTAs. */
    analyticsPrefix: string;
    technicalReviewer?: string;
    /** ISO date (`YYYY-MM-DD`) the page content was last reviewed, shown on the page. */
    lastUpdated: Date;
    competitor: Competitor;
    hero: {
        heading: string;
        subHeading: string;
    };
    /** Markdoc. The page's direct answer, written to be quotable on its own. */
    shortAnswer: string;
    keyFigures: KeyFigure[];
    features: {
        subHeading: string;
        groups: FeatureGroup[];
    };
    pricing: {
        subHeading: string;
        product: PricingRow[];
        competitor: CompetitorPricingRow[];
    };
    chooseIf: {
        product: string[];
        competitor: string[];
    };
    faq: DecisionPageFaqItem[];
    /** Sources for competitor claims made in prose rather than in a table cell. */
    proseClaims: ProseClaim[];
}

/**
 * What the rendering site supplies to a decision page template: everything that differs between
 * AG Grid, AG Charts and AG Studio but is the same on every page of that site.
 */
export interface DecisionPageSite {
    /** e.g. `AG Grid`. */
    productName: string;
    /** Short product key used in CTA ids and analytics attributes, e.g. `grid`. */
    productKey: string;
    /** URL of the product's logomark, shown beside its name in table headings. */
    productLogo: string;
    /** Framework that authored `./` docs links resolve to, and that Markdoc renders against. */
    framework: Framework;
    /**
     * Resolve an authored link: `./page/` to the framework's docs page, `/page/` to a site page.
     * The site's `urlWithPrefix` bound to `framework`, so the page and its markdown twin agree.
     */
    resolveUrl: (url: string) => string;
    /** Authored URLs, resolved with `resolveUrl` like any other link. */
    urls: {
        home: string;
        /** The cluster hub, e.g. `/compare/`. */
        hub: string;
        pricing: string;
        getStarted: string;
        demo: string;
        trial: string;
    };
    getStarted: {
        heading: string;
        body: string;
    };
}

export interface RelatedPageLink {
    title: string;
    url: string;
}

export interface RelatedPageGroup {
    name: string;
    links: RelatedPageLink[];
}
