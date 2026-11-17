import type { FeatureCell, FeatureStatus } from './types';

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
} as const;

export const chooseIfHeading = (name: string): string => `Choose ${name} if`;

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

/** UK long-form date, e.g. `11 November 2026`, read in UTC so it matches the ISO date authored. */
export const formatLastUpdated = (date: Date): string =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
