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
});
