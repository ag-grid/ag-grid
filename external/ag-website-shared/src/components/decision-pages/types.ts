import type { Framework } from '@ag-grid-types';

/**
 * Content types for the purchase-decision pages (comparison, alternative, solution and migration
 * pages). Shared by AG Grid, AG Charts and AG Studio: every product-specific value (product name,
 * URLs, reviewer) comes from the content entry or from the rendering site.
 *
 * The matching Zod schemas are `createComparisonPageSchema` in `./comparisonPageSchema` and
 * `createAlternativePageSchema` in `./alternativePageSchema`.
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
    /**
     * A shorter name for places that repeat it, such as the breadcrumb `Syncfusion alternative` on a
     * page about Syncfusion Data Grid. Defaults to `name`.
     */
    shortName?: string;
    /** URL segment, e.g. `tanstack-table` in `/compare/ag-grid-vs-tanstack-table/`. */
    slug: string;
    /** The competitor product's own page, which the structured data names as its `sameAs`. */
    url: string;
    /** Site-root path of the competitor's logo, shown beside its name in table headings. */
    logo?: string;
}

/** The fields every decision page has, whichever cluster it belongs to. */
interface DecisionPageCore {
    meta: DecisionPageMeta;
    /** Prefix for Plausible tagged-event names on this page's CTAs. */
    analyticsPrefix: string;
    technicalReviewer?: string;
    /** ISO date (`YYYY-MM-DD`) the page content was last reviewed, shown on the page. */
    lastUpdated: Date;
    hero: {
        heading: string;
        subHeading: string;
    };
    faq: DecisionPageFaqItem[];
}

/** The fields of a decision page about a competitor. */
interface DecisionPageContentBase extends DecisionPageCore {
    competitor: Competitor;
    /** Sources for competitor claims made in prose rather than in a table cell. */
    proseClaims: ProseClaim[];
}

/**
 * The parts of a decision page that carry competitor claims, each with its source. An alternative
 * page as authored has only its prose claims: its feature rows and pricing are the comparison page's.
 */
export interface ClaimBearingContent {
    features?: { groups: FeatureGroup[] };
    pricing?: { competitor: CompetitorPricingRow[] };
    proseClaims: ProseClaim[];
}

export interface ComparisonPageContent extends DecisionPageContentBase {
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
}

/** A reason to choose the product, shown as a card. */
export interface ProductReason {
    title: string;
    body: string;
}

/**
 * An alternative page (`/alternatives/{competitor}-alternative/`): for people already looking to
 * replace the competitor. Shorter than a comparison page, it leads with why teams switch, and links
 * to the full comparison. This is the page as rendered; see `AlternativePageSource` for the page
 * as authored.
 */
export interface AlternativePageContent extends DecisionPageContentBase {
    whySwitch: {
        /** e.g. `Why teams look for a Syncfusion Data Grid alternative`. */
        heading: string;
        /** Competitor claims, each sourced in `proseClaims`. */
        reasons: string[];
    };
    /** Why the product is the alternative, one card per reason. */
    whyProduct: ProductReason[];
    /** The features that matter most to someone leaving the competitor; the comparison page has the rest. */
    features: {
        groups: FeatureGroup[];
    };
    pricing: ComparisonPageContent['pricing'];
}

/**
 * An alternative page as authored. The comparison page for the same competitor is the source of
 * truth for features and pricing, so the page names the features it shows and takes their rows,
 * and the pricing, from that page (`resolveAlternativePage`).
 */
export interface AlternativePageSource extends Omit<AlternativePageContent, 'features' | 'pricing'> {
    /** Feature names, as the comparison page's rows name them. They show in the comparison page's order. */
    features: string[];
}

/** A feature row comparing the product's free Community edition with its Enterprise edition. */
export interface EditionFeatureRow {
    feature: string;
    /** The product's own docs page for this feature, framework relative (e.g. `./pivoting/`). */
    docsUrl?: string;
    community: FeatureCell;
    enterprise: FeatureCell;
}

export interface EditionFeatureGroup {
    name: string;
    rows: EditionFeatureRow[];
}

/**
 * The product's own alternative page (`/alternatives/{product}-alternative/`), for people searching
 * for an alternative to the product itself. It names no competitor and makes no competitor claims:
 * it shows when a lighter library is enough, and when the free Community edition or Enterprise fits.
 */
export interface ProductAlternativePageContent extends DecisionPageCore {
    lighterOption: {
        /** e.g. `When a lighter library is enough`. */
        heading: string;
        reasons: string[];
    };
    /** When the product is the better fit, one card per reason. */
    whyProduct: ProductReason[];
    editions: {
        subHeading: string;
        groups: EditionFeatureGroup[];
    };
    pricing: {
        subHeading: string;
        product: PricingRow[];
    };
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
        pricing: string;
        getStarted: string;
        demo: string;
        trial: string;
        /** The product's Community vs Enterprise page, linked from the product's own alternative page. */
        editions?: string;
    };
    getStarted: {
        heading: string;
        body: string;
    };
}

/** A cluster hub, e.g. `Compare` at `/compare/`: a page's breadcrumb parent. */
export interface DecisionHubLink {
    name: string;
    /** Authored URL, resolved with the site's `resolveUrl`. */
    url: string;
}

export interface RelatedPageLink {
    title: string;
    url: string;
}

export interface RelatedPageGroup {
    name: string;
    links: RelatedPageLink[];
}
