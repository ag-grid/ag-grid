import { z } from 'astro/zod';

/** How long a competitor claim stays publishable after it was last checked against its source. */
export const DEFAULT_MAX_CLAIM_AGE_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

interface ComparisonPageSchemaOptions {
    /** The site's technical reviewer keys, so a page can only credit a known engineer. */
    reviewerKeys: readonly [string, ...string[]];
    maxClaimAgeDays?: number;
    /** The date claims are judged against. Defaults to the build date; fixed in tests. */
    now?: Date;
}

/**
 * The content-collection schema for comparison pages (`/compare/{product}-vs-{competitor}/`).
 *
 * Every competitor claim, whether in a table cell, a price or prose, carries `sourceUrl` and
 * `checkedOn`, and a claim checked more than `maxClaimAgeDays` ago fails the build. That makes
 * the SE-148 rule ("no unverified competitor claim is published") something the build enforces
 * rather than something a reviewer has to remember.
 */
export function createComparisonPageSchema({
    reviewerKeys,
    maxClaimAgeDays = DEFAULT_MAX_CLAIM_AGE_DAYS,
    now = new Date(),
}: ComparisonPageSchemaOptions) {
    const oldestAllowed = new Date(now.getTime() - maxClaimAgeDays * DAY_MS);

    const claimSource = {
        sourceUrl: z.string().url(),
        checkedOn: z.coerce
            .date()
            .refine((checkedOn) => checkedOn >= oldestAllowed, {
                message: `Claim was checked more than ${maxClaimAgeDays} days ago: re-verify it against its source and update checkedOn`,
            })
            .refine((checkedOn) => checkedOn <= now, { message: 'checkedOn is in the future' }),
    };

    const featureCell = z.object({
        status: z.enum(['yes', 'limited', 'no']),
        plan: z.string().optional(),
        detail: z.string().optional(),
    });

    const pricingRow = z.object({
        plan: z.string(),
        price: z.string(),
        licence: z.string(),
    });

    return z.object({
        meta: z.object({
            title: z.string(),
            description: z.string(),
            targetTerm: z.string(),
            monthlySearches: z.number().int().nonnegative().optional(),
            demandSource: z.string().optional(),
        }),
        analyticsPrefix: z.string(),
        technicalReviewer: z.enum(reviewerKeys).optional(),
        lastUpdated: z.coerce.date(),
        competitor: z.object({
            name: z.string(),
            slug: z.string().regex(/^[a-z0-9-]+$/),
            logo: z.string().startsWith('/').optional(),
        }),
        hero: z.object({
            heading: z.string(),
            subHeading: z.string(),
        }),
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
            groups: z.array(
                z.object({
                    name: z.string(),
                    rows: z.array(
                        z.object({
                            feature: z.string(),
                            docsUrl: z.string().optional(),
                            product: featureCell,
                            competitor: featureCell.extend(claimSource),
                        })
                    ),
                })
            ),
        }),
        pricing: z.object({
            subHeading: z.string(),
            product: z.array(pricingRow),
            competitor: z.array(pricingRow.extend(claimSource)),
        }),
        chooseIf: z.object({
            product: z.array(z.string()),
            competitor: z.array(z.string()),
        }),
        faq: z.array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        ),
        proseClaims: z.array(z.object({ claim: z.string(), ...claimSource })),
    });
}
