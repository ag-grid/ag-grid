import { buildAgentsMd, buildLlmsTxt } from './agentReadinessFiles';

const INPUT = {
    siteRoot: 'https://www.ag-grid.com/',
    majorVersion: 34,
    gridDocsPrefix: 'javascript-data-grid',
};

describe('buildLlmsTxt', () => {
    const txt = buildLlmsTxt(INPUT);

    test('opens with the AG Grid H1 and a one-line summary', () => {
        expect(txt.startsWith('# AG Grid\n> ')).toBe(true);
    });

    test('states the current major version', () => {
        expect(txt).toContain('v34');
    });

    test('links the products, docs, MCP server and sitemap (acceptance criteria)', () => {
        expect(txt).toContain('(https://www.ag-grid.com/javascript-data-grid/)');
        expect(txt).toContain('(https://www.ag-grid.com/charts/)');
        expect(txt).toContain('(https://www.ag-grid.com/studio/)');
        expect(txt).toContain('(https://www.ag-grid.com/javascript-data-grid/getting-started/)');
        expect(txt).toContain('(https://www.ag-grid.com/javascript-data-grid/mcp-server/)');
        expect(txt).toContain('(https://www.ag-grid.com/sitemap-index.xml)');
    });

    test('advertises the markdown (.md) convention as a site-wide rule, not a page list', () => {
        expect(txt).toContain('.md');
        expect(txt).toContain('https://www.ag-grid.com/javascript-data-grid/getting-started.md');
        // Every page in the sitemap has a twin, so llms.txt states the rule. Enumerating
        // pages here would drift the moment one is added (see markdownPages.test.ts).
        expect(txt).toContain('append `.md` to any page URL listed in the sitemap');
        expect(txt).toContain('Accept: text/markdown');
    });

    test('points at index.md for the homepage, whose twin is not a `.md` suffix', () => {
        expect(txt).toContain('https://www.ag-grid.com/index.md');
    });

    test('lists the pipeline page', () => {
        expect(txt).toContain('(https://www.ag-grid.com/pipeline/)');
    });

    test('omits the markdown convention when markdown docs are disabled', () => {
        const disabled = buildLlmsTxt({ ...INPUT, includeMarkdownDocs: false });
        expect(disabled).not.toContain('.md');
        expect(disabled).not.toContain('Markdown versions');
    });

    test('derives every link from the canonical base (no other host)', () => {
        const urls = txt.match(/\(https?:\/\/[^)]+\)/g) ?? [];
        expect(urls.length).toBeGreaterThan(0);
        expect(urls.every((u) => u.startsWith('(https://www.ag-grid.com/'))).toBe(true);
    });

    describe('page index', () => {
        const DOCS_INDEX = [
            {
                title: 'Core Features > Editing',
                links: [
                    { title: 'Cell Editing', url: 'https://www.ag-grid.com/javascript-data-grid/cell-editing/' },
                    { title: 'Cell Editors', url: 'https://www.ag-grid.com/javascript-data-grid/cell-editors/' },
                ],
            },
        ];
        const SITE_INDEX = [{ title: 'General', links: [{ title: 'About', url: 'https://www.ag-grid.com/about/' }] }];
        const indexed = buildLlmsTxt({ ...INPUT, docsIndex: DOCS_INDEX, siteIndex: SITE_INDEX });

        test('publishes the docs under their navigation groups, in the order given', () => {
            expect(indexed).toContain('## Documentation');
            expect(indexed).toContain(
                [
                    '### Core Features > Editing',
                    '- [Cell Editing](https://www.ag-grid.com/javascript-data-grid/cell-editing/)',
                    '- [Cell Editors](https://www.ag-grid.com/javascript-data-grid/cell-editors/)',
                ].join('\n')
            );
        });

        test('states the framework substitution instead of repeating the docs four times', () => {
            expect(indexed).toContain('replace `javascript-data-grid` with `<framework>-data-grid`');
            expect(indexed).not.toContain('react-data-grid/cell-editing');
        });

        test('publishes the rest of the site under its sitemap groups', () => {
            expect(indexed).toContain('## Site pages');
            expect(indexed).toContain('### General\n- [About](https://www.ag-grid.com/about/)');
        });

        test('keeps the curated sections above the index', () => {
            expect(indexed.indexOf('## Products')).toBeLessThan(indexed.indexOf('## Documentation'));
            expect(indexed.indexOf('## Optional')).toBeLessThan(indexed.indexOf('## Documentation'));
            expect(indexed.indexOf('## Documentation')).toBeLessThan(indexed.indexOf('## Site pages'));
        });

        test('emits no index headings when there is nothing to index', () => {
            expect(txt).not.toContain('## Documentation');
            expect(txt).not.toContain('## Site pages');
            expect(buildLlmsTxt({ ...INPUT, docsIndex: [], siteIndex: [] })).toBe(txt);
        });
    });
});

describe('buildAgentsMd', () => {
    const md = buildAgentsMd(INPUT);

    test('opens with the coding-assistant guide heading', () => {
        expect(md.startsWith('# AG Grid - guide for AI coding assistants')).toBe(true);
    });

    test('states the major version and points at the MCP server and llms.txt', () => {
        expect(md).toContain('v34');
        expect(md).toContain('npx ag-mcp');
        expect(md).toContain('https://www.ag-grid.com/javascript-data-grid/mcp-server/');
        expect(md).toContain('https://www.ag-grid.com/llms.txt');
    });

    test('advertises the markdown (.md) versions as a site-wide rule', () => {
        expect(md).toContain('Markdown for LLMs');
        expect(md).toContain('https://www.ag-grid.com/javascript-data-grid/getting-started.md');
        // Every page in the sitemap has a twin, so point at the sitemap rather than
        // listing pages that would drift (see markdownPages.test.ts for the guarantee).
        expect(md).toContain('append `.md` to any page URL listed in the');
        expect(md).toContain('[sitemap](https://www.ag-grid.com/sitemap-index.xml)');
    });

    test('points at index.md for the homepage, whose twin is not a `.md` suffix', () => {
        expect(md).toContain('https://www.ag-grid.com/index.md');
    });

    test('omits the markdown affordance when markdown docs are disabled', () => {
        const disabled = buildAgentsMd({ ...INPUT, includeMarkdownDocs: false });
        expect(disabled).not.toContain('.md');
        expect(disabled).not.toContain('Markdown for LLMs');
    });
});
