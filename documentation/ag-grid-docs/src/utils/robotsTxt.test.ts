import { BUILD_USER_AGENT } from '@ag-website-shared/constants';
import { vi } from 'vitest';

import { AI_CRAWLERS, fetchRobotsDisallow, productionRobotsTxt } from './robotsTxt';
import { isAllowedByRobots, parseRobotsTxt } from './robotsTxt.test-utils';
import { getSitemapAllowPaths, getSitemapIgnorePaths } from './sitemapPages';

// The disallow lists the charts and studio sites publish as robots-disallow.json, mirrored from
// their getSitemapIgnorePaths (production base URLs). The root robots.txt is the only one crawlers
// read, so these rules are evaluated here alongside grid's own.
const CHARTS_DISALLOWS = [
    '/charts/*/*/examples/',
    '/charts/*/*-e2e/',
    '/charts/gallery-test',
    '/charts/*/benchmarks/',
    '/charts/internal-demos/',
    '/charts/debug/docs-example-files',
    '/charts/debug/docs-examples',
    '/charts/debug/gallery-example-files',
    '/charts/debug/gallery-examples',
    '/charts/404',
    '/charts/gallery/examples/',
    '/charts/archive/',
    '/charts/changelog/releases/',
    '/charts/contact/failure/',
    '/charts/contact/success/',
];
const STUDIO_DISALLOWS = [
    '/studio/debug/',
    '/studio/examples/',
    '/studio/archive/',
    '/studio/changelog/releases/',
    '/studio/*/*-test/',
    '/studio/404',
];

// The same inputs the robots.txt route feeds the generator in production.
const ALLOW_PATHS = await getSitemapAllowPaths();
const DISALLOW_PATHS = [...(await getSitemapIgnorePaths()), ...CHARTS_DISALLOWS, ...STUDIO_DISALLOWS];

const txt = productionRobotsTxt(ALLOW_PATHS, DISALLOW_PATHS);
const robots = parseRobotsTxt(txt);

// Crawlers with no group of their own, so they read `User-agent: *`. Amazonbot is deliberately
// left there (SE-191: accept its load rather than Disallow it).
const SEARCH_AGENTS = ['Googlebot', 'Bingbot', 'GoogleOther', 'Amazonbot', 'SomeUnknownBot'];

type Verdict = 'allow' | 'block';
const verdict = (agent: string, path: string): Verdict => (isAllowedByRobots(robots, agent, path) ? 'allow' : 'block');

/** `/react-data-grid/cell-editing/` → `/react-data-grid/cell-editing.md`, the page's markdown twin. */
const markdownTwin = (page: string) => `${page.replace(/\/$/, '')}.md`;

describe('robots.txt evaluator (RFC 9309), the oracle the tests below rely on', () => {
    const sample = parseRobotsTxt(
        [
            'User-agent: *',
            'Disallow: /private/',
            'Allow: /private/open',
            'Disallow: /*.pdf$',
            'Disallow: /tie',
            'Allow: /tie',
            'Disallow: /caf%C3%A9/',
            '',
            'User-agent: NamedBot',
            'Disallow: /named-only/',
        ].join('\n')
    );
    const allowed = (agent: string, path: string) => isAllowedByRobots(sample, agent, path);

    test('the longest matching rule wins, regardless of order', () => {
        expect(allowed('x', '/private/secret')).toBe(false);
        expect(allowed('x', '/private/open/page')).toBe(true);
    });

    test('Allow wins a tie of equal length', () => {
        expect(allowed('x', '/tie')).toBe(true);
    });

    test('`*` matches any run of characters and `$` anchors the end', () => {
        expect(allowed('x', '/docs/file.pdf')).toBe(false);
        expect(allowed('x', '/docs/file.pdf?download=1')).toBe(true);
    });

    test('percent-encoding is normalised on both sides', () => {
        expect(allowed('x', '/café/menu')).toBe(false);
        expect(allowed('x', '/caf%c3%a9/menu')).toBe(false);
    });

    test('a named group replaces the wildcard group rather than inheriting from it', () => {
        expect(allowed('NamedBot', '/private/secret')).toBe(true);
        expect(allowed('NamedBot', '/named-only/')).toBe(false);
        expect(allowed('namedbot', '/named-only/')).toBe(false);
    });

    test('/robots.txt itself is always allowed', () => {
        expect(isAllowedByRobots(parseRobotsTxt('User-agent: *\nDisallow: /'), 'x', '/robots.txt')).toBe(true);
    });
});

