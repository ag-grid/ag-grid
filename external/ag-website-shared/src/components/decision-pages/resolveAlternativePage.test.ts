import { resolveAlternativePage } from './resolveAlternativePage';
import type { AlternativePageSource, ComparisonPageContent, FeatureRow } from './types';

const checkedOn = new Date('2026-11-11');
const SOURCE = 'https://example.com/grid';

const row = (feature: string): FeatureRow => ({
    feature,
    product: { status: 'yes' },
    competitor: { status: 'no', sourceUrl: SOURCE, checkedOn },
});

const COMPARISON = {
    features: {
        subHeading: 'Every feature.',
        groups: [
            { name: 'Platform', rows: [row('Frameworks'), row('Licence')] },
            { name: 'Data and performance', rows: [row('Row virtualisation')] },
            { name: 'Grouping and analysis', rows: [row('Row grouping'), row('Pivoting')] },
        ],
    },
    pricing: {
        subHeading: 'The plans each library offers.',
        product: [{ plan: 'Community', cost: 'free', licence: 'MIT' }],
        competitor: [{ plan: 'Pro', cost: 'paid', licence: 'Commercial', sourceUrl: SOURCE, checkedOn }],
    },
} as ComparisonPageContent;

const source = (features: string[]) =>
    ({ competitor: { name: 'Example Grid', slug: 'example' }, features }) as AlternativePageSource;

describe('resolveAlternativePage', () => {
    test("takes the named rows in the comparison page's groups and order, leaving out empty groups", () => {
        const { features } = resolveAlternativePage(source(['Pivoting', 'Frameworks', 'Row grouping']), COMPARISON);

        expect(features.groups).toEqual([
            { name: 'Platform', rows: [row('Frameworks')] },
            { name: 'Grouping and analysis', rows: [row('Row grouping'), row('Pivoting')] },
        ]);
    });

    test("takes the comparison page's pricing", () => {
        expect(resolveAlternativePage(source(['Frameworks']), COMPARISON).pricing).toBe(COMPARISON.pricing);
    });

    test('keeps the rest of the page as authored', () => {
        const content = resolveAlternativePage(source(['Frameworks']), COMPARISON);

        expect(content.competitor).toEqual({ name: 'Example Grid', slug: 'example' });
    });

    test('fails on a feature the comparison page has no row for, naming it', () => {
        expect(() => resolveAlternativePage(source(['Frameworks', 'Sparklines']), COMPARISON)).toThrow(
            'The Example Grid alternative page names features its comparison page has no row for: Sparklines'
        );
    });
});
