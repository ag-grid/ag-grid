import { z } from 'astro/zod';

import { type DecisionPageSchemaOptions, createDecisionPageSchemaParts } from './decisionPageSchema';

/**
 * The content-collection schema for alternative pages (`/alternatives/{competitor}-alternative/`).
 * Every competitor claim must be sourced; see `createDecisionPageSchemaParts`. The reasons teams
 * switch are competitor claims made in prose, so they are sourced in `proseClaims`. Feature rows and
 * pricing are not authored here: `features` names rows of the comparison page for the same
 * competitor, and `resolveAlternativePage` takes them, and its pricing, from there.
 */
export function createAlternativePageSchema(options: DecisionPageSchemaOptions) {
    const { base } = createDecisionPageSchemaParts(options);

    // Strict, so pricing or feature rows authored here fail the build rather than being ignored.
    return z
        .object({
            ...base,
            whySwitch: z.object({
                heading: z.string(),
                reasons: z.array(z.string()).min(1),
            }),
            whyProduct: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
            features: z
                .array(z.string())
                .min(1)
                .refine((features) => new Set(features).size === features.length, {
                    message: 'Name each feature once',
                }),
        })
        .strict();
}
