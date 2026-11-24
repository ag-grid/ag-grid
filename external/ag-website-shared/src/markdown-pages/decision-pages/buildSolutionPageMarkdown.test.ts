import type { DecisionPageSite, SolutionPageContent } from '@ag-website-shared/components/decision-pages/types';

import { buildSolutionPageMarkdown } from './buildSolutionPageMarkdown';

const CONTENT: SolutionPageContent = {
    meta: {
        title: 'Inventory Management Dashboard Grid | AG Grid',
        description: 'Build an inventory management dashboard with AG Grid.',
        targetTerm: 'inventory management dashboard',
    },
    analyticsPrefix: 'solution-inventory-management',
    lastUpdated: new Date('2026-11-24'),
    topic: { name: 'Inventory management', mark: 'Inventory management' },
    hero: { heading: 'Build an inventory management dashboard with AG Grid', subHeading: 'Edit stock in place.' },
    shortAnswer: 'AG Grid shows stock levels in one editable table.',
    example: { id: 'inventory', intro: 'Edit a stock level.', note: 'Sample data.' },
    keyFigures: {
        heading: 'Key figures',
        figures: [{ value: '100k+', label: 'Rows', detail: 'In the Client-Side Row Model.' }],
    },
    capabilities: {
        heading: 'Capabilities',
        items: [
            { title: 'Cell editing', docsUrl: './cell-editing/', plan: 'Free', body: 'Edit cells in place.' },
            { title: 'Excel export', plan: 'Enterprise', body: 'Export to .xlsx.' },
        ],
    },
    howTo: {
        heading: 'How to build it',
        steps: [{ title: 'Make stock editable', body: 'Set `editable` on the column.' }],
        code: 'const columnDefs = [{ field: "stock", editable: true }];',
        outro: 'See the [inventory demo](/example-inventory/).',
    },
    faq: [{ question: 'Is AG Grid free?', answer: 'Yes.' }],
    proseClaims: [
        {
            claim: 'The Client-Side Row Model handles 100k+ rows.',
            sourceUrl: 'https://www.ag-grid.com/react-data-grid/row-models/',
            checkedOn: new Date('2026-11-24'),
        },
    ],
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

const build = () =>
    buildSolutionPageMarkdown({
        content: CONTENT,
        site: SITE,
        related: [{ name: 'Use cases', links: [{ title: 'Pivot tables', url: '/solutions/javascript-pivot-table/' }] }],
        siteRoot: 'https://www.ag-grid.com/',
    });

describe('buildSolutionPageMarkdown', () => {
    test('renders the page sections in page order, then the sources', () => {
        const headings = build()
            .split('\n')
            .filter((line) => line.startsWith('#'));

        expect(headings).toEqual([
            '# Build an inventory management dashboard with AG Grid',
            '## The short answer',
            '## Live example',
            '## Key figures',
            '## Capabilities',
            '### [Cell editing](https://www.ag-grid.com/react-data-grid/cell-editing/) (✓ Free)',
            '### Excel export (✓ Enterprise)',
            '## How to build it',
            '## Frequently asked questions',
            '### Is AG Grid free?',
            '## Get started',
            '### Try AG Grid with your own data',
            '## Related pages',
            '### Use cases',
            '## Sources',
        ]);
    });

    test('renders the how-to steps and code, and lists each claim source', () => {
        const markdown = build();

        expect(markdown).toContain(
            [
                '1. **Make stock editable**: Set `editable` on the column.',
                '',
                '```tsx',
                'const columnDefs = [{ field: "stock", editable: true }];',
                '```',
                '',
                'See the [inventory demo](https://www.ag-grid.com/example-inventory/).',
            ].join('\n')
        );
        expect(markdown).toContain(
            '- <https://www.ag-grid.com/react-data-grid/row-models/> (checked 24 November 2026)'
        );
    });
});
