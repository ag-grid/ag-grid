/**
 * Builders for the agent-readiness files served at the site root: `/llms.txt`
 * (the llms.txt convention) and `/AGENTS.md` (a plain-language companion for
 * AI coding assistants). See SE-77.
 *
 * Both are generated from live inputs - the canonical base URL and the current
 * major version - so they regenerate on every build and cannot drift from the
 * shipped product. The curated link set is assembled from the same canonical
 * base, so changing the host updates every link.
 */

interface AgentReadinessInput {
    /** Canonical site root with a trailing slash, e.g. `https://www.ag-grid.com/`. */
    siteRoot: string;
    /** Current major version, e.g. `34`. */
    majorVersion: number;
    /**
     * Framework segment used for the grid doc links, e.g. `javascript-data-grid`.
     * JavaScript is the framework-agnostic core, so it is the natural canonical
     * entry point for an LLM-facing guide.
     */
    gridDocsPrefix: string;
}

interface AgentReadinessLinks {
    dataGrid: string;
    charts: string;
    studio: string;
    dataGridDocs: string;
    dataGridReference: string;
    chartsDocs: string;
    examples: string;
    mcpServer: string;
    pricing: string;
    changelog: string;
    sitemap: string;
    llmsTxt: string;
}

function buildLinks({ siteRoot, gridDocsPrefix }: AgentReadinessInput): AgentReadinessLinks {
    const grid = `${siteRoot}${gridDocsPrefix}/`;
    return {
        dataGrid: grid,
        charts: `${siteRoot}charts/`,
        studio: `${siteRoot}studio/`,
        dataGridDocs: `${grid}getting-started/`,
        dataGridReference: `${grid}reference/`,
        chartsDocs: `${siteRoot}charts/javascript/quick-start/`,
        examples: `${siteRoot}example/`,
        mcpServer: `${grid}mcp-server/`,
        pricing: `${siteRoot}license-pricing/`,
        changelog: `${siteRoot}changelog/`,
        sitemap: `${siteRoot}sitemap-index.xml`,
        llmsTxt: `${siteRoot}llms.txt`,
    };
}

/**
 * Build the `/llms.txt` body: an H1 with the product name, a one-line summary,
 * then short sections of markdown links to the key pages (the llms.txt format).
 */
export function buildLlmsTxt(input: AgentReadinessInput): string {
    const l = buildLinks(input);
    return `# AG Grid
> High-performance JavaScript Data Grid, plus AG Charts and AG Studio. Framework-agnostic, with React, Angular and Vue support. Free Community and paid Enterprise editions. Current major version: v${input.majorVersion}.

## Products
- [Data Grid](${l.dataGrid}): high-performance JavaScript Data Grid for React, Angular, Vue and JavaScript
- [Charts](${l.charts}): AG Charts, the integrated and standalone charting library
- [Studio](${l.studio}): AG Studio, visual configuration for AG Grid

## Docs and tools
- [Data Grid docs](${l.dataGridDocs}): getting started, guides and concepts
- [Data Grid API reference](${l.dataGridReference}): complete grid options and API
- [Charts docs](${l.chartsDocs}): AG Charts quick start
- [Examples](${l.examples}): live, runnable demos
- [MCP server](${l.mcpServer}): ag-mcp - version-aware docs, examples and API for AI coding assistants

## Optional
- [Pricing](${l.pricing}): Community (free) vs Enterprise
- [Changelog](${l.changelog}): features and fixes by version
- [Sitemap](${l.sitemap}): full list of indexable pages
`;
}

/**
 * Build the `/AGENTS.md` body: a plain-language companion for coding agents,
 * covering what AG Grid is, how to install it, and where to find current docs.
 */
export function buildAgentsMd(input: AgentReadinessInput): string {
    const l = buildLinks(input);
    return `# AG Grid - guide for AI coding assistants

- **What it is:** JavaScript Data Grid, plus [AG Charts](${l.charts}) and [AG Studio](${l.studio}). Framework-agnostic, with React, Angular and Vue wrappers. Community (free) and Enterprise (licensed) editions.
- **Current version:** v${input.majorVersion}. APIs change across majors, and the MCP server is version-aware - always check the version before generating code.
- **Install:** \`npm i ag-grid-community\` (or \`ag-grid-enterprise\`), plus the framework wrapper - \`ag-grid-react\`, \`ag-grid-angular\` or \`ag-grid-vue3\`. JavaScript needs no wrapper.
- **MCP server:** \`ag-mcp\` (\`npx ag-mcp\`) returns version-specific docs, examples and API in condensed markdown. Point your assistant at it for current, correct code - see [the MCP server docs](${l.mcpServer}).
- **Where to look:** [Data Grid docs](${l.dataGridDocs}), [API reference](${l.dataGridReference}), [examples](${l.examples}) and the [changelog](${l.changelog}).
- **Common tasks:** "create a grid", "define column definitions", "enable sorting and filtering", "server-side row model" - each has a canonical example in the docs and via the MCP server.

Machine-readable index: [llms.txt](${l.llmsTxt}).
`;
}
