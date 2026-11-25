import { createProductAlternativePageSchema } from './productAlternativePageSchema';

function validPage() {
    return {
        meta: {
            title: 'AG Grid alternative | AG Grid',
            description: 'Looking for an AG Grid alternative?',
            targetTerm: 'ag grid alternative',
        },
        analyticsPrefix: 'alternative-ag-grid',
        technicalReviewer: 'james',
        lastUpdated: '2026-11-23',
        hero: { heading: 'Looking for an AG Grid alternative?', subHeading: 'AG Grid Community is free.' },
        lighterOption: { heading: 'When a lighter library is enough', reasons: ['Your table is read-only.'] },
        whyProduct: [{ title: 'Room to grow', body: 'Add AG Grid Enterprise when you need it.' }],
        editions: {
            subHeading: 'Community is free; Enterprise adds advanced features.',
            groups: [
                {
                    name: 'Grouping and analysis',
                    rows: [
                        {
                            feature: 'Pivoting',
                            docsUrl: './pivoting/',
                            community: { status: 'no' },
                            enterprise: { status: 'yes', plan: 'Enterprise' },
                        },
                    ],
                },
            ],
        },
        pricing: {
            subHeading: 'AG Grid Community is free.',
            product: [{ plan: 'Community', cost: 'free', licence: 'MIT' }],
        },
        faq: [{ question: 'Is AG Grid free?', answer: 'Yes.' }],
    };
}

const schema = createProductAlternativePageSchema({ reviewerKeys: ['james'] });

describe('createProductAlternativePageSchema', () => {
    test('accepts a page comparing the Community and Enterprise editions', () => {
        expect(schema.safeParse(validPage()).error?.issues ?? []).toEqual([]);
    });

    // The page names no competitor, so a competitor block must fail rather than be dropped unsourced.
    test('rejects a competitor or competitor claims', () => {
        const result = schema.safeParse({
            ...validPage(),
            competitor: { name: 'Syncfusion', slug: 'syncfusion', url: 'https://www.syncfusion.com/' },
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].code).toBe('unrecognized_keys');
    });
});