describe('productionRobotsTxt — which rule wins for each URL', () => {
    // [path, verdict for search engines (`*`), verdict for the named AI crawlers]
    const MATRIX: Array<[string, Verdict, Verdict]> = [
        // Real content is open to everyone, including its markdown twin (SE-80).
        ['/', 'allow', 'allow'],
        ['/index.md', 'allow', 'allow'],
        ['/react-data-grid/getting-started/', 'allow', 'allow'],
        ['/react-data-grid/getting-started.md', 'allow', 'allow'],
        ['/javascript-data-grid/', 'allow', 'allow'],
        ['/data-grid/getting-started/', 'allow', 'allow'],
        ['/about/', 'allow', 'allow'],
        ['/documentation-archive/', 'allow', 'allow'],
        ['/charts/', 'allow', 'allow'],
        ['/charts/react/quick-start/', 'allow', 'allow'],
        ['/studio/', 'allow', 'allow'],
        ['/llms.txt', 'allow', 'allow'],
        ['/robots.txt', 'allow', 'allow'],

        // SE-78 / RTI-3476: public examples are closed to search but opened to AI.
        ['/examples/cell-editing/basic/reactFunctional/', 'block', 'allow'],
        ['/charts/react/line-series/examples/basic/', 'block', 'allow'],
        ['/charts/gallery/examples/line/', 'block', 'allow'],
        ['/studio/examples/basic/', 'block', 'allow'],
        // Internal example fixtures stay closed to everyone.
        ['/charts/debug/docs-examples', 'block', 'block'],
        ['/charts/debug/gallery-example-files/line/', 'block', 'block'],
        ['/debug/docs-examples/', 'block', 'block'],

        // SE-78 / RTI-3476: versioned archives are closed to search but opened to AI.
        ['/archive/36.2.0/', 'block', 'allow'],
        ['/archive/36.2.0/react-data-grid/getting-started/', 'block', 'allow'],
        ['/archive/36.2.0/react-data-grid/getting-started.md', 'block', 'allow'],
        ['/charts/archive/12.0.0/react/quick-start/', 'block', 'allow'],
        ['/studio/archive/1.0.0/', 'block', 'allow'],
        // SE-182 (waf-finding.md §12): the bare archive roots 301 to the documentation archive, so
        // they must be crawlable for the redirect to be seen. Only the exact root: a query string
        // or anything below it is still an archived page.
        ['/archive/', 'allow', 'allow'],
        ['/charts/archive/', 'allow', 'allow'],
        ['/archive/?utm_source=x', 'block', 'allow'],
        ['/archive/index.html', 'block', 'allow'],
        // Studio's root returns 403 today rather than redirecting, so it is not opened (§12).
        ['/studio/archive/', 'block', 'allow'],

        // Test, debug, error and post-submission pages are closed to everyone, twins included.
        ['/react-data-grid/cell-editing-batch-test/', 'block', 'block'],
        ['/react-data-grid/cell-editing-batch-test.md', 'block', 'block'],
        ['/react-data-grid/cell-editing-batch-test.md?utm_source=x', 'block', 'block'],
        ['/studio/react/autosave-test/', 'block', 'block'],
        ['/studio/react/autosave-test.md', 'block', 'block'],
        ['/charts/react/selection-e2e/', 'block', 'block'],
        ['/charts/react/benchmarks/', 'block', 'block'],
        ['/charts/react/benchmarks.md', 'block', 'block'],
        ['/charts/gallery-test/', 'block', 'block'],
        ['/charts/internal-demos/sparklines/', 'block', 'block'],
        ['/404', 'block', 'block'],
        ['/404/', 'block', 'block'],
        ['/charts/404', 'block', 'block'],
        ['/privacy/your-choice/', 'block', 'block'],
        ['/charts/contact/success/', 'block', 'block'],
        ['/changelog/releases/35-0-0/', 'block', 'block'],

        // Partner campaigns: only the Bryntum pages (and their twins) are open.
        ['/campaigns/power-of-ag-charts/', 'block', 'block'],
        ['/campaigns/bryntum-gantt/', 'allow', 'allow'],
        ['/campaigns/bryntum-gantt.md', 'allow', 'allow'],
        ['/campaigns/bryntum-gantt.md?utm_source=x', 'allow', 'allow'],
        ['/campaigns/bryntum-scheduler-pro/', 'allow', 'allow'],

        // SE-183: search-result variants are crawl waste, for every group.
        ['/changelog/?searchQuery=filter', 'block', 'block'],
        ['/pipeline/?foo=1&searchQuery=filter', 'block', 'block'],
        ['/changelog/', 'allow', 'allow'],

        // SE-89: the blog stays crawlable so its migration 301s are seen; only Ghost's internal
        // endpoints are closed.
        ['/blog/', 'allow', 'allow'],
        ['/blog/some-post/', 'allow', 'allow'],
        ['/blog/tag/react/', 'allow', 'allow'],
        ['/blog/ghost/', 'block', 'block'],
        ['/blog/ghost/api/admin/posts/', 'block', 'block'],
        ['/blog/email/abc/', 'block', 'block'],
        ['/blog/members/api/member/', 'block', 'block'],
        ['/blog/r/abc123', 'block', 'block'],
        ['/blog/webmentions/receive/', 'block', 'block'],
        ['/blog/.ghost/analytics/api/x', 'block', 'block'],
    ];

    test.each(MATRIX)('%s — search: %s, AI: %s', (path, search, ai) => {
        for (const agent of SEARCH_AGENTS) {
            expect(verdict(agent, path), agent).toBe(search);
        }
        for (const agent of AI_CRAWLERS) {
            expect(verdict(agent, path), agent).toBe(ai);
        }
    });

    // waf-finding.md §11: a Disallow written for `<page>/` does not match `<page>.md`, so the
    // twin of a blocked page stayed crawlable. A page and its twin must always share a verdict.
    // Ghost's endpoints and the archive-root redirects serve no markdown, so have no twin to check.
    const TWINLESS = ['/', '/archive/', '/charts/archive/', '/studio/archive/'];
    const PAGES = MATRIX.map(([path]) => path).filter(
        (path) => path.endsWith('/') && !TWINLESS.includes(path) && !path.startsWith('/blog/')
    );
    test.each(PAGES)('%s and its .md twin get the same verdict for every crawler', (page) => {
        for (const agent of [...SEARCH_AGENTS, ...AI_CRAWLERS]) {
            expect(verdict(agent, markdownTwin(page)), agent).toBe(verdict(agent, page));
        }
    });

    // Robots rules match the path plus query, so a twin rule anchored with `$` alone would leave
    // `<page>.md?utm_source=x` on the opposite verdict to `<page>/?utm_source=x`. Every twin rule
    // the file emits is checked, with each `*` instantiated, bare and with a query string.
    const TWIN_RULE_PAGES = [
        ...new Set(
            txt
                .split('\n')
                .map((line) => /^(?:Allow|Disallow): (.*)\.md\$$/.exec(line)?.[1])
                .filter((base): base is string => base !== undefined)
                .map((base) => `${base.replaceAll('*', 'react')}/`)
        ),
    ];
    test('every twin rule is checked', () => {
        expect(TWIN_RULE_PAGES).toEqual(
            expect.arrayContaining(['/campaigns/bryntum-gantt/', '/react-data-grid/react-test/', '/archive/'])
        );
    });
    test.each(TWIN_RULE_PAGES.flatMap((page) => [page, `${page}child/`]))(
        '%s and its .md twin share a verdict with and without a query string',
        (page) => {
            // The archive roots are opened as exact redirect sources and have no twin of their own.
            const queries = TWINLESS.includes(page) ? ['?utm_source=x', '?'] : ['', '?utm_source=x', '?'];
            for (const agent of [...SEARCH_AGENTS, ...AI_CRAWLERS]) {
                for (const query of queries) {
                    expect(verdict(agent, `${markdownTwin(page)}${query}`), `${agent} ${query}`).toBe(
                        verdict(agent, `${page}${query}`)
                    );
                }
            }
        }
    );

    test('twin rules reach only the twin, not other paths sharing its prefix', () => {
        expect(verdict('Googlebot', '/campaigns/bryntum-gantt.mdx')).toBe('block');
        expect(verdict('Googlebot', '/campaigns/bryntum-gantt.md/')).toBe('block');
    });

    test('AI crawlers are matched case-insensitively', () => {
        expect(verdict('gptbot', '/examples/cell-editing/basic/reactFunctional/')).toBe('allow');
        expect(verdict('CLAUDEBOT', '/archive/36.2.0/')).toBe('allow');
    });

    // SE-184: Meta's training crawler is in the AI group, so robots and the edge agree on it.
    test('Meta-ExternalAgent reads the AI group', () => {
        expect(AI_CRAWLERS).toContain('Meta-ExternalAgent');
        expect(verdict('Meta-ExternalAgent', '/archive/36.2.0/')).toBe('allow');
    });

    test('opens only the public archives to AI, not paths that merely contain "archive"', () => {
        const guarded = parseRobotsTxt(productionRobotsTxt([], ['/documentation-archive/', '/archive/']));
        expect(isAllowedByRobots(guarded, 'GPTBot', '/archive/36.2.0/')).toBe(true);
        expect(isAllowedByRobots(guarded, 'GPTBot', '/documentation-archive/')).toBe(false);
    });
});

