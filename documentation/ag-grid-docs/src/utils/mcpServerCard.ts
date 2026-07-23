/**
 * Builder for the machine-readable MCP discovery card served at
 * `/.well-known/mcp/server-card.json` (SE-79). An autonomous agent that probes
 * the well-known location learns the ag-mcp server exists without prior
 * knowledge, and gets the exact launch command to configure it.
 *
 * Like the agent-readiness files (see agentReadinessFiles.ts, SE-77), the card
 * is generated from the canonical base URL, so the documentation link cannot
 * drift from the shipped site. The human-facing docs page stays the canonical
 * reference; this card just points at it and names the entry point.
 */

interface McpServerCardInput {
    /** Canonical site root with a trailing slash, e.g. `https://www.ag-grid.com/`. */
    siteRoot: string;
    /**
     * Framework segment used for the grid doc links, e.g. `javascript-data-grid`.
     * JavaScript is the framework-agnostic core, so it is the natural canonical
     * entry point.
     */
    gridDocsPrefix: string;
}

/**
 * Build the `/.well-known/mcp/server-card.json` body: a description of the
 * ag-mcp server, its npm package and stdio launch command, plus an
 * `mcpServers` block a client can drop straight into its MCP config.
 */
export function buildMcpServerCard({ siteRoot, gridDocsPrefix }: McpServerCardInput): string {
    const docsUrl = `${siteRoot}${gridDocsPrefix}/mcp-server/`;

    const card = {
        name: 'ag-mcp',
        title: 'AG Grid MCP Server',
        description:
            'Version-aware AG Grid documentation, examples and API reference for AI coding assistants, returned as condensed markdown. Detects the AG Grid version and framework in your project so generated code targets the correct API.',
        homepage: docsUrl,
        documentation: docsUrl,
        repository: {
            url: 'https://github.com/ag-grid/ag-mcp',
            source: 'github',
        },
        // The ag-mcp server installs and runs locally over stdio; there is no
        // hosted remote endpoint. This is the current entry point.
        packages: [
            {
                registry: 'npm',
                name: 'ag-mcp',
                command: 'npx',
                args: ['ag-mcp'],
                transport: 'stdio',
            },
        ],
        // Ready to drop into an MCP client config (the shape every client consumes).
        mcpServers: {
            'ag-mcp': {
                command: 'npx',
                args: ['ag-mcp'],
                type: 'stdio',
            },
        },
    };

    return `${JSON.stringify(card, null, 2)}\n`;
}
