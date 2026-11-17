import { createComparisonPageSchema } from './comparisonPageSchema';

const NOW = new Date('2026-11-11T00:00:00Z');
const SOURCE = 'https://tanstack.com/table/latest/docs/introduction';

function validPage({ checkedOn = '2026-11-01' }: { checkedOn?: string } = {}) {
    return {
        meta: {
            title: 'AG Grid vs TanStack Table',
            description: 'Compare them.',
            targetTerm: 'ag grid vs tanstack table',
        },
        analyticsPrefix: 'compare-tanstack-table',
        technicalReviewer: 'james',
        lastUpdated: '2026-11-11',
        competitor: { name: 'TanStack Table', slug: 'tanstack-table' },
        hero: { heading: 'AG Grid vs TanStack Table', subHeading: 'How they compare.' },
        shortAnswer: 'AG Grid renders its own UI.',
        keyFigures: [{ value: 'MIT', label: 'Both free cores', detail: 'Both are MIT licensed.' }],
        features: {
            subHeading: 'Which features each grid includes.',
            groups: [
                {
                    name: 'Platform',
                    rows: [
                        {
                            feature: 'Ready-made grid UI',
                            product: { status: 'yes', plan: 'Free' },
                            competitor: { status: 'no', detail: 'Headless', sourceUrl: SOURCE, checkedOn },
                        },
                    ],
                },
            ],
        },
        pricing: {
            subHeading: 'List prices.',
            product: [{ plan: 'Community', price: 'Free', licence: 'MIT' }],
            competitor: [{ plan: 'TanStack Table', price: 'Free', licence: 'MIT', sourceUrl: SOURCE, checkedOn }],
        },
        chooseIf: { product: ['You want a grid UI.'], competitor: ['You want full control.'] },
        faq: [{ question: 'Is TanStack Table free?', answer: 'Yes.' }],
        proseClaims: [{ claim: 'TanStack Table is headless.', sourceUrl: SOURCE, checkedOn }],
    };
}

const schema = createComparisonPageSchema({ reviewerKeys: ['james', 'stephen'], now: NOW });

describe('createComparisonPageSchema', () => {
    test('accepts a page whose competitor claims are sourced and recently checked', () => {
        const result = schema.safeParse(validPage());

        expect(result.success).toBe(true);
        expect(result.data?.lastUpdated).toEqual(new Date('2026-11-11'));
    });

    test('rejects a competitor claim checked longer ago than the maximum age', () => {
        const result = schema.safeParse(validPage({ checkedOn: '2026-07-01' }));

        expect(result.success).toBe(false);
        const paths = result.error?.issues.map((issue) => issue.path.join('.'));
        expect(paths).toEqual([
            'features.groups.0.rows.0.competitor.checkedOn',
            'pricing.competitor.0.checkedOn',
            'proseClaims.0.checkedOn',
        ]);
        expect(result.error?.issues[0].message).toMatch(/re-verify it against its source/);
    });

    test('rejects a checked date in the future', () => {
        const result = schema.safeParse(validPage({ checkedOn: '2026-12-01' }));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('checkedOn is in the future');
    });

    test('rejects a competitor feature cell with no source', () => {
        const page = validPage();
        const { sourceUrl: _, ...unsourced } = page.features.groups[0].rows[0].competitor;
        page.features.groups[0].rows[0].competitor =
            unsourced as (typeof page.features.groups)[0]['rows'][0]['competitor'];

        const result = schema.safeParse(page);

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.join('.')).toBe('features.groups.0.rows.0.competitor.sourceUrl');
    });

    test('rejects a source that is not a URL', () => {
        const result = schema.safeParse({
            ...validPage(),
            proseClaims: [{ claim: 'x', sourceUrl: 'their pricing page', checkedOn: '2026-11-01' }],
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.join('.')).toBe('proseClaims.0.sourceUrl');
    });

    test('rejects a reviewer the site does not know', () => {
        const result = schema.safeParse({ ...validPage(), technicalReviewer: 'house-account' });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['technicalReviewer']);
    });

    test('honours a custom maximum claim age', () => {
        const strict = createComparisonPageSchema({ reviewerKeys: ['james'], maxClaimAgeDays: 5, now: NOW });

        expect(strict.safeParse(validPage({ checkedOn: '2026-11-01' })).success).toBe(false);
        expect(strict.safeParse(validPage({ checkedOn: '2026-11-08' })).success).toBe(true);
    });
});
