import { FIRST_RUN, type Lifecycle, PENDING, finding } from './lifecycle';

/**
 * Redirect expectations. Each row is one check: the first response's status and Location, the
 * number of redirects before the final response, and the final status.
 *
 * Rows come from the SE tickets' QA tables (cited in `refs`); the host matrix rows come from
 * waf-finding.md §2/§3. Location is compared after resolving against the request URL, and
 * query strings are part of the comparison (SE-28 / SE-64 query preservation).
 */
export interface RedirectRow extends Lifecycle {
    from: string;
    /** First-hop status. Default 301. */
    status?: number;
    /** Exact first-hop Location. */
    to?: string;
    /** Alternative to `to`: the first-hop Location starts with this. */
    toPrefix?: string;
    /** Redirects before the final response. Default 1 when the first hop is a redirect. */
    hops?: number;
    /** Final status after following. Default 200. */
    final?: number;
    refs: string[];
    note?: string;
}

export const WWW = 'https://www.ag-grid.com';
const APEX = 'https://ag-grid.com';
const CHARTS_HOST = 'https://charts.ag-grid.com';
const BLOG_HOST = 'https://blog.ag-grid.com';
const PHASE1_HOSTS = ['angular-grid', 'javascript-grid', 'react-grid', 'angulargrid'].map(
    (h) => `https://${h}.ag-grid.com`
);

const r = (from: string, to: string, refs: string[], extra: Partial<RedirectRow> = {}): RedirectRow => ({
    from,
    to,
    refs,
    ...extra,
});
const rp = (from: string, toPrefix: string, refs: string[], extra: Partial<RedirectRow> = {}): RedirectRow => ({
    from,
    toPrefix,
    refs,
    ...extra,
});
const status = (from: string, code: number, refs: string[], extra: Partial<RedirectRow> = {}): RedirectRow => ({
    from,
    status: code,
    refs,
    ...extra,
});

const Q = '?utm_source=edge-check';
const MCP_POST = '/introducing-the-ag-grid-model-context-protocol-mcp-server';

