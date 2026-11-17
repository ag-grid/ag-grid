import { buildDecisionHubMarkdown } from './buildDecisionHubMarkdown';

describe('buildDecisionHubMarkdown', () => {
    test('lists every card with an absolute link and its description, under the hub heading', () => {
        const markdown = buildDecisionHubMarkdown({
            hub: {
                title: 'Compare AG Grid',
                description: 'How AG Grid compares.',
                heading: 'Compare AG Grid with other data grids',
                subHeading: 'Feature-by-feature comparisons.',
                listHeading: 'Comparisons',
            },
            cards: [
                {
                    title: 'AG Grid vs TanStack Table',
                    description: 'A full grid UI against a headless library.',
                    url: '/compare/ag-grid-vs-tanstack-table/',
                },
            ],
            site: { resolveUrl: (url) => url },
            siteRoot: 'https://www.ag-grid.com/',
        });

        expect(markdown).toBe(
            [
                '---',
                'title: "Compare AG Grid"',
                'description: "How AG Grid compares."',
                '---',
                '',
                '# Compare AG Grid with other data grids',
                '',
                'Feature-by-feature comparisons.',
                '',
                '## Comparisons',
                '',
                '- [AG Grid vs TanStack Table](https://www.ag-grid.com/compare/ag-grid-vs-tanstack-table/): A full grid UI against a headless library.',
                '',
            ].join('\n')
        );
    });
});