describe('productionRobotsTxt — file structure (SE-78)', () => {
    test('emits exactly two groups: the wildcard, and every AI crawler together', () => {
        expect(robots.groups.map(({ userAgents }) => userAgents)).toEqual([['*'], AI_CRAWLERS]);
    });

    test('declares the "allow everything" Content-Signal on every group', () => {
        const groups = txt.split(/\n\s*\n/).filter((group) => group.startsWith('User-agent:'));
        expect(groups).toHaveLength(2);
        for (const group of groups) {
            expect(group.split('\n')).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
        }
    });

    test('never names Googlebot, so it falls through to the wildcard and examples stay out of search', () => {
        // robots.txt groups do not inherit: naming Googlebot would drop the wildcard rules for it.
        // Google-Extended is a separate permission token (Gemini/Vertex training) and is in the AI group.
        const agents = robots.groups.flatMap(({ userAgents }) => userAgents.map((agent) => agent.toLowerCase()));
        expect(agents).not.toContain('googlebot');
        expect(agents).toContain('google-extended');
    });

    describe('Sitemap', () => {
        afterEach(() => {
            vi.unstubAllEnvs();
            vi.resetModules();
        });

        test('points at the absolute sitemap index on the site host', async () => {
            vi.stubEnv('PUBLIC_SITE_URL', 'https://www.ag-grid.com');
            vi.resetModules();
            const { productionRobotsTxt: build } = await import('./robotsTxt');

            expect(parseRobotsTxt(build()).sitemaps).toEqual(['https://www.ag-grid.com/sitemap-index.xml']);
        });
    });
});

