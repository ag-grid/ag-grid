import type { BryntumCampaignContent } from '@components/campaigns-components/bryntum/types';

import tiers from '../content/campaigns/bryntum-tiers.json';
import { resolveBryntumTierTokens } from './bryntumTierTokens';

const BRYNTUM_SLUG_ALIASES: Record<string, string> = {
    taskboard: 'task-board',
};

export interface BryntumCampaign {
    /** The page's URL segment under `/campaigns/`, e.g. `bryntum-task-board`. */
    urlSlug: string;
    content: BryntumCampaignContent;
}

/**
 * Every Bryntum campaign page's content with its tier tokens resolved, shared by the HTML page and
 * its markdown twin so both routes emit the same URLs and copy.
 */
export function loadBryntumCampaigns(): BryntumCampaign[] {
    const contentModules = import.meta.glob<BryntumCampaignContent>(
        ['../content/campaigns/bryntum-products/*.json', '!../content/campaigns/bryntum-products/*-original.json'],
        { eager: true, import: 'default' }
    );

    return Object.values(contentModules).map((raw) => {
        const content = resolveBryntumTierTokens(raw, tiers);
        return { urlSlug: `bryntum-${BRYNTUM_SLUG_ALIASES[content.slug] ?? content.slug}`, content };
    });
}
