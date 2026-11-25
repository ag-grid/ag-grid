import { createAlternativePageSchema } from './alternativePageSchema';

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
        features: ['Row grouping', 'Pivoting'],
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

    test('rejects a page that names no features', () => {
        const result = schema.safeParse({ ...validPage(), features: [] });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['features']);
    });

    test('rejects a page that names a feature twice', () => {
        const result = schema.safeParse({ ...validPage(), features: ['Pivoting', 'Pivoting'] });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Name each feature once');
    });

    test('rejects pricing of its own, which comes from the comparison page', () => {
        const result = schema.safeParse({ ...validPage(), pricing: { subHeading: 'Plans' } });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].code).toBe('unrecognized_keys');
    });
});
