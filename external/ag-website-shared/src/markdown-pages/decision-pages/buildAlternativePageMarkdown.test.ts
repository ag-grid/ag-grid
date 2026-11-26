import type { AlternativePageContent, DecisionPageSite } from '@ag-website-shared/components/decision-pages/types';

import { buildAlternativePageMarkdown } from './buildAlternativePageMarkdown';

const SOURCE = { sourceUrl: 'https://tanstack.com/table/latest', checkedOn: new Date('2026-11-01') };

const CONTENT: AlternativePageContent = {
    meta: {
        title: 'The TanStack Table alternative | AG Grid',
        description: 'Looking for a TanStack Table alternative?',
        targetTerm: 'tanstack table alternative',
    },
    analyticsPrefix: 'alternative-tanstack-table',
    lastUpdated: new Date('2026-11-23'),
    competitor: { name: 'TanStack Table', slug: 'tanstack-table', url: 'https://tanstack.com/table' },
    hero: { heading: 'A TanStack Table alternative', subHeading: 'AG Grid renders its own UI.' },
    whySwitch: {
        heading: 'Why teams look for a TanStack Table alternative',
        reasons: ['TanStack Table is headless.', 'Virtualisation needs a separate package.'],
    },
    whyProduct: [{ title: 'Clear licensing', body: 'AG Grid Community is MIT licensed.' }],
    features: {
        groups: [
            {
                name: 'Platform',
                rows: [
                    {
                        feature: 'Ready-made grid UI',
                        docsUrl: './theming/',
                        product: { status: 'yes', plan: 'Free', detail: 'Renders its own UI' },
                        competitor: { status: 'no', detail: 'Headless', ...SOURCE },
                    },
                ],
            },
        ],
    },
    pricing: {
        subHeading: 'The plans each library offers.',
        product: [{ plan: 'Community', cost: 'free', licence: 'MIT' }],
        competitor: [{ plan: 'TanStack Table', cost: 'free', licence: 'MIT', ...SOURCE }],
    },
    faq: [{ question: 'Is AG Grid free?', answer: 'Yes. See [pricing](/license-pricing/).' }],
    proseClaims: [{ claim: 'TanStack Table is headless.', ...SOURCE }],
};

const SITE: DecisionPageSite = {
    productName: 'AG Grid',
    productKey: 'grid',
    productLogo: '/images/ag-grid-logomark.svg',
    framework: 'react',
    resolveUrl: (url) => url.replace(/^\.\//, '/react-data-grid/'),
    urls: {
        home: '/',
        pricing: '/license-pricing/',
        getStarted: './getting-started/',
        demo: '/example/',
        trial: '/license-pricing/#trial',
    },
    getStarted: { heading: 'Try AG Grid with your own data', body: 'Start with AG Grid Community for free.' },
};

const COMPARISON = { title: 'AG Grid vs TanStack Table', url: '/compare/ag-grid-vs-tanstack-table/' };

const build = (overrides: Partial<Parameters<typeof buildAlternativePageMarkdown>[0]> = {}) =>
    buildAlternativePageMarkdown({
        content: CONTENT,
        site: SITE,
        comparison: COMPARISON,
        related: [{ name: 'Compare', links: [COMPARISON] }],
        siteRoot: 'https://www.ag-grid.com/',
        ...overrides,
    });

describe('buildAlternativePageMarkdown', () => {
    test('renders the page sections in page order', () => {
        const headings = build()
            .split('\n')
            .filter((line) => line.startsWith('#'));

        expect(headings).toEqual([
            '# A TanStack Table alternative',
            '## Why teams look for a TanStack Table alternative',
            '## Why AG Grid',
            '### Clear licensing',
            '## AG Grid and TanStack Table at a glance',
            '### Platform',
            '## Pricing',
            '### AG Grid',
            '### TanStack Table',
            '## Frequently asked questions',
            '### Is AG Grid free?',
            '## Get started',
            '### Try AG Grid with your own data',
            '## Related pages',
            '### Compare',
            '## Sources',
        ]);
    });

    test('opens with frontmatter, then the hero and the reasons teams switch', () => {
        expect(build()).toMatch(
            /^---\ntitle: "The TanStack Table alternative \| AG Grid"\ndescription: "Looking for a TanStack Table alternative\?"\n---\n\n# A TanStack Table alternative\n\nAG Grid renders its own UI\.\n\nLast updated 23 November 2026\n/
        );
        expect(build()).toContain(
            '*TanStack Table alternative*\n\n## Why teams look for a TanStack Table alternative\n\n- TanStack Table is headless.\n- Virtualisation needs a separate package.'
        );
    });

    test('renders the feature table with absolute docs links, then the link to the full comparison', () => {
        expect(build()).toContain(
            [
                '| Feature | AG Grid | TanStack Table |',
                '| --- | --- | --- |',
                '| [Ready-made grid UI](https://www.ag-grid.com/react-data-grid/theming/) | ✓ Free: Renders its own UI | – Not included: Headless |',
                '',
                'See the [full AG Grid vs TanStack Table comparison](https://www.ag-grid.com/compare/ag-grid-vs-tanstack-table/) for every feature, pricing and licensing.',
            ].join('\n')
        );
    });

    test('renders pricing as cost tiers and lists the claim sources', () => {
        const markdown = build();

        expect(markdown).toContain('| Community | ✓ Free | MIT |');
        expect(markdown).toMatch(
            /## Sources\n\nCompetitor claims on this page were checked against these sources:\n\n- <https:\/\/tanstack\.com\/table\/latest> \(checked 1 November 2026\)\n$/
        );
    });
});
