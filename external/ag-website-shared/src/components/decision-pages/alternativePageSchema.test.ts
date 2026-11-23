import { createAlternativePageSchema } from './alternativePageSchema';
import { listClaims } from './decisionPageSchema';
import type { AlternativePageContent } from './types';

const NOW = new Date('2026-11-23T00:00:00Z');
const SOURCE = 'https://www.syncfusion.com/products/communitylicense';
const checkedOn = '2026-11-11';

function validPage() {
    return {
        meta: {
            title: 'The Syncfusion alternative | AG Grid',
            description: 'Looking for a Syncfusion alternative?',
            targetTerm: 'syncfusion alternative',
        },
        analyticsPrefix: 'alternative-syncfusion',
        technicalReviewer: 'james',
        lastUpdated: '2026-11-23',
        competitor: {
            name: 'Syncfusion Data Grid',
            shortName: 'Syncfusion',
            slug: 'syncfusion',
            url: 'https://www.syncfusion.com/javascript-ui-controls/js-data-grid',
        },
        hero: { heading: 'A Syncfusion alternative', subHeading: 'AG Grid is free under the MIT licence.' },
        whySwitch: {
            heading: 'Why teams look for a Syncfusion Data Grid alternative',
            reasons: ['The Community License has revenue limits.'],
        },
        whyProduct: [{ title: 'Clear licensing', body: 'AG Grid Community is MIT licensed.' }],
        features: {
            groups: [
                {
                    name: 'Grouping and analysis',
                    rows: [
                        {
                            feature: 'Pivoting',
                            product: { status: 'yes', plan: 'Enterprise' },
                            competitor: { status: 'yes', plan: 'Grid SDK', sourceUrl: SOURCE, checkedOn },
                        },
                    ],
                },
            ],
        },
        pricing: {
            subHeading: 'The plans each library offers.',
            product: [{ plan: 'Community', cost: 'free', licence: 'MIT' }],
            competitor: [
                {
                    plan: 'Community License',
                    cost: 'conditional',
                    licence: 'Eligible organisations',
                    sourceUrl: SOURCE,
                    checkedOn,
                },
            ],
        },
        faq: [{ question: 'Is there a free alternative to Syncfusion?', answer: 'Yes.' }],
        proseClaims: [{ claim: 'The Community License has revenue limits.', sourceUrl: SOURCE, checkedOn }],
    };
}

const schema = createAlternativePageSchema({ reviewerKeys: ['james'], now: NOW });

describe('createAlternativePageSchema', () => {
    test('accepts a page whose competitor claims are sourced', () => {
        const result = schema.safeParse(validPage());

        expect(result.error?.issues ?? []).toEqual([]);
        expect(result.data?.competitor.shortName).toBe('Syncfusion');
    });

    test('rejects a page with no reasons to switch', () => {
        const page = validPage();
        const result = schema.safeParse({ ...page, whySwitch: { ...page.whySwitch, reasons: [] } });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.join('.')).toBe('whySwitch.reasons');
    });

    test('rejects a page with no prose claims, which would leave the reasons to switch unsourced', () => {
        const result = schema.safeParse({ ...validPage(), proseClaims: [] });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['proseClaims']);
    });

    test('rejects a pricing row with a price in place of a cost tier', () => {
        const page = validPage();
        const result = schema.safeParse({
            ...page,
            pricing: { ...page.pricing, product: [{ plan: 'Enterprise', cost: '$999', licence: 'Perpetual' }] },
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.join('.')).toBe('pricing.product.0.cost');
    });

    test('lists its feature, pricing and prose claims for the stale-claim check', () => {
        const content = schema.parse(validPage()) as AlternativePageContent;

        expect(listClaims(content).map(({ path }) => path)).toEqual([
            'features.groups.0.rows.0.competitor',
            'pricing.competitor.0',
            'proseClaims.0',
        ]);
    });
});
