import type { ComparisonPageContent, DecisionPageSite } from '@ag-website-shared/components/decision-pages/types';

import { buildComparisonPageMarkdown } from './buildComparisonPageMarkdown';

const SOURCE = { sourceUrl: 'https://tanstack.com/table/latest', checkedOn: new Date('2026-11-01') };

const CONTENT: ComparisonPageContent = {
    meta: {
        title: 'AG Grid vs TanStack Table: Features and Pricing',
        description: 'Compare AG Grid and TanStack Table.',
        targetTerm: 'ag grid vs tanstack table',
    },
    analyticsPrefix: 'compare-tanstack-table',
    lastUpdated: new Date('2026-11-11'),
    competitor: { name: 'TanStack Table', slug: 'tanstack-table' },
    hero: { heading: 'AG Grid vs TanStack Table', subHeading: 'How the two compare.' },
    shortAnswer: 'AG Grid renders its own UI. See [pivoting](./pivoting/).',
    keyFigures: [{ value: 'MIT', label: 'Both free cores', detail: 'Both are MIT licensed.' }],
    features: {
        subHeading: 'Which features each grid includes.',
        groups: [
            {
                name: 'Platform',
                rows: [
                    {
                        feature: 'Ready-made grid UI',
                        product: { status: 'yes', plan: 'Free', detail: 'Renders its own UI' },
                        competitor: { status: 'no', detail: 'Headless | you write the markup', ...SOURCE },
                    },
                ],
            },
        ],
    },
    pricing: {
        subHeading: 'List prices per developer.',
        product: [{ plan: 'Community', price: 'Free', licence: 'MIT' }],
        competitor: [{ plan: 'TanStack Table', price: 'Free', licence: 'MIT', ...SOURCE }],
    },
    chooseIf: { product: ['You want a grid UI.'], competitor: ['You want full control.'] },
    faq: [{ question: 'Is AG Grid free?', answer: 'Yes. See [pricing](/license-pricing/).' }],
    proseClaims: [],
};

const SITE: DecisionPageSite = {
    productName: 'AG Grid',
    productKey: 'grid',
    productLogo: '/images/ag-grid-logomark.svg',
    framework: 'react',
    resolveUrl: (url) => url.replace(/^\.\//, '/react-data-grid/'),
    urls: {
        home: '/',
        hub: '/compare/',
        pricing: '/license-pricing/',
        getStarted: './getting-started/',
        demo: '/example/',
        trial: '/license-pricing/#trial',
    },
    getStarted: { heading: 'Try AG Grid with your own data', body: 'Start with AG Grid Community for free.' },
};

const build = (overrides: Partial<Parameters<typeof buildComparisonPageMarkdown>[0]> = {}) =>
    buildComparisonPageMarkdown({
        content: CONTENT,
        site: SITE,
        related: [{ name: 'Compare', links: [{ title: 'AG Grid vs MUI X', url: '/compare/ag-grid-vs-mui-x/' }] }],
        siteRoot: 'https://www.ag-grid.com/',
        ...overrides,
    });

describe('buildComparisonPageMarkdown', () => {
    test('renders the page sections in page order', () => {
        const headings = build()
            .split('\n')
            .filter((line) => line.startsWith('#'));

        expect(headings).toEqual([
            '# AG Grid vs TanStack Table',
            '## The short answer',
            '## Key differences',
            '## Feature comparison',
            '### Platform',
            '## Pricing and licensing',
            '### AG Grid',
            '### TanStack Table',
            '## Which one fits your project',
            '### Choose AG Grid if',
            '### Choose TanStack Table if',
            '## Frequently asked questions',
            '### Is AG Grid free?',
            '## Get started',
            '### Try AG Grid with your own data',
            '## Related pages',
            '### Compare',
        ]);
    });

    test('opens with frontmatter from the page meta', () => {
        expect(build()).toMatch(
            /^---\ntitle: "AG Grid vs TanStack Table: Features and Pricing"\ndescription: "Compare AG Grid and TanStack Table."\n---\n\n# AG Grid vs TanStack Table\n\nHow the two compare.\n\nLast updated 11 November 2026\n/
        );
    });

    test('renders feature cells with status symbol, plan and escaped detail', () => {
        expect(build()).toContain(
            [
                '| Feature | AG Grid | TanStack Table |',
                '| --- | --- | --- |',
                '| Ready-made grid UI | ✓ Free: Renders its own UI | – Not included: Headless \\| you write the markup |',
            ].join('\n')
        );
    });

    test('makes links absolute in authored copy, CTAs and related pages', () => {
        const markdown = build();

        expect(markdown).toContain(
            'AG Grid renders its own UI. See [pivoting](https://www.ag-grid.com/react-data-grid/pivoting/).'
        );
        expect(markdown).toContain('Yes. See [pricing](https://www.ag-grid.com/license-pricing/).');
        expect(markdown).toContain('- [Get started](https://www.ag-grid.com/react-data-grid/getting-started/)');
        expect(markdown).toContain('- [AG Grid vs MUI X](https://www.ag-grid.com/compare/ag-grid-vs-mui-x/)');
    });

    test('omits the FAQ and related sections when there are none', () => {
        const markdown = build({ content: { ...CONTENT, faq: [] }, related: [] });

        expect(markdown).not.toContain('## Frequently asked questions');
        expect(markdown).not.toContain('## Related pages');
    });
});
