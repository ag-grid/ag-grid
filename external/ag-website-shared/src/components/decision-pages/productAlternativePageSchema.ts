import { z } from 'astro/zod';

import { type DecisionPageSchemaOptions, createDecisionPageSchemaParts } from './decisionPageSchema';

/**
 * The schema for the product's own alternative page. Strict, because it names no competitor: an
 * unsourced competitor block must fail the build, not be silently stripped.
 */
export function createProductAlternativePageSchema(options: DecisionPageSchemaOptions) {
    const { core, featureCell, pricingRow } = createDecisionPageSchemaParts(options);

    return z
        .object({
            ...core,
            lighterOption: z.object({
                heading: z.string(),
                reasons: z.array(z.string()).min(1),
            }),
            whyProduct: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
            editions: z.object({
                subHeading: z.string(),
                groups: z.array(
                    z.object({
                        name: z.string(),
                        rows: z.array(
                            z.object({
                                feature: z.string(),
                                docsUrl: z.string().optional(),
                                community: featureCell,
                                enterprise: featureCell,
                            })
                        ),
                    })
                ),
            }),
            pricing: z.object({
                subHeading: z.string(),
                product: z.array(pricingRow),
            }),
        })
        .strict();
}
