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

    test('advertises the per-page markdown (.md) convention and the top-level .md pages', () => {
        expect(txt).toContain('.md');
        expect(txt).toContain('https://www.ag-grid.com/javascript-data-grid/getting-started.md');
        expect(txt).toContain(
            'The Home, About, Community, Documentation Archive, Example, Pricing, Changelog and Pipeline pages also have `.md` versions'
        );
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

    test('advertises the markdown (.md) versions', () => {
        expect(md).toContain('Markdown for LLMs');
        expect(md).toContain('https://www.ag-grid.com/javascript-data-grid/getting-started.md');
        expect(md).toContain('https://www.ag-grid.com/pipeline/');
        // The new page twins are advertised with links.
        expect(md).toContain('[About](https://www.ag-grid.com/about/)');
        expect(md).toContain('[Community](https://www.ag-grid.com/community/)');
        expect(md).toContain('[Documentation Archive](https://www.ag-grid.com/documentation-archive/)');
    });

    test('omits the markdown affordance when markdown docs are disabled', () => {
        const disabled = buildAgentsMd({ ...INPUT, includeMarkdownDocs: false });
        expect(disabled).not.toContain('.md');
        expect(disabled).not.toContain('Markdown for LLMs');
    });
});
