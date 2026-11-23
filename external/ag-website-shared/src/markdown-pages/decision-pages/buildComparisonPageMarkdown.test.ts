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
    competitor: { name: 'TanStack Table', slug: 'tanstack-table', url: 'https://tanstack.com/table' },
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
        subHeading: 'The plans each library offers.',
        product: [
            { plan: 'Community', cost: 'free', licence: 'MIT' },
            { plan: 'Enterprise', cost: 'paid', licence: 'Perpetual' },
        ],
        competitor: [
            { plan: 'TanStack Table', cost: 'free', licence: 'MIT', ...SOURCE },
            { plan: 'Enterprise Support', cost: 'on-request', licence: 'A support service', ...SOURCE },
        ],
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
            '## Sources',
        ]);
    });

    test('opens with frontmatter from the page meta', () => {
        expect(build()).toMatch(
            /^---\ntitle: "AG Grid vs TanStack Table: Features and Pricing"\ndescription: "Compare AG Grid and TanStack Table."\n---\n\n# AG Grid vs TanStack Table\n\nHow the two compare.\n\nLast updated 11 November 2026\n/
        );
    });

    test('renders key figures with their value suffix, when there is one', () => {
        const keyFigures = [
            { value: '4', valueSuffix: 'vs 1', label: 'Frameworks supported', detail: 'React only.' },
            { value: 'MIT', label: 'Both free cores', detail: 'Both are MIT licensed.' },
        ];

        expect(build({ content: { ...CONTENT, keyFigures } })).toContain(
            [
                '- **4 vs 1** Frameworks supported: React only.',
                '- **MIT** Both free cores: Both are MIT licensed.',
            ].join('\n')
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

    test('links a feature to its docs page, when it has one', () => {
        const [group] = CONTENT.features.groups;
        const rows = [{ ...group.rows[0], docsUrl: './grid-interface/' }];
        const content = { ...CONTENT, features: { ...CONTENT.features, groups: [{ ...group, rows }] } };

        expect(build({ content })).toContain(
            '| [Ready-made grid UI](https://www.ag-grid.com/react-data-grid/grid-interface/) | ✓ Free'
        );
    });

    test('keeps the hero and Choose-if calls to action', () => {
        const markdown = build();

        expect(markdown).toContain(
            [
                '- [Get started free](https://www.ag-grid.com/react-data-grid/getting-started/)',
                '- [See the live demo](https://www.ag-grid.com/example/)',
            ].join('\n')
        );
        expect(markdown).toContain(
            '- You want a grid UI.\n\n[Get started free](https://www.ag-grid.com/react-data-grid/getting-started/)\n\n### Choose TanStack Table if'
        );
    });

    test('lists each claim source once, in page order, with the oldest date it was checked', () => {
        const proseClaims = [
            {
                claim: 'Has an MIT licence.',
                sourceUrl: 'https://tanstack.com/license',
                checkedOn: new Date('2026-11-05'),
            },
            { claim: 'Is headless.', ...SOURCE, checkedOn: new Date('2026-10-20') },
        ];

        expect(build({ content: { ...CONTENT, proseClaims } })).toMatch(
            /## Sources\n\nCompetitor claims on this page were checked against these sources:\n\n- <https:\/\/tanstack\.com\/table\/latest> \(checked 20 October 2026\)\n- <https:\/\/tanstack\.com\/license> \(checked 5 November 2026\)\n$/
        );
    });

    test('renders each pricing plan with its cost tier rather than a price', () => {
        const markdown = build();

        expect(markdown).toContain(
            [
                '| Plan | Cost | Licence |',
                '| --- | --- | --- |',
                '| Community | ✓ Free | MIT |',
                '| Enterprise | ✓ Paid | Perpetual |',
            ].join('\n')
        );
        expect(markdown).toContain('| Enterprise Support | On request | A support service |');
    });

    test('makes links absolute in authored copy, CTAs and related pages', () => {
        const markdown = build();

        expect(markdown).toContain(
            'AG Grid renders its own UI. See [pivoting](https://www.ag-grid.com/react-data-grid/pivoting/).'
        );
        expect(markdown).toContain('Yes. See [pricing](https://www.ag-grid.com/license-pricing/).');
        expect(markdown).toContain('- [Explore the Docs](https://www.ag-grid.com/react-data-grid/getting-started/)');
        expect(markdown).toContain('- [AG Grid vs MUI X](https://www.ag-grid.com/compare/ag-grid-vs-mui-x/)');
    });

    test('omits the FAQ and related sections when there are none', () => {
        const markdown = build({ content: { ...CONTENT, faq: [] }, related: [] });

        expect(markdown).not.toContain('## Frequently asked questions');
        expect(markdown).not.toContain('## Related pages');
    });
});
