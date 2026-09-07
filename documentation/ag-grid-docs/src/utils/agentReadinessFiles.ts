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

/** A named group of links in the `llms.txt` page index, e.g. `Core Features > Editing`. */
export interface LlmsTxtSection {
    title: string;
    links: Array<{ title: string; url: string }>;
}

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
    /**
     * Whether per-page `.md` routes are generated. When false (the
     * `DISABLE_MARKDOWN_DOCS` build flag), the llms.txt must not advertise the
     * `.md` convention or it would point agents at 404s. Defaults to true.
     */
    includeMarkdownDocs?: boolean;
    /**
     * The complete page index published below the curated sections: the docs nav flattened into
     * its groups, then everything else grouped as the sitemap groups it. Optional, so the
     * curated head of the file still builds without a nav or a sitemap to hand.
     */
    docsIndex?: LlmsTxtSection[];
    siteIndex?: LlmsTxtSection[];
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
    pipeline: string;
    sitemap: string;
    llmsTxt: string;
    /** The homepage twin, which is `index.md` rather than a `.md` suffix on the site root. */
    homepageMarkdown: string;
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
        pipeline: `${siteRoot}pipeline/`,
        sitemap: `${siteRoot}sitemap-index.xml`,
        llmsTxt: `${siteRoot}llms.txt`,
        homepageMarkdown: `${siteRoot}index.md`,
    };
}

/** Render one index group as an `###` heading over its links, or nothing when it is empty. */
function renderIndexSection({ title, links }: LlmsTxtSection): string {
    if (!links.length) {
        return '';
    }
    return [`### ${title}`, ...links.map((link) => `- [${link.title}](${link.url})`)].join('\n');
}

function renderIndex(sections: LlmsTxtSection[] = []): string {
    return sections.map(renderIndexSection).filter(Boolean).join('\n\n');
}

/**
 * Build the `/llms.txt` body: an H1 with the product name, a one-line summary, short curated
 * sections of markdown links to the key pages (the llms.txt format), then the complete page
 * index — the docs in nav order, then the rest of the site.
 */
export function buildLlmsTxt(input: AgentReadinessInput): string {
    const l = buildLinks(input);
    const docsIndex = renderIndex(input.docsIndex);
    const siteIndex = renderIndex(input.siteIndex);
    // The docs exist once per framework, so listing all four would quadruple the file for no new
    // information. Publish the framework-agnostic JavaScript URL and state the substitution.
    const anyFrameworkPrefix = input.gridDocsPrefix.replace(/^[a-z]+/, '<framework>');
    const docsIndexSection = docsIndex
        ? [
              '',
              '## Documentation',
              'Every documentation page, in navigation order. Each URL is the framework-agnostic' +
                  ` JavaScript one; replace \`${input.gridDocsPrefix}\` with \`${anyFrameworkPrefix}\`` +
                  ' (`react`, `angular` or `vue`) for the framework-specific page.',
              '',
              `${docsIndex}\n`,
          ].join('\n')
        : '';
    const siteIndexSection = siteIndex ? ['', '## Site pages', '', `${siteIndex}\n`].join('\n') : '';
    // Only advertise the `.md` convention when those routes are actually built. Every page
    // in the sitemap has a twin (enforced by the post-build check in markdownPages.test.ts),
    // so this states the rule rather than enumerating pages that would drift out of date.
    const markdownLine =
        input.includeMarkdownDocs === false
            ? ''
            : `\n- Markdown versions: append \`.md\` to any page URL listed in the sitemap for a clean Markdown copy (e.g. ${l.dataGridDocs.replace(/\/$/, '')}.md), or send \`Accept: text/markdown\`. Docs pages are resolved for the framework in the URL. The homepage is the one URL with no \`.md\` suffix - its copy is ${l.homepageMarkdown}.`;
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
- [MCP server](${l.mcpServer}): ag-mcp - version-aware docs, examples and API for AI coding assistants${markdownLine}

## Optional
- [Pricing](${l.pricing}): Community (free) vs Enterprise
- [Changelog](${l.changelog}): features and fixes by version
- [Pipeline](${l.pipeline}): roadmap and backlog of upcoming features and fixes
- [Sitemap](${l.sitemap}): full list of indexable pages
${docsIndexSection}${siteIndexSection}`;
}

/**
 * Build the `/AGENTS.md` body: a plain-language companion for coding agents,
 * covering what AG Grid is, how to install it, and where to find current docs.
 */
export function buildAgentsMd(input: AgentReadinessInput): string {
    const l = buildLinks(input);
    // Advertise the markdown twins only when they are built (see includeMarkdownDocs).
    // Every page in the sitemap has one, so state the rule rather than listing pages.
    const markdownBullet =
        input.includeMarkdownDocs === false
            ? ''
            : `\n- **Markdown for LLMs:** append \`.md\` to any page URL listed in the [sitemap](${l.sitemap}) (e.g. ${l.dataGridDocs.replace(/\/$/, '')}.md), or request the page with \`Accept: text/markdown\`. Docs pages are resolved for the framework in the URL. The homepage is the one URL with no \`.md\` suffix - its copy is ${l.homepageMarkdown}.`;
    return `# AG Grid - guide for AI coding assistants

- **What it is:** JavaScript Data Grid, plus [AG Charts](${l.charts}) and [AG Studio](${l.studio}). Framework-agnostic, with React, Angular and Vue wrappers. Community (free) and Enterprise (licensed) editions.
- **Current version:** v${input.majorVersion}. APIs change across majors, and the MCP server is version-aware - always check the version before generating code.
- **Install:** \`npm i ag-grid-community\` (or \`ag-grid-enterprise\`), plus the framework wrapper - \`ag-grid-react\`, \`ag-grid-angular\` or \`ag-grid-vue3\`. JavaScript needs no wrapper.
- **MCP server:** \`ag-mcp\` (\`npx ag-mcp\`) returns version-specific docs, examples and API in condensed markdown. Point your assistant at it for current, correct code - see [the MCP server docs](${l.mcpServer}).
- **Where to look:** [Data Grid docs](${l.dataGridDocs}), [API reference](${l.dataGridReference}), [examples](${l.examples}) and the [changelog](${l.changelog}).
- **Common tasks:** "create a grid", "define column definitions", "enable sorting and filtering", "server-side row model" - each has a canonical example in the docs and via the MCP server.${markdownBullet}

Machine-readable index: [llms.txt](${l.llmsTxt}).
`;
}
