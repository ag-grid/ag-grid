import { buildDecisionPageStructuredData } from './decisionPageStructuredData';

const CANONICAL_URL_BASE = 'https://www.ag-grid.com';
const PAGE_URL = 'https://www.ag-grid.com/compare/ag-grid-vs-tanstack-table/';

const BASE_INPUT = {
    canonicalUrlBase: CANONICAL_URL_BASE,
    pageUrl: PAGE_URL,
    title: 'AG Grid vs TanStack Table',
    description: 'Compare AG Grid and TanStack Table.',
    lastUpdated: new Date('2026-11-11'),
    breadcrumbs: [
        { name: 'AG Grid', url: 'https://www.ag-grid.com/' },
        { name: 'Compare', url: 'https://www.ag-grid.com/compare/' },
        { name: 'AG Grid vs TanStack Table', url: PAGE_URL },
    ],
};

describe('buildDecisionPageStructuredData', () => {
    test('emits a WebPage about the site SoftwareApplication, its breadcrumbs and a FAQPage', () => {
        const nodes = buildDecisionPageStructuredData({
            ...BASE_INPUT,
            competitor: { name: 'TanStack Table', url: 'https://tanstack.com/table' },
            faq: [
                { question: 'Is AG Grid free?', answer: 'Yes, see [pricing](./license-pricing/) for **Enterprise**.' },
            ],
        });

        expect(nodes).toEqual([
            {
                '@type': 'WebPage',
                '@id': PAGE_URL,
                url: PAGE_URL,
                name: 'AG Grid vs TanStack Table',
                description: 'Compare AG Grid and TanStack Table.',
                dateModified: '2026-11-11',
                inLanguage: 'en',
                isPartOf: { '@id': 'https://www.ag-grid.com/#website' },
                about: { '@id': 'https://www.ag-grid.com/#software-application' },
                breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
                mentions: { '@type': 'Thing', name: 'TanStack Table', sameAs: 'https://tanstack.com/table' },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${PAGE_URL}#breadcrumb`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'AG Grid', item: 'https://www.ag-grid.com/' },
                    { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.ag-grid.com/compare/' },
                    { '@type': 'ListItem', position: 3, name: 'AG Grid vs TanStack Table', item: PAGE_URL },
                ],
            },
            {
                '@type': 'FAQPage',
                '@id': `${PAGE_URL}#faq`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'Is AG Grid free?',
                        acceptedAnswer: { '@type': 'Answer', text: 'Yes, see pricing for Enterprise.' },
                    },
                ],
            },
        ]);
    });

    test('omits FAQPage when the page renders no FAQ, and mentions when there is no competitor', () => {
        const nodes = buildDecisionPageStructuredData(BASE_INPUT);

        expect(nodes.map((node) => node['@type'])).toEqual(['WebPage', 'BreadcrumbList']);
        expect(nodes[0].mentions).toBeUndefined();
    });

    test('keeps a subpath canonical base, so AG Charts and AG Studio pages reference their own product', () => {
        const nodes = buildDecisionPageStructuredData({
            ...BASE_INPUT,
            canonicalUrlBase: 'https://www.ag-grid.com/charts',
            pageUrl: 'https://www.ag-grid.com/charts/compare/ag-charts-vs-highcharts/',
        });

        expect(nodes[0].about).toEqual({ '@id': 'https://www.ag-grid.com/charts/#software-application' });
        expect(nodes[0].isPartOf).toEqual({ '@id': 'https://www.ag-grid.com/charts/#website' });
    });
});