export const REDIRECTS: RedirectRow[] = [
    // ---- host canonicalisation (SE-4, SE-26, waf-finding.md §2/§3) --------------------------
    r(`${APEX}/`, `${WWW}/`, ['SE-4']),
    r(`${APEX}/javascript-data-grid/getting-started/`, `${WWW}/javascript-data-grid/getting-started/`, [
        'SE-4',
        'SE-66',
    ]),
    r(
        `${APEX}/react-data-grid/getting-started/${Q}`,
        `${WWW}/react-data-grid/getting-started/${Q}`,
        ['SE-4', 'SE-64'],
        {
            note: 'query preserved',
        }
    ),
    r('http://ag-grid.com/', `${APEX}/`, ['SE-4'], { hops: 2, note: 'CloudFront http->https precedes the apex rule' }),
    r('http://www.ag-grid.com/', `${WWW}/`, ['SE-4']),
    ...PHASE1_HOSTS.map((h) =>
        r(`${h}/react-data-grid/getting-started/${Q}`, `${WWW}/react-data-grid/getting-started/${Q}`, ['SE-26'])
    ),
    r('https://react-grid.ag-grid.com/', `${WWW}/`, ['SE-26']),
    r(`${CHARTS_HOST}/react/quick-start/${Q}`, `${WWW}/charts/react/quick-start/${Q}`, ['SE-29', 'SE-182']),

    // /charts and /studio on alias hosts: the child .htaccess files replace the root rewrite rules.
    r(`${APEX}/charts/react/quick-start/`, `${WWW}/charts/react/quick-start/`, ['SE-66', finding(2)]),
    ...['angulargrid', 'react-grid'].map((h) =>
        r(
            `https://${h}.ag-grid.com/charts/react/quick-start/`,
            `${WWW}/charts/react/quick-start/`,
            ['SE-26', 'SE-86'],
            {
                knownIssue: finding(2),
                fixedBy: PENDING.chartsHosts,
            }
        )
    ),
    r(`${BLOG_HOST}/charts/react/bar-series/`, `${WWW}/charts/react/bar-series/`, ['SE-86'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
    }),
    ...[APEX, BLOG_HOST, 'https://angulargrid.ag-grid.com'].map((h) =>
        r(`${h}/studio/`, `${WWW}/studio/`, ['SE-4', 'SE-86'], { knownIssue: finding(2), fixedBy: PENDING.studioHosts })
    ),

    // Archives: an archive's own .htaccess replaces the root rewrite rules inside /archive/<v>/.
    r(
        `${APEX}/archive/35.0.0/react-data-grid/getting-started/`,
        `${WWW}/archive/35.0.0/react-data-grid/getting-started/`,
        ['SE-4', finding(3)]
    ),
    r(
        `${APEX}/archive/36.2.0/react-data-grid/getting-started/`,
        `${WWW}/archive/36.2.0/react-data-grid/getting-started/`,
        ['SE-4'],
        {
            knownIssue: finding(3),
            fixedBy: PENDING.gridArchiveRedirects,
        }
    ),
    rp(`${WWW}/archive/36.2.0/react-data-grid/whats-new`, `${WWW}/archive/36.2.0/`, ['SE-64'], {
        knownIssue: finding(3),
        fixedBy: PENDING.gridArchiveRedirects,
        note: 'single-hop rules must not leave the archive',
    }),
    r(
        `${BLOG_HOST}/archive/36.2.0/react-data-grid/getting-started/`,
        `${WWW}/archive/36.2.0/react-data-grid/getting-started/`,
        [finding(3)],
        {
            pending: PENDING.gridArchiveRedirects,
        }
    ),
    status(`${CHARTS_HOST}/archive/10.0.0/`, 200, ['SE-24', 'SE-29'], { note: 'served (noindex), not redirected' }),

    // ---- charts.ag-grid.com (SE-28, SE-29, SE-186) --------------------------------------------
    r(`${CHARTS_HOST}/react/zoom`, `${WWW}/charts/react/zoom/`, ['SE-28']),
    r(`${CHARTS_HOST}/react/financial-charts`, `${WWW}/charts/react/financial-charts/`, ['SE-28']),
    r(`${CHARTS_HOST}/react/range-bar-series`, `${WWW}/charts/react/range-bar-series/`, ['SE-28']),
    r(
        `${CHARTS_HOST}/react/funnel-series?ref=blog.ag-grid.com`,
        `${WWW}/charts/react/funnel-series/?ref=blog.ag-grid.com`,
        ['SE-28']
    ),
    r(
        `${CHARTS_HOST}/react/linear-gauge?ref=blog.ag-grid.com`,
        `${WWW}/charts/react/linear-gauge/?ref=blog.ag-grid.com`,
        ['SE-28']
    ),
    r(`${CHARTS_HOST}/javascript/toolbar/`, `${WWW}/charts/javascript/financial-charts-toolbar/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/react/toolbar/`, `${WWW}/charts/react/financial-charts-toolbar/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/react/line/`, `${WWW}/charts/react/line-series/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/sitemap.xml`, `${WWW}/charts/sitemap-0.xml`, ['SE-186']),
    rp(`${WWW}/charts/angular/bullet-series/`, `${WWW}/charts/angular/linear-gauge/`, ['SE-29', 'SE-66']),
    r(`${WWW}/charts/react/bullet-series/`, `${WWW}/charts/react/linear-gauge/#bullet-series`, ['SE-29', 'SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
        note: 'bare Redirect appends the trailing slash to the anchor (#bullet-series/)',
    }),

    // ---- SE-30 -----------------------------------------------------------------------------
    r(`${WWW}${MCP_POST}/`, `${WWW}/blog${MCP_POST}/`, ['SE-30', 'SE-91']),
    r(`${WWW}${MCP_POST}`, `${WWW}${MCP_POST}/`, ['SE-30'], {
        hops: 2,
        note: 'the one documented two-hop (DirectorySlash first)',
    }),

    // ---- SE-60: 15 legacy URLs ---------------------------------------------------------------
    ...(
        [
            ['/charts/javascript/toolbar/', '/charts/javascript/financial-charts-toolbar/'],
            ['/charts/react/toolbar/', '/charts/react/financial-charts-toolbar/'],
            ['/charts/react/line/', '/charts/react/line-series/'],
            ['/javascript-data-grid/grouping-sticky-groups/', '/javascript-data-grid/grouping-display-types/'],
            [
                '/javascript-data-grid/global-style-upgrading-to-v28/',
                '/javascript-data-grid/theming-v32-upgrading-to-v28/',
            ],
            [
                '/javascript-data-grid/integrated-charts-api-chart-tool-panel/',
                '/javascript-data-grid/integrated-charts-chart-tool-panels/',
            ],
            ['/javascript-grid-charts-customisation-line/', '/javascript-data-grid/integrated-charts-customisation/'],
            ['/javascript-grid-charts-customisation-bar/', '/javascript-data-grid/integrated-charts-customisation/'],
            [
                '/javascript-grid-charts-customisation-general/',
                '/javascript-data-grid/integrated-charts-customisation/',
            ],
            ['/javascript-grid-charts-customisation/', '/javascript-data-grid/integrated-charts-customisation/'],
            ['/javascript-grid-charts-overview/', '/javascript-data-grid/integrated-charts/'],
            ['/javascript-grid-charts-pivot-chart/', '/javascript-data-grid/integrated-charts-api-pivot-chart/'],
            ['/javascript-grid-charts-range-chart/', '/javascript-data-grid/integrated-charts-api-range-chart/'],
            ['/react-data-grid/reactui/', '/react-data-grid/getting-started/'],
            ['/react-data-grid/global-style-customisation/', '/react-data-grid/theming-v32-customisation/'],
        ] as const
    ).map(([from, to]) => r(`${WWW}${from}`, `${WWW}${to}`, ['SE-60'])),

    // ---- SE-61: grouped legacy 404s ----------------------------------------------------------
    r(`${WWW}/javascript-grid-cell-style/`, `${WWW}/javascript-data-grid/cell-styles/`, ['SE-61']),
    r(`${WWW}/javascript-grid-virtual-paging/anything/`, `${WWW}/javascript-data-grid/infinite-scrolling/`, ['SE-61']),
    r(`${WWW}/documentation/getting-started/introduction/`, `${WWW}/javascript-data-grid/getting-started/`, ['SE-61']),
    r(`${WWW}/ecosystem/`, `${WWW}/community/tools-extensions/`, ['SE-61']),
    status(`${WWW}/testimonials.php`, 410, ['SE-61']),
    status(`${WWW}/forum/showthread.php`, 410, ['SE-61']),
    r(`${WWW}/start-trial.php`, `${WWW}/license-pricing/`, ['SE-61']),
    r(`${WWW}/charts/core/bar-series/`, `${WWW}/charts/javascript/bar-series/`, ['SE-61', 'SE-66']),
    r(`${WWW}/charts/side/axes-types/`, `${WWW}/charts/javascript/axes-types/`, ['SE-61']),
    r(`${WWW}/charts/react-charts/react/area-series/`, `${WWW}/charts/react/area-series/`, ['SE-61']),
    status(`${WWW}/charts/privacy/`, 410, ['SE-61', 'SE-66']),
    r(`${WWW}/gallery/simple-area/`, `${WWW}/charts/gallery/simple-area/`, ['SE-61']),
    // SE-61 listed /charts/options/; it now lands on the matching options page, which is the intent.
    rp(`${WWW}/options/series/area/`, `${WWW}/charts/options/`, ['SE-61']),
    r(`${WWW}/angular/pie-series/`, `${WWW}/charts/angular/pie-series/`, ['SE-61']),
    r(`${WWW}/react/expressions/`, `${WWW}/charts/react/quick-start/`, ['SE-61']),
    r(`${WWW}/forum/`, `${WWW}/community/`, ['SE-61']),
    r(`${WWW}/community-forums/`, `${WWW}/community/`, ['SE-61']),
    r(`${WWW}/forum`, `${WWW}/forum/`, ['SE-61'], { hops: 2, note: 'documented two-hop (trailing slash first)' }),

    // ---- SE-64: www chains ------------------------------------------------------------------
    ...(
        [
            ['/angular-grid-api', '/angular-data-grid/grid-api/'],
            ['/react-data-grid/grouping-footers', '/react-data-grid/aggregation-total-rows/'],
            ['/javascript-grid/component-header/', '/javascript-data-grid/column-headers/'],
            ['/react-grid/rxjs/', '/react-data-grid/data-update/'],
            ['/javascript-grid/immutable-data/', '/'],
            ['/javascript-grid/index.html', '/javascript-data-grid/getting-started/'],
            ['/javascript-grid-value-formatters', '/javascript-data-grid/value-formatters/'],
            ['/cookies.php', '/cookies/'],
            ['/example.php', '/example/'],
            ['/license-pricing.php', '/license-pricing/'],
            ['/angular-grid-api?utm_source=qa', '/angular-data-grid/grid-api/?utm_source=qa'],
        ] as const
    ).map(([from, to]) => r(`${WWW}${from}`, `${WWW}${to}`, ['SE-64'])),

    // ---- SE-66: apex chains and the charts single-hop work -----------------------------------
    r(`${APEX}/angular-data-grid/cell-rendering/`, `${WWW}/angular-data-grid/component-cell-renderer/`, ['SE-66']),
    r(`${APEX}/javascript-grid-value-formatters`, `${WWW}/javascript-data-grid/value-formatters/`, ['SE-66']),
    r(`${APEX}/changelog`, `${WWW}/changelog/`, ['SE-66']),
    r(`${APEX}/react-grid/rxjs/`, `${WWW}/react-data-grid/data-update/`, ['SE-66']),
    r(`${APEX}/javascript-grid/immutable-data/`, `${WWW}/`, ['SE-66']),
    ...['/charts/react/zoom', '/charts/angular/zoom'].map((p) =>
        r(`${APEX}${p}`, `${WWW}${p}/`, ['SE-66'], { knownIssue: finding(2), fixedBy: PENDING.chartsHosts })
    ),
    r(`${APEX}/charts/react/bullet-series`, `${WWW}/charts/react/linear-gauge/#bullet-series`, ['SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
    }),
    r(`${APEX}/charts/javascript-charts/javascript/bar-series`, `${WWW}/charts/javascript/bar-series/`, ['SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
    }),
    r(`${WWW}/charts/angular/zoom`, `${WWW}/charts/angular/zoom/`, ['SE-66']),
    r(`${WWW}/charts/react/bar-series`, `${WWW}/charts/react/bar-series/`, ['SE-66']),
    r(`${WWW}/charts/react/bullet-series`, `${WWW}/charts/react/linear-gauge/#bullet-series`, ['SE-66']),
    r(`${WWW}/charts/javascript/fonts`, `${WWW}/charts/javascript/text/`, ['SE-66']),
    r(`${WWW}/charts/react/fonts/`, `${WWW}/charts/react/text/`, ['SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
        note: 'bare Redirect is a prefix match: /charts/react/text//',
    }),
    r(`${WWW}/charts/javascript/toolbar`, `${WWW}/charts/javascript/financial-charts-toolbar/`, ['SE-66', 'SE-60'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
    }),
    // Two hops on www today (DirectorySlash first); ag-charts#8422 makes them one.
    r(`${WWW}/charts/react/line`, `${WWW}/charts/react/line-series/`, ['SE-66', FIRST_RUN], {
        pending: PENDING.chartsHosts,
    }),
    r(`${WWW}/charts/archive`, `${WWW}/charts/documentation-archive/`, ['SE-66', 'SE-182']),
    r(`${WWW}/charts/react-charts/react/area-series`, `${WWW}/charts/react/area-series/`, ['SE-66', FIRST_RUN], {
        pending: PENDING.chartsHosts,
    }),
    r(`${WWW}/charts/javascript-charts/gallery`, `${WWW}/charts/gallery/`, ['SE-66']),
    r(`${WWW}/charts/core/bar-series`, `${WWW}/charts/javascript/bar-series/`, ['SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
    }),
    r(`${WWW}/charts/server-side-rendering`, `${WWW}/charts/javascript/server-side-rendering/`, ['SE-66']),
    r(`${WWW}/charts/javascript/series`, `${WWW}/charts/javascript/bar-series/`, ['SE-66']),
    r(`${WWW}/javascript-grid/`, `${WWW}/javascript-data-grid/getting-started/`, ['SE-66'], {
        knownIssue: finding(15),
        note: 'redirects.ts:455 -> /javascript-data-grid/ -> getting-started/',
    }),

    // ---- SE-166: internal links that pointed at redirects -----------------------------------
    r(`${WWW}/react-data-grid/whats-new`, `${WWW}/whats-new/`, ['SE-166']),
    r(`${WWW}/about.php`, `${WWW}/about/`, ['SE-166']),
    r(`${WWW}/charts`, `${WWW}/charts/`, ['SE-166']),
    r(`${WWW}/studio`, `${WWW}/studio/`, ['SE-166']),

    // ---- SE-186: sitemaps --------------------------------------------------------------------
    r(`${WWW}/sitemap.xml`, `${WWW}/sitemap-index.xml`, ['SE-186']),
    r(`${WWW}/charts/sitemap.xml`, `${WWW}/charts/sitemap-0.xml`, ['SE-186']),
    r(`${WWW}/blog/sitemap.xml`, `${WWW}/sitemap-index.xml`, ['SE-186', 'SE-85']),
    r(`${BLOG_HOST}/sitemap.xml`, `${WWW}/blog/sitemap.xml`, ['SE-186', 'SE-85'], {
        hops: 2,
        note: 'follows the /blog/sitemap.xml chain',
    }),

    // ---- the blog (SE-40, SE-85, SE-88, SE-91, SE-94, SE-188) --------------------------------
    r(`${WWW}/blog`, `${WWW}/blog/`, ['SE-88']),
    r(`${APEX}/blog/`, `${WWW}/blog/`, ['SE-88']),
    r(`${BLOG_HOST}/`, `${WWW}/blog/`, ['SE-91', 'SE-93']),
    r(`${BLOG_HOST}/whats-new-in-ag-grid-35-3/`, `${WWW}/blog/whats-new-in-ag-grid-35-3/`, ['SE-91', 'SE-94']),
    r(`${BLOG_HOST}/tag/angular/`, `${WWW}/blog/tag/angular/`, ['SE-91']),
    r(`${BLOG_HOST}/page/2/`, `${WWW}/blog/page/2/`, ['SE-91']),
    r(`${BLOG_HOST}/rss/`, `${WWW}/blog/rss/`, ['SE-91', 'SE-90']),
    r(`${BLOG_HOST}/whats-new-in-ag-grid-35-3/amp/`, `${WWW}/blog/whats-new-in-ag-grid-35-3/`, ['SE-91']),
    status(`${BLOG_HOST}/ag-grid-vs-datatables/`, 410, ['SE-91']),
    status(`${BLOG_HOST}/whats-new-in-ag-grid-v24/`, 410, ['SE-91', 'SE-94']),
    r(
        `${BLOG_HOST}/index.php/2018/11/29/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm/`,
        `${WWW}/blog/inside-fiber-an-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/`,
        ['SE-91']
    ),
    r(
        `${BLOG_HOST}/content/images/size/w256h256/2021/02/200pxArtboard-5.png`,
        `${WWW}/blog/content/images/size/w256h256/2021/02/200pxArtboard-5.png`,
        ['SE-91']
    ),
    r(`${WWW}/blog/testing-ag-grid-react-jest-enzyme/`, `${WWW}/react-data-grid/testing/`, ['SE-85', 'SE-94']),
    r(`${WWW}/blog/upgrading-to-ag-grid-v25-server-side-row-model/`, `${WWW}/react-data-grid/server-side-model/`, [
        'SE-40',
    ]),
    status(`${WWW}/blog/content/images/thumbnail/foo.jpg`, 410, ['SE-188']),
    r(`${WWW}/blog/archive`, `${WWW}/documentation-archive/`, ['SE-188', 'SE-166']),
    status(`${WWW}/blog/grid/add-rows-pinned-row/js/`, 410, ['SE-188']),
    status(`${WWW}/blog/charts/ag-charts-13-release-demos/main.js`, 410, ['SE-188']),
    status(
        `${WWW}/blog/charts/optimsing-javascript-charts-with-m4-algorithm/javascript/high-performance-line-chart-example/`,
        410,
        ['SE-188']
    ),
    status(`${WWW}/blog/robots.txt`, 404, ['SE-188']),
    status(`${WWW}/blog/public/ghost.css`, 200, ['SE-188'], { note: 'live theme asset must not be caught' }),

    // ---- misc --------------------------------------------------------------------------------
    status(`${WWW}/studio/r/theming/`, 200, ['SE-164']),
    status(`${WWW}/theming/`, 404, ['SE-164']),
    r(`${WWW}/archive/`, `${WWW}/documentation-archive/`, ['SE-182']),
    r(`${WWW}/charts/archive/`, `${WWW}/charts/documentation-archive/`, ['SE-182']),
    r(`${WWW}/studio/archive/`, `${WWW}/studio/documentation-archive/`, ['SE-182'], {
        knownIssue: finding(12),
        note: 'returns 403 today; recommended 301 so an Allow: /studio/archive/$ can expose it',
    }),
];
