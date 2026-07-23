import { buildMcpServerCard } from './mcpServerCard';

const INPUT = {
    siteRoot: 'https://www.ag-grid.com/',
    gridDocsPrefix: 'javascript-data-grid',
};

describe('buildMcpServerCard', () => {
    const json = buildMcpServerCard(INPUT);
    const card = JSON.parse(json);

    test('is valid JSON ending in a trailing newline', () => {
        expect(json.endsWith('\n')).toBe(true);
        expect(typeof card).toBe('object');
    });

    test('names the ag-mcp server', () => {
        expect(card.name).toBe('ag-mcp');
        expect(card.title).toBe('AG Grid MCP Server');
    });

    test('points documentation at the canonical MCP server docs page', () => {
        expect(card.documentation).toBe('https://www.ag-grid.com/javascript-data-grid/mcp-server/');
        expect(card.homepage).toBe('https://www.ag-grid.com/javascript-data-grid/mcp-server/');
    });

    test('links the ag-mcp repository', () => {
        expect(card.repository.url).toBe('https://github.com/ag-grid/ag-mcp');
    });

    test('names the npm package and the stdio launch command (acceptance criteria)', () => {
        expect(card.packages).toHaveLength(1);
        const pkg = card.packages[0];
        expect(pkg.registry).toBe('npm');
        expect(pkg.name).toBe('ag-mcp');
        expect(pkg.command).toBe('npx');
        expect(pkg.args).toEqual(['ag-mcp']);
        expect(pkg.transport).toBe('stdio');
    });

    test('provides an mcpServers block a client can use directly', () => {
        expect(card.mcpServers['ag-mcp']).toEqual({
            command: 'npx',
            args: ['ag-mcp'],
            type: 'stdio',
        });
    });

    test('derives the docs link from the canonical base (no other host)', () => {
        const urls = json.match(/https?:\/\/[^"]+/g) ?? [];
        const agGridUrls = urls.filter((u) => u.includes('ag-grid.com'));
        expect(agGridUrls.length).toBeGreaterThan(0);
        expect(agGridUrls.every((u) => u.startsWith('https://www.ag-grid.com/'))).toBe(true);
    });
});
