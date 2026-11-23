import type { FeatureCell, FeatureStatus, PricingCost } from './types';

/**
 * Section labels and value formatting shared by the decision page templates and their markdown
 * twins, so the HTML page and the `.md` an agent reads cannot drift apart.
 */

export const COMPARISON_SECTIONS = {
    shortAnswer: 'The short answer',
    keyFigures: 'Key differences',
    features: 'Feature comparison',
    pricing: 'Pricing and licensing',
    chooseIf: 'Which one fits your project',
    faq: 'Frequently asked questions',
    getStarted: 'Get started',
    related: 'Related pages',
    sources: 'Sources',
} as const;

export const chooseIfHeading = (name: string): string => `Choose ${name} if`;

/** A comparison page's short name, e.g. `AG Grid vs MUI X Data Grid`: its breadcrumb, visible and in JSON-LD. */
export const comparisonPageName = (productName: string, competitorName: string): string =>
    `${productName} vs ${competitorName}`;

/** The get started panel's two calls to action: the docs, and an Enterprise trial licence. */
export const GET_STARTED_CTAS = {
    docs: 'Explore the Docs',
    trial: 'Try Enterprise Free',
} as const;

/** The hero's calls to action; `getStarted` is also the product's Choose-if button. */
export const HERO_CTAS = {
    getStarted: 'Get started free',
    demo: 'See the live demo',
} as const;

export const FEATURE_STATUS: Record<FeatureStatus, { symbol: string; label: string }> = {
    yes: { symbol: '✓', label: 'Included' },
    limited: { symbol: '◐', label: 'Limited' },
    no: { symbol: '–', label: 'Not included' },
};

/** The plan label that marks a feature as free; any other plan on an included feature is paid. */
export const FREE_PLAN = 'Free';

export type FeatureCellTone = 'free' | 'paid' | 'limited' | 'none';

/** How a feature cell's pill is coloured: free, paid tier, limited or not included. */
export const featureCellTone = ({ status, plan }: FeatureCell): FeatureCellTone => {
    if (status === 'no') {
        return 'none';
    }
    if (status === 'limited') {
        return 'limited';
    }
    return plan === undefined || plan === FREE_PLAN ? 'free' : 'paid';
};

/** The label under a feature cell's symbol: its plan, or the status when no plan applies. */
export const featureCellLabel = ({ status, plan }: FeatureCell): string => plan ?? FEATURE_STATUS[status].label;

/** The pill shown for a pricing plan's cost, in the same tones as the feature cells. */
export const PRICING_COST: Record<PricingCost, { symbol?: string; label: string; tone: FeatureCellTone }> = {
    free: { symbol: '✓', label: 'Free', tone: 'free' },
    paid: { symbol: '✓', label: 'Paid', tone: 'paid' },
    conditional: { symbol: '◐', label: 'Free, with conditions', tone: 'limited' },
    'on-request': { label: 'On request', tone: 'none' },
};

/** ISO calendar date, e.g. `2026-11-11`, read in UTC like `formatLastUpdated`. */
export const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** UK long-form date, e.g. `11 November 2026`, read in UTC so it matches the ISO date authored. */
export const formatLastUpdated = (date: Date): string =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
