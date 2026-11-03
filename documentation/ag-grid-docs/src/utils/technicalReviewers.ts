import { type JsonLdObject, getOrganizationId } from '@ag-website-shared/utils/structuredData';
import { PRODUCTION_GRID_SITE_URL } from '@constants';

interface TechnicalReviewer {
    name: string;
    jobTitle: string;
    /** Ghost author slug, i.e. the `<slug>` in /blog/author/<slug>/. */
    authorSlug: string;
}

/**
 * Named engineers credited as the technical reviewer of the main commercial pages (SE-180).
 * Credit a person with an author page, never a house or company account.
 */
export const TECHNICAL_REVIEWERS = {
    stephen: { name: 'Stephen Cooper', jobTitle: 'Grid Technical Lead', authorSlug: 'stephen' },
    james: { name: 'James Swinton-Bland', jobTitle: 'Developer Relations Lead', authorSlug: 'james' },
} as const satisfies Record<string, TechnicalReviewer>;

export type TechnicalReviewerKey = keyof typeof TECHNICAL_REVIEWERS;

export const TECHNICAL_REVIEWER_KEYS = Object.keys(TECHNICAL_REVIEWERS) as [
    TechnicalReviewerKey,
    ...TechnicalReviewerKey[],
];

/** The blog only exists on production, so the author page is always the production URL. */
export const getAuthorPageUrl = (key: TechnicalReviewerKey): string =>
    `${PRODUCTION_GRID_SITE_URL}/blog/author/${TECHNICAL_REVIEWERS[key].authorSlug}/`;

/** The `Person` `@id` the author pages are to declare (SE-103), so both pages name one entity. */
export const getPersonId = (key: TechnicalReviewerKey): string => `${getAuthorPageUrl(key)}#person`;

/**
 * JSON-LD crediting `key` as the reviewer of the page at `pageUrl`: a `WebPage` whose `reviewedBy`
 * references the author-page `Person` by `@id`. The `Person` node is emitted too, carrying just
 * enough to identify the reviewer on its own, since the author page's node is the full profile.
 */
export function buildTechnicalReviewStructuredData({
    pageUrl,
    reviewer,
}: {
    pageUrl: string;
    reviewer: TechnicalReviewerKey;
}): JsonLdObject[] {
    const { name, jobTitle } = TECHNICAL_REVIEWERS[reviewer];
    const personId = getPersonId(reviewer);

    return [
        {
            '@type': 'WebPage',
            '@id': pageUrl,
            url: pageUrl,
            reviewedBy: { '@id': personId },
        },
        {
            '@type': 'Person',
            '@id': personId,
            name,
            jobTitle,
            url: getAuthorPageUrl(reviewer),
            worksFor: { '@id': getOrganizationId() },
        },
    ];
}
