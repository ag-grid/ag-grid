import { z } from 'astro/zod';

import { type DecisionPageSchemaOptions, createDecisionPageSchemaParts } from './decisionPageSchema';

/**
 * The content-collection schema for alternative pages (`/alternatives/{competitor}-alternative/`).
 * Every competitor claim must be sourced; see `createDecisionPageSchemaParts`. The reasons teams
 * switch are competitor claims made in prose, so they are sourced in `proseClaims`.
 */
export function createAlternativePageSchema(options: DecisionPageSchemaOptions) {
    const { base, featureGroups, pricing } = createDecisionPageSchemaParts(options);

    return z.object({
        ...base,
        whySwitch: z.object({
            heading: z.string(),
            reasons: z.array(z.string()).min(1),
        }),
        whyProduct: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
        features: z.object({
            groups: featureGroups,
        }),
        pricing,
    });
}
