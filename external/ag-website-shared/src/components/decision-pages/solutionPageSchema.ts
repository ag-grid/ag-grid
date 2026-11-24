import { z } from 'astro/zod';

import { type DecisionPageSchemaOptions, createDecisionPageSchemaParts } from './decisionPageSchema';

/**
 * The content-collection schema for solution pages (`/solutions/{topic}/`). Strict, so a field the
 * template does not render fails the build. Every product fact the page states is sourced in
 * `proseClaims`, the same way competitor claims are on the comparison pages.
 */
export function createSolutionPageSchema(options: DecisionPageSchemaOptions) {
    const { core, keyFigure, proseClaims } = createDecisionPageSchemaParts(options);

    return z
        .object({
            ...core,
            topic: z.object({ name: z.string(), mark: z.string() }),
            shortAnswer: z.string(),
            example: z.object({
                id: z.string().regex(/^[a-z0-9-]+$/),
                intro: z.string(),
                note: z.string(),
            }),
            keyFigures: z.object({
                heading: z.string(),
                figures: z.array(keyFigure).min(1),
            }),
            capabilities: z.object({
                heading: z.string(),
                items: z
                    .array(
                        z.object({
                            title: z.string(),
                            docsUrl: z.string().optional(),
                            plan: z.string(),
                            body: z.string(),
                        })
                    )
                    .min(1),
            }),
            howTo: z.object({
                heading: z.string(),
                steps: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
                code: z.string(),
                outro: z.string(),
            }),
            proseClaims: proseClaims('product'),
        })
        .strict();
}
