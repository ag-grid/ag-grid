import type {
    DecisionPageSite,
    ProductAlternativePageContent,
} from '@ag-website-shared/components/decision-pages/types';

import { buildProductAlternativePageMarkdown } from './buildProductAlternativePageMarkdown';

const CONTENT: ProductAlternativePageContent = {
    meta: {
        title: 'AG Grid alternative | AG Grid',
        description: 'Looking for an AG Grid alternative?',
        targetTerm: 'ag grid alternative',
    },
    analyticsPrefix: 'alternative-ag-grid',
    lastUpdated: new Date('2026-11-23'),
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
    faq: [{ question: 'Is AG Grid free?', answer: 'Yes. See [pricing](/license-pricing/).' }],
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
        editions: './community-vs-enterprise/',
    },
    getStarted: { heading: 'Try AG Grid with your own data', body: 'Start with AG Grid Community for free.' },
};

const build = () =>
    buildProductAlternativePageMarkdown({
        content: CONTENT,
        site: SITE,
        related: [{ name: 'Compare', links: [{ title: 'AG Grid vs MUI X', url: '/compare/ag-grid-vs-mui-x/' }] }],
        siteRoot: 'https://www.ag-grid.com/',
    });

describe('buildProductAlternativePageMarkdown', () => {
    test('renders the page sections in page order, with no sources section', () => {
        const headings = build()
            .split('\n')
            .filter((line) => line.startsWith('#'));

        expect(headings).toEqual([
            '# Looking for an AG Grid alternative?',
            '## When a lighter library is enough',
            '## When AG Grid is the better fit',
            '### Room to grow',
            '## AG Grid Community and Enterprise',
            '### Grouping and analysis',
            '## Pricing',
            '### AG Grid',
            '## Frequently asked questions',
            '### Is AG Grid free?',
            '## Get started',
            '### Try AG Grid with your own data',
            '## Related pages',
            '### Compare',
        ]);
    });

    test('renders the editions table, then the link to Community vs Enterprise', () => {
        expect(build()).toContain(
            [
                '| Feature | AG Grid Community | AG Grid Enterprise |',
                '| --- | --- | --- |',
                '| [Pivoting](https://www.ag-grid.com/react-data-grid/pivoting/) | – Not included | ✓ Enterprise |',
                '',
                'See [AG Grid Community vs Enterprise](https://www.ag-grid.com/react-data-grid/community-vs-enterprise/) for every feature in each edition, and how to try Enterprise for free.',
            ].join('\n')
        );
    });
});
