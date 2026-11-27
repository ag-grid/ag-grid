import { createComparisonPageSchema } from './comparisonPageSchema';
import { findStaleClaims } from './decisionPageSchema';
import type { ComparisonPageContent } from './types';

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
        competitor: { name: 'TanStack Table', slug: 'tanstack-table', url: 'https://tanstack.com/table' },
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
            subHeading: 'The plans each library offers.',
            product: [{ plan: 'Community', cost: 'free', licence: 'MIT' }],
            competitor: [{ plan: 'TanStack Table', cost: 'free', licence: 'MIT', sourceUrl: SOURCE, checkedOn }],
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

    test('keeps a key figure value suffix', () => {
        const keyFigures = [{ value: '4', valueSuffix: 'vs 1', label: 'Frameworks supported', detail: 'React only.' }];

        const result = schema.safeParse({ ...validPage(), keyFigures });

        expect(result.data?.keyFigures).toEqual(keyFigures);
    });

    test('accepts a competitor claim checked long ago, leaving it to findStaleClaims to warn', () => {
        expect(schema.safeParse(validPage({ checkedOn: '2025-01-01' })).success).toBe(true);
    });

    test("accepts tomorrow's UTC date, which is already today east of UTC", () => {
        expect(schema.safeParse(validPage({ checkedOn: '2026-11-12' })).success).toBe(true);
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

    test('rejects a page with no prose claims', () => {
        const result = schema.safeParse({ ...validPage(), proseClaims: [] });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['proseClaims']);
    });

    test('rejects a pricing row cost that is not a known tier', () => {
        const page = validPage();
        const result = schema.safeParse({
            ...page,
            pricing: { ...page.pricing, product: [{ plan: 'Enterprise', cost: '$999', licence: 'Perpetual' }] },
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.join('.')).toBe('pricing.product.0.cost');
    });

    test('rejects a reviewer the site does not know', () => {
        const result = schema.safeParse({ ...validPage(), technicalReviewer: 'house-account' });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['technicalReviewer']);
    });
});

describe('findStaleClaims', () => {
    const parse = (checkedOn: string) => schema.parse(validPage({ checkedOn })) as ComparisonPageContent;

    test('lists every competitor claim checked longer ago than the maximum age', () => {
        expect(findStaleClaims(parse('2026-07-01'), { now: NOW }).map(({ path }) => path)).toEqual([
            'features.groups.0.rows.0.competitor',
            'pricing.competitor.0',
            'proseClaims.0',
        ]);
    });

    test('lists nothing when every claim was checked recently', () => {
        expect(findStaleClaims(parse('2026-11-01'), { now: NOW })).toEqual([]);
    });

    test('honours a custom maximum claim age', () => {
        expect(findStaleClaims(parse('2026-11-01'), { now: NOW, maxClaimAgeDays: 5 })).toHaveLength(3);
        expect(findStaleClaims(parse('2026-11-08'), { now: NOW, maxClaimAgeDays: 5 })).toEqual([]);
    });
});
