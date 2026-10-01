import { buildAgentsMd, buildLlmsTxt } from './agentReadinessFiles';
import { getHtaccessContent } from './htaccess/htaccessRules';
import { compileHtaccess, route } from './htaccess/htaccessSimulator';
import { resolveRoute } from './pageRoutes.test-utils';
import { getSitemapConfig } from './sitemap';

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
        expect(txt).toContain('- [Data Grid](https://www.ag-grid.com/):');
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

// SE-77 / SE-80: an agent follows these links verbatim, so each one must be a URL the grid build
// emits (waf-finding.md §16 T8). Resolved against the route files and docs content, not a dist.
describe('curated links in llms.txt and AGENTS.md', () => {
    const SITE_ROOT = 'https://www.ag-grid.com';
    // Written by @astrojs/sitemap rather than a route file.
    const INTEGRATION_OUTPUTS = ['/sitemap-index.xml'];
    // Charts and studio are separate repos deployed under the same host, so their routes are not
    // visible here; their own broken agent-facing links are tracked in waf-finding.md §13.
    const isOtherSite = (pathname: string) => /^\/(charts|studio)(\/|$)/.test(pathname);

    const linkedPaths = (body: string) =>
        [...new Set(body.match(/https:\/\/www\.ag-grid\.com\/[^\s)\]`]*/g) ?? [])].map(
            (url) => new URL(url.replace(/[.,]$/, '')).pathname
        );

    const gridPaths = (body: string) => linkedPaths(body).filter((pathname) => !isOtherSite(pathname));
    const unindexedPages = (body: string) => {
        const { filter } = getSitemapConfig({});
        return gridPaths(body)
            .filter((pathname) => pathname.endsWith('/') && pathname !== '/')
            .filter((pathname) => !filter(`${SITE_ROOT}${pathname}`));
    };
    const LLMS_TXT = buildLlmsTxt(INPUT);
    const AGENTS_MD = buildAgentsMd(INPUT);

    test('the route oracle rejects pages the build does not emit', () => {
        expect(resolveRoute('/javascript-data-grid/getting-started/')).toBeDefined();
        expect(resolveRoute('/javascript-data-grid/no-such-page/')).toBeUndefined();
        expect(resolveRoute('/svelte-data-grid/getting-started/')).toBeUndefined();
        expect(resolveRoute('/no-such-page/')).toBeUndefined();
        // The JavaScript root has no landing hub, so no markdown twin.
        expect(resolveRoute('/react-data-grid.md')).toBeDefined();
        expect(resolveRoute('/javascript-data-grid.md')).toBeUndefined();
        // A page restricted by its `frameworks` frontmatter is built for those frameworks only.
        expect(resolveRoute('/react-data-grid/react-hooks/')).toBeDefined();
        expect(resolveRoute('/react-data-grid/react-hooks.md')).toBeDefined();
        expect(resolveRoute('/angular-data-grid/react-hooks/')).toBeUndefined();
        expect(resolveRoute('/angular-data-grid/react-hooks.md')).toBeUndefined();
        expect(resolveRoute('/vue-data-grid/vue3-script-setup/')).toBeDefined();
        expect(resolveRoute('/react-data-grid/vue3-script-setup/')).toBeUndefined();
    });

    describe.each([
        ['llms.txt', LLMS_TXT],
        ['AGENTS.md', AGENTS_MD],
    ])('%s', (_name, body) => {
        const paths = gridPaths(body);

        test('links into the grid site, so the checks below are not vacuous', () => {
            expect(paths.length).toBeGreaterThan(5);
        });

        test.each(paths)('%s is emitted by the grid build', (pathname) => {
            expect(INTEGRATION_OUTPUTS.includes(pathname) || resolveRoute(pathname) !== undefined).toBe(true);
        });
    });

    // waf-finding.md §20.3: the Data Grid link pointed at the JavaScript docs root, a client-side
    // forwarder with no sitemap entry and no markdown twin. Every page an agent is pointed at must
    // be one it can index and read as markdown, served without a redirect.
    describe.each([
        ['llms.txt', LLMS_TXT],
        ['AGENTS.md', AGENTS_MD],
    ])('%s links only real pages', (_name, body) => {
        const pages = gridPaths(body).filter((pathname) => pathname.endsWith('/'));
        const htaccess = [compileHtaccess(getHtaccessContent({ env: 'production' }))];

        test('links pages, so the checks below are not vacuous', () => {
            expect(pages.length).toBeGreaterThanOrEqual(5);
        });

        test('each has a sitemap entry, so none is a redirect stub', () => {
            expect(unindexedPages(body)).toEqual([]);
            expect(getSitemapConfig({}).filter(`${SITE_ROOT}/`)).toBe(true);
        });

        test.each(pages)('%s has a markdown twin', (pathname) => {
            expect(resolveRoute(pathname === '/' ? '/index.md' : `${pathname.replace(/\/$/, '')}.md`)).toBeDefined();
        });

        test.each(pages)('%s is served without a redirect', (pathname) => {
            expect(route(htaccess, { url: `${SITE_ROOT}${pathname}` })).toMatchObject({ type: 'serve' });
        });
    });
});