describe('fetchRobotsDisallow', () => {
    const CHARTS_URL = 'https://www.ag-grid.com/charts/robots-disallow.json';
    const STUDIO_URL = 'https://www.ag-grid.com/studio/robots-disallow.json';

    const okResponse = (paths: string[]) => ({ ok: true, json: async () => paths });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('identifies the build in the User-Agent', async () => {
        const fetchMock = vi.fn().mockResolvedValue(okResponse([]));
        vi.stubGlobal('fetch', fetchMock);

        await fetchRobotsDisallow([CHARTS_URL]);

        expect(fetchMock).toHaveBeenCalledWith(CHARTS_URL, { headers: { 'User-Agent': BUILD_USER_AGENT } });
    });

    test('flattens the disallow paths of every url into one list', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string) =>
                url === CHARTS_URL ? okResponse(['/charts/debug/']) : okResponse(['/studio/examples/'])
            )
        );

        await expect(fetchRobotsDisallow([CHARTS_URL, STUDIO_URL])).resolves.toEqual([
            '/charts/debug/',
            '/studio/examples/',
        ]);
    });

    test('rejects on a failed request rather than silently dropping its disallow paths', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Service Unavailable' }));

        await expect(fetchRobotsDisallow([CHARTS_URL])).rejects.toThrow(
            `Failed to fetch ${CHARTS_URL}: Service Unavailable`
        );
    });
});
