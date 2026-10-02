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

/** New archive builds get the fix from grid#15434 / #15435; already-deployed archives only from the migration. */
const ARCHIVE_FIX = `${PENDING.gridArchiveRedirects} for new archive builds; ${PENDING.archiveMigration} for deployed ones`;

/** A certificate-validation token that does not exist: it must be answered (404), never add-slashed. */
const ACME_PATH = '/.well-known/acme-challenge/edgeCheckNonexistentToken0001';

/**
 * The hosts the grid root .htaccess canonicalises onto www (getCanonicalisedHostPortPattern in
 * grid htaccessRules.ts). angulargrid.com and www.angulargrid.com are not distribution aliases and
 * are not in DNS today: their rows SKIP until they resolve.
 */
const GRID_ALIAS_HOSTS = [
    'ag-grid.com',
    'angulargrid.ag-grid.com',
    'angular-grid.ag-grid.com',
    'javascript-grid.ag-grid.com',
    'react-grid.ag-grid.com',
    'angulargrid.com',
    'www.angulargrid.com',
].map((h) => `https://${h}`);
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
    // Nick's SE-26 QA was over http: CloudFront upgrades the scheme first, then the host rule runs.
    ...PHASE1_HOSTS.map((h) =>
        r(`${h.replace('https:', 'http:')}/`, `${h}/`, ['SE-26'], {
            hops: 2,
            note: 'CloudFront http->https precedes the host rule',
        })
    ),
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
        ['SE-4', 'grid#15434 / #15435'],
        {
            knownIssue: finding(3),
            fixedBy: ARCHIVE_FIX,
        }
    ),
    // /archive/36.2.0/react-data-grid/whats-new and the other archive leaks: migration.grid.*.leaks.
    r(
        `${BLOG_HOST}/archive/36.2.0/react-data-grid/getting-started/`,
        `${WWW}/archive/36.2.0/react-data-grid/getting-started/`,
        [finding(3), 'grid#15434 / #15435'],
        {
            // 36.2.0 is already deployed, so its own .htaccess only changes through the migration.
            pending: PENDING.archiveMigration,
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
    ...['cone-funnel-series', 'pyramid-series', 'candlestick-series', 'ohlc-series', 'api-state', 'radial-gauge'].map(
        (page) =>
            r(
                `${CHARTS_HOST}/react/${page}?ref=blog.ag-grid.com`,
                `${WWW}/charts/react/${page}/?ref=blog.ag-grid.com`,
                ['SE-28']
            )
    ),
    r(`${CHARTS_HOST}/javascript/toolbar/`, `${WWW}/charts/javascript/financial-charts-toolbar/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/react/toolbar/`, `${WWW}/charts/react/financial-charts-toolbar/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/react/line/`, `${WWW}/charts/react/line-series/`, ['SE-28', 'SE-60']),
    r(`${CHARTS_HOST}/sitemap.xml`, `${WWW}/charts/sitemap-0.xml`, ['SE-186']),
    // SE-66 B3, as Sean decided on 2026-10-02: the charts framework roots are SE-144's indexable
    // landing hubs (self-canonical, in the sitemap, linked from the footer and llms.txt), so they
    // stay pages rather than going to their quick start as B3 first asked. Every host reaches the
    // hub in one hop; on www the hub itself answers 200. The apex and alias hosts take two hops, or
    // keep the alias host, until ag-charts#8440 / #8441 deploys.
    ...['react', 'angular', 'vue'].flatMap((fw) => [
        r(`${WWW}/charts/${fw}`, `${WWW}/charts/${fw}/`, ['SE-66', 'SE-144']),
        status(`${WWW}/charts/${fw}/`, 200, ['SE-66', 'SE-144']),
        r(`${APEX}/charts/${fw}`, `${WWW}/charts/${fw}/`, ['SE-66', 'SE-144'], { pending: PENDING.chartsHosts }),
        r(`${APEX}/charts/${fw}/`, `${WWW}/charts/${fw}/`, ['SE-66', 'SE-144']),
        r(`https://react-grid.ag-grid.com/charts/${fw}`, `${WWW}/charts/${fw}/`, ['SE-66', 'SE-144'], {
            pending: PENDING.chartsHosts,
        }),
        r(`https://react-grid.ag-grid.com/charts/${fw}/`, `${WWW}/charts/${fw}/`, ['SE-66', 'SE-144'], {
            pending: PENDING.chartsHosts,
        }),
    ]),
    // Exactly #bullet-series, as Nick's 07-20 QA has it: today the bare Redirect adds a slash to it.
    ...['angular', 'javascript', 'vue'].map((fw) =>
        r(`${WWW}/charts/${fw}/bullet-series/`, `${WWW}/charts/${fw}/linear-gauge/#bullet-series`, ['SE-29', 'SE-66'], {
            knownIssue: finding(2),
            fixedBy: PENDING.chartsHosts,
            note: 'bare Redirect appends the trailing slash to the anchor (#bullet-series/)',
        })
    ),
    r(`${WWW}/charts/react/bullet-series/`, `${WWW}/charts/react/linear-gauge/#bullet-series`, ['SE-29', 'SE-66'], {
        knownIssue: finding(2),
        fixedBy: PENDING.chartsHosts,
        note: 'bare Redirect appends the trailing slash to the anchor (#bullet-series/)',
    }),

    // ---- in-flight: grid#15434 / #15435 ---------------------------------------
    // waf-finding.md §20.1: an ACME HTTP-01 token is answered where it is asked, never add-slashed.
    // Over http, CloudFront's redirect-to-https always answers first (Apache never sees port 80).
    status(`${WWW}${ACME_PATH}`, 404, [finding(20), 'grid#15434 / #15435'], {
        pending: PENDING.gridAcme,
        note: 'no add-slash 301',
    }),
    r(`http://www.ag-grid.com${ACME_PATH}`, `${WWW}${ACME_PATH}`, [finding(20), 'grid#15434 / #15435'], {
        pending: PENDING.gridAcme,
        final: 404,
        note: 'CloudFront https upgrade, then answered',
    }),
    r(`${APEX}${ACME_PATH}`, `${WWW}${ACME_PATH}`, [finding(20), 'grid#15434 / #15435'], {
        pending: PENDING.gridAcme,
        final: 404,
        note: 'host swap keeps the token unslashed',
    }),
    // waf-finding.md §20.2: a slash-less directory URL on an alias host is ONE hop to the slashed www URL.
    // The blog host is left out on purpose: the live site sends it to the blog redirects instead.
    ...GRID_ALIAS_HOSTS.map((h) =>
        r(`${h}/react-data-grid/getting-started`, `${WWW}/react-data-grid/getting-started/`, [finding(20), 'SE-66'], {
            pending: PENDING.gridOneHopSlash,
            note: 'slash-less, one hop',
        })
    ),
    // /charts and /studio pages: their own .htaccess canonicalises, slash included (ag-charts#8440 / #8441, ag-studio#3096 / #3097).
    ...[APEX, BLOG_HOST, 'https://react-grid.ag-grid.com'].map((h) =>
        r(`${h}/charts/react/quick-start`, `${WWW}/charts/react/quick-start/`, [finding(2), finding(20), 'SE-86'], {
            pending: PENDING.chartsHosts,
            note: 'slash-less, one hop',
        })
    ),
    ...[APEX, BLOG_HOST, 'https://angular-grid.ag-grid.com'].map((h) =>
        r(
            `${h}/studio/javascript/quick-start`,
            `${WWW}/studio/javascript/quick-start/`,
            [finding(2), finding(20), 'SE-86'],
            {
                pending: PENDING.studioHosts,
                note: 'slash-less, one hop',
            }
        )
    ),
    // waf-finding.md §20.4: the shadowed duplicates are removed; the entries that always fired stay.
    // Deployed behaviour (the first match already won), so these guard against a regression.
    r(`${WWW}/javascript-data-grid/building/`, `${WWW}/javascript-data-grid/installation/`, [
        finding(20),
        'grid#15434 / #15435',
    ]),
    ...['angular', 'react', 'vue'].map((fw) =>
        r(
            `${WWW}/${fw}-data-grid/building/`,
            `${WWW}/${fw}-data-grid/installation/`,
            [finding(20), 'grid#15434 / #15435'],
            {
                pending: PENDING.gridBuilding,
            }
        )
    ),
    r(
        `${WWW}/javascript-data-grid/server-side-model-high-frequency/`,
        `${WWW}/javascript-data-grid/server-side-model-updating-transactions/`,
        [finding(20), 'grid#15434 / #15435']
    ),
    // The 24 server-side pages the /{framework}-grid/ prefix shadowed: a sample, from www and the apex.
    r(
        `${WWW}/react-grid/server-side-operations-graphql/`,
        `${WWW}/react-data-grid/server-side-model/`,
        ['SE-66', 'grid#15434 / #15435'],
        {
            pending: PENDING.gridServerSideOneHop,
        }
    ),
    r(
        `${WWW}/vue-grid/server-side-model-high-frequency/`,
        `${WWW}/vue-data-grid/server-side-model-updating-transactions/`,
        ['SE-66', 'grid#15434 / #15435'],
        { pending: PENDING.gridServerSideOneHop }
    ),
    r(
        `${APEX}/angular-grid/server-side-model-transactions/`,
        `${WWW}/angular-data-grid/server-side-model-updating-transactions/`,
        ['SE-66', 'grid#15434 / #15435'],
        { pending: PENDING.gridServerSideOneHop, note: 'single-hop rewrites run on the apex too' }
    ),
    r(
        `${WWW}/javascript-grid/server-side-model-refresh/`,
        `${WWW}/javascript-data-grid/server-side-model-updating-refresh/`,
        ['SE-66', 'grid#15434 / #15435'],
        {
            pending: PENDING.gridServerSideOneHop,
        }
    ),
    // AG-17152: /documentation/<framework>/charts* moved to the charts site.
    r(
        `${WWW}/documentation/react/charts-overview/`,
        `${WWW}/charts/react/quick-start/`,
        ['SE-66', 'grid#15434 / #15435'],
        {
            pending: PENDING.gridServerSideOneHop,
        }
    ),
    r(`${WWW}/documentation/vue/charts/`, `${WWW}/charts/vue/quick-start/`, ['SE-66', 'grid#15434 / #15435'], {
        pending: PENDING.gridServerSideOneHop,
    }),
    r(
        `${WWW}/documentation/javascript/`,
        `${WWW}/javascript-data-grid/getting-started/`,
        ['SE-66', 'grid#15434 / #15435'],
        {
            pending: PENDING.gridServerSideOneHop,
            note: 'not via the /javascript-data-grid/ forwarder',
        }
    ),

    // ---- in-flight: ag-charts#8440 / #8441 legacy-prefix redirects ------------------------------------
    // From packages/ag-charts-website/src/utils/htaccess/redirects.ts: a renamed slug below a legacy
    // prefix lands on the renamed page's final URL, and a file below one keeps its path.
    ...(
        [
            ['/charts/react-charts/react/fonts/', '/charts/react/text/'],
            ['/charts/javascript-charts/javascript/toolbar/', '/charts/javascript/financial-charts-toolbar/'],
            ['/charts/enterprise-charts/react/line', '/charts/react/line-series/'],
            ['/charts/core/fonts/', '/charts/javascript/text/'],
            ['/charts/vue-charts/vue/bullet-series/', '/charts/vue/linear-gauge/#bullet-series'],
        ] as const
    ).map(([from, to]) =>
        r(`${WWW}${from}`, `${WWW}${to}`, [finding(2), 'SE-66', 'ag-charts#8440 / #8441'], {
            pending: PENDING.chartsLegacyPrefixes,
            note: 'renamed slug under a legacy prefix',
        })
    ),
    r(
        `${APEX}/charts/react-charts/react/fonts`,
        `${WWW}/charts/react/text/`,
        [finding(2), 'SE-66', 'ag-charts#8440 / #8441'],
        {
            pending: PENDING.chartsLegacyPrefixes,
            note: 'alias host, slash-less, renamed slug',
        }
    ),
    // Already live on 2026-10-01 (the first production run showed NOW LIVE), so deployed guards.
    r(
        `${WWW}/charts/react-charts/react/area-series/index.html`,
        `${WWW}/charts/react/area-series/index.html`,
        [finding(2), 'ag-charts#8440 / #8441'],
        { note: 'a file keeps its path' }
    ),
    r(
        `${WWW}/charts/react-charts/react/area-series.md`,
        `${WWW}/charts/react/area-series.md`,
        [finding(2), 'ag-charts#8440 / #8441'],
        {
            note: 'a markdown twin keeps its path',
        }
    ),

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
    // Two hops on www today (DirectorySlash first); the charts release (ag-charts#8440 / #8441) makes them one.
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
    r(`${WWW}/javascript-grid/`, `${WWW}/javascript-data-grid/getting-started/`, ['SE-66', 'grid#15434 / #15435'], {
        knownIssue: finding(15),
        fixedBy: PENDING.gridServerSideOneHop,
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
    r(`${BLOG_HOST}/author/adam/`, `${WWW}/blog/author/adam/`, ['SE-91']),
    r(`${BLOG_HOST}/newsletter/`, `${WWW}/blog/newsletter/`, ['SE-91']),
    status(`${BLOG_HOST}/WHATS-NEW-IN-AG-GRID-V24/feed/`, 410, ['SE-91'], { note: 'upper-case slug' }),
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
