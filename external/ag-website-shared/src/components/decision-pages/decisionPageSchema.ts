import { z } from 'astro/zod';

import type { ClaimBearingContent } from './types';

/** How long a competitor claim goes before the build warns that it needs re-checking. */
export const DEFAULT_MAX_CLAIM_AGE_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DecisionPageSchemaOptions {
    /** The site's technical reviewer keys, so a page can only credit a known engineer. */
    reviewerKeys: readonly [string, ...string[]];
    /** The date `checkedOn` must not be after. Defaults to the build date; fixed in tests. */
    now?: Date;
}

/**
 * The schema parts every decision page shares, for the page schemas to compose.
 *
 * Every competitor claim, whether in a table cell, a pricing row or prose, must carry `sourceUrl`
 * and `checkedOn`, so no unverified competitor claim is published (SE-148). How recently a claim
 * was checked is not validated here: `findStaleClaims` reports old ones as build warnings, so a
 * date passing never breaks a build.
 */
export function createDecisionPageSchemaParts({ reviewerKeys, now = new Date() }: DecisionPageSchemaOptions) {
    // `checkedOn` is a calendar date read as UTC midnight; a day's grace accepts today's date in
    // every time zone.
    const latestAllowed = new Date(now.getTime() + DAY_MS);

    const claimSource = {
        sourceUrl: z.string().url(),
        checkedOn: z.coerce
            .date()
            .refine((checkedOn) => checkedOn <= latestAllowed, { message: 'checkedOn is in the future' }),
    };

    const featureCell = z.object({
        status: z.enum(['yes', 'limited', 'no']),
        plan: z.string().optional(),
        detail: z.string().optional(),
    });

    const pricingRow = z.object({
        plan: z.string(),
        cost: z.enum(['free', 'paid', 'conditional', 'on-request']),
        licence: z.string(),
    });

    /** The fields every decision page has. */
    const core = {
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
        hero: z.object({
            heading: z.string(),
            subHeading: z.string(),
        }),
        faq: z.array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        ),
    };

    return {
        core,
        featureCell,
        pricingRow,
        /** The fields every page about a competitor has. */
        base: {
            ...core,
            competitor: z.object({
                name: z.string(),
                shortName: z.string().optional(),
                slug: z.string().regex(/^[a-z0-9-]+$/),
                url: z.string().url(),
                logo: z.string().startsWith('/').optional(),
            }),
            // Every page makes competitor claims in its prose, so it must source at least one; an
            // empty list would leave that prose unchecked.
            proseClaims: z
                .array(z.object({ claim: z.string(), ...claimSource }))
                .min(1, 'Source the competitor claims made in prose: add at least one proseClaims entry'),
        },
        featureGroups: z.array(
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
        pricing: z.object({
            subHeading: z.string(),
            product: z.array(pricingRow),
            competitor: z.array(pricingRow.extend(claimSource)),
        }),
    };
}

export interface PageClaim {
    /** Where the claim is in the page content, e.g. `pricing.competitor.0`. */
    path: string;
    sourceUrl: string;
    checkedOn: Date;
}

/** Every competitor claim on a page, in page order: feature cells, pricing rows, then prose. */
export function listClaims(content: ClaimBearingContent): PageClaim[] {
    return [
        ...(content.features?.groups ?? []).flatMap((group, groupIndex) =>
            group.rows.map((row, rowIndex) => ({
                path: `features.groups.${groupIndex}.rows.${rowIndex}.competitor`,
                ...row.competitor,
            }))
        ),
        ...(content.pricing?.competitor ?? []).map((row, index) => ({ path: `pricing.competitor.${index}`, ...row })),
        ...content.proseClaims.map((claim, index) => ({ path: `proseClaims.${index}`, ...claim })),
    ].map(({ path, sourceUrl, checkedOn }) => ({ path, sourceUrl, checkedOn }));
}

/** The competitor claims last checked more than `maxClaimAgeDays` before `now`, for a build warning. */
export function findStaleClaims(
    content: ClaimBearingContent,
    { now = new Date(), maxClaimAgeDays = DEFAULT_MAX_CLAIM_AGE_DAYS }: { now?: Date; maxClaimAgeDays?: number } = {}
): PageClaim[] {
    const oldestAllowed = now.getTime() - maxClaimAgeDays * DAY_MS;
    return listClaims(content).filter(({ checkedOn }) => checkedOn.getTime() < oldestAllowed);
}
