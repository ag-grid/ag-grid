import { z } from 'astro/zod';

import { type DecisionPageSchemaOptions, createDecisionPageSchemaParts } from './decisionPageSchema';

/**
 * The content-collection schema for comparison pages (`/compare/{product}-vs-{competitor}/`).
 * Every competitor claim must be sourced; see `createDecisionPageSchemaParts`.
 */
export function createComparisonPageSchema(options: DecisionPageSchemaOptions) {
    const { base, featureGroups, pricing } = createDecisionPageSchemaParts(options);

    return z.object({
        ...base,
        shortAnswer: z.string(),
        keyFigures: z.array(
            z.object({
                value: z.string(),
                valueSuffix: z.string().optional(),
                label: z.string(),
                detail: z.string(),
            })
        ),
        features: z.object({
            subHeading: z.string(),
            groups: featureGroups,
        }),
        pricing,
        chooseIf: z.object({
            product: z.array(z.string()),
            competitor: z.array(z.string()),
        }),
    });
}
