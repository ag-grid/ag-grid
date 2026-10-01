import { finding } from './lifecycle';

/**
 * The agent-facing files per site. `curated` sections are the hand-written pointers at the top
 * of each llms.txt; every link in them (and in AGENTS.md) is checked. The `index` sections list
 * every page (~850 links across the three sites), so only a deterministic sample is checked by
 * default - `--full-links` checks all of them.
 */
export interface AgentSite {
    id: 'grid' | 'charts' | 'studio';
    llms: string;
    agents: string;
    curated: string[];
    index: string[];
    /** A phrase each AGENTS.md must contain. */
    agentsMustMention: string[];
}

export const AGENT_SITES: AgentSite[] = [
    {
        id: 'grid',
        llms: 'https://www.ag-grid.com/llms.txt',
        agents: 'https://www.ag-grid.com/AGENTS.md',
        curated: ['', 'Products', 'Docs and tools', 'Optional'],
        index: ['Documentation', 'Site pages'],
        agentsMustMention: ['ag-mcp', 'llms.txt'],
    },
    {
        id: 'charts',
        llms: 'https://www.ag-grid.com/charts/llms.txt',
        agents: 'https://www.ag-grid.com/charts/AGENTS.md',
        curated: ['', 'Docs and tools', 'Optional'],
        index: ['Documentation', 'Site pages'],
        agentsMustMention: ['llms.txt'],
    },
    {
        id: 'studio',
        llms: 'https://www.ag-grid.com/studio/llms.txt',
        agents: 'https://www.ag-grid.com/studio/AGENTS.md',
        curated: ['', 'Docs and tools', 'Optional'],
        index: ['Documentation', 'Site pages'],
        agentsMustMention: ['llms.txt'],
    },
];

/** Links (or .md twins) known to be broken, reported as known issues rather than failures. */
export const KNOWN_BROKEN: Record<string, string> = {
    'https://www.ag-grid.com/charts/javascript/options/': `${finding(13)} (charts agentReadinessFiles.ts:61)`,
};

/** Advertised links deliberately not checked at all (decided, not defects). */
export const IGNORED_LINKS = new Set<string>([
    // Accepted as a 404 (2026-10-01): not a check and not a known issue.
    'https://www.ag-grid.com/studio/pipeline.md',
]);

/** Links from the index sections checked per file by default. */
export const INDEX_SAMPLE_SIZE = 2;
/** Curated page links per file whose .md twin is checked by default. */
export const TWIN_SAMPLE_SIZE = 4;

export const SERVER_CARD = {
    url: 'https://www.ag-grid.com/.well-known/mcp/server-card.json',
    name: 'ag-mcp',
    title: 'AG Grid MCP Server',
    docs: 'https://www.ag-grid.com/javascript-data-grid/mcp-server/',
    repository: 'https://github.com/ag-grid/ag-mcp',
    package: { registry: 'npm', name: 'ag-mcp', command: 'npx', args: ['ag-mcp'], transport: 'stdio' },
    mcpServers: { 'ag-mcp': { command: 'npx', args: ['ag-mcp'], type: 'stdio' } },
};

/** A rebuilt archive's llms.txt should point inside the archive, not at the current docs. */
export const ARCHIVE_LLMS = {
    url: 'https://www.ag-grid.com/archive/36.2.0/llms.txt',
    base: 'https://www.ag-grid.com/archive/36.2.0/',
};
