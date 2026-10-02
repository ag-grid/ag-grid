import { type Lifecycle, PENDING, finding } from './lifecycle';
import { WWW } from './redirects';

/**
 * Response-header expectations per content class. `expect` maps a header to:
 * - a string: exactly one copy with exactly that value;
 * - a RegExp: tested against every copy joined with ', ';
 * - null: the header must be absent.
 */
export interface HeaderRow extends Lifecycle {
    id: string;
    title: string;
    url: string;
    method?: 'GET' | 'HEAD';
    /** Overrides the browser Accept (markdown only on paths the guard allows). */
    accept?: string;
    status?: number;
    expect?: Record<string, string | RegExp | null>;
    /** Lower-cased tokens the Vary header must contain. */
    varyIncludes?: string[];
    /** Expect noindex from X-Robots-Tag or <meta name="robots"> (GET only for the meta form). */
    noindex?: boolean;
    /** Apply the site-wide security header set. */
    security?: boolean;
    refs: string[];
}

export const LINK_HEADER =
    '</llms.txt>; rel=describedby, </sitemap-index.xml>; rel=sitemap, <https://www.ag-grid.com/javascript-data-grid/mcp-server/>; rel=related';

/** Exactly one copy each (two Apache instances serve the site: SE-40/SE-93). */
export const SECURITY_HEADERS: Record<string, string | RegExp> = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'geolocation=(), microphone=(), camera=()',
    'content-security-policy': /frame-ancestors 'self' https:\/\/\*\.ag-grid\.com/,
};

const NO_CACHE = 'no-cache';
const DAY_CACHE = 'public, max-age=86400';
const HASHED_CACHE = 'public, max-age=604800, s-maxage=31536000';
const MARKDOWN_TYPE = 'text/markdown; charset=utf-8';

const html = (id: string, title: string, url: string, refs: string[], extra: Partial<HeaderRow> = {}): HeaderRow => ({
    id,
    title,
    url,
    refs,
    status: 200,
    security: true,
    expect: {
        'content-type': /^text\/html/,
        'cache-control': NO_CACHE,
        link: LINK_HEADER,
        'x-content-type-options': 'nosniff',
        'x-robots-tag': null,
        'content-security-policy-report-only': null,
    },
    ...extra,
});

/**
 * Revalidated with its own validator: the 304 must not carry the redirect rule's no-cache (a root
 * mod_headers rule, so it applies under /charts/ too). A charts archive page, because both hosts
 * send it the same ETag and Last-Modified (20 of 20 requests, 2026-10-01): every grid archive was
 * extracted with `tar -m` on each host, so a revalidation that reaches the other host gets a 200,
 * and the extract fix (PENDING.archiveMtimes) only helps archives extracted after it. The grid
 * divergence is a known issue of its own (headers.archive-validators-agree.35.0.0).
 */
export const NOT_MODIFIED_PROBE = `${WWW}/charts/archive/14.2.0/react/quick-start/`;
/** A grid archive page whose two hosts send different validators (live 2026-10-01). */
export const DIVERGENT_VALIDATOR_PROBE = `${WWW}/archive/35.0.0/react-data-grid/getting-started/`;
/** The long archive cache its 200 must carry (as archive.grid-released expects) for the 304 to keep. */
export const NOT_MODIFIED_CACHE_CONTROL = HASHED_CACHE;

/**
 * Compressed pages revalidated with the -gzip ETag they were sent (waf-finding.md §19). The archive
 * page also needs both hosts to agree on its ETag, so it waits for the re-extraction too.
 */
export const GZIP_REVALIDATION_PROBES: Array<{ id: string; url: string; pending: string }> = [
    { id: 'live', url: `${WWW}/react-data-grid/getting-started/`, pending: PENDING.gridGzipRevalidation },
    {
        id: 'archive',
        url: `${WWW}/archive/36.2.0/`,
        pending: `${PENDING.gridGzipRevalidation}; ${PENDING.archiveMtimes}`,
    },
];

/**
 * An archive page both origin hosts must give the same validators for. 36.2.0 was extracted with
 * `tar -m`, so it passes only once re-extracted; repoint this at the first archive uploaded after
 * the script fix to verify that instead.
 */
export const ARCHIVE_VALIDATOR_PROBE = `${WWW}/archive/36.2.0/`;
/** Fresh requests sent, so the load balancer is likely to reach both hosts. */
export const ARCHIVE_VALIDATOR_REQUESTS = 4;

export const HEADER_ROWS: HeaderRow[] = [
    // ---- current HTML ----------------------------------------------------------------------
    html('html.grid-docs', 'Grid docs page', `${WWW}/react-data-grid/getting-started/`, [
        'SE-38',
        'SE-81',
        'SE-189',
        'SE-93',
    ]),
    html('html.home', 'Home page', `${WWW}/`, ['SE-38', 'SE-81', 'SE-189']),
    html('html.charts-docs', 'Charts docs page', `${WWW}/charts/react/quick-start/`, ['SE-38', 'SE-81']),
    html('html.studio-docs', 'Studio docs page', `${WWW}/studio/javascript/quick-start/`, ['SE-38', 'SE-81']),

    // ---- Vary: Accept on negotiated HTML (the DirectoryIndex bug) ------------------------------
    {
        id: 'vary.grid-docs-html',
        title: 'Grid docs HTML carries Vary: Accept',
        url: `${WWW}/react-data-grid/getting-started/`,
        varyIncludes: ['accept'],
        refs: ['SE-80', 'SE-81', finding(11)],
        pending: PENDING.gridVaryHtml,
    },
    {
        id: 'vary.home-html',
        title: 'Home HTML (DirectoryIndex /index.html) carries Vary: Accept',
        url: `${WWW}/`,
        varyIncludes: ['accept'],
        refs: ['SE-80'],
        pending: PENDING.gridVaryHtml,
    },
    {
        id: 'vary.charts-html',
        title: 'Charts docs HTML carries Vary: Accept',
        url: `${WWW}/charts/react/quick-start/`,
        varyIncludes: ['accept'],
        refs: ['SE-80', finding(11)],
        pending: PENDING.chartsHosts,
    },
    {
        id: 'vary.studio-html',
        title: 'Studio docs HTML carries Vary: Accept',
        url: `${WWW}/studio/javascript/quick-start/`,
        varyIncludes: ['accept'],
        refs: ['SE-80', finding(11)],
        pending: PENDING.studioHosts,
    },

    // ---- markdown ----------------------------------------------------------------------------
    {
        id: 'markdown.negotiated',
        title: 'Accept: text/markdown on a docs URL returns the markdown variant with Vary: Accept and no Link',
        url: `${WWW}/react-data-grid/getting-started/`,
        accept: 'text/markdown',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE, link: null },
        varyIncludes: ['accept'],
        security: true,
        refs: ['SE-80', 'SE-81'],
    },
    {
        id: 'markdown.charts-negotiated',
        title: 'Accept: text/markdown on a charts docs URL returns markdown',
        url: `${WWW}/charts/react/quick-start/`,
        accept: 'text/markdown',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE },
        varyIncludes: ['accept'],
        refs: ['SE-80'],
    },
    {
        id: 'markdown.studio-negotiated',
        title: 'Accept: text/markdown on a studio docs URL returns markdown',
        url: `${WWW}/studio/javascript/quick-start/`,
        accept: 'text/markdown',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE },
        varyIncludes: ['accept'],
        refs: ['SE-80'],
    },
    {
        id: 'markdown.twin',
        title: '.md twin: text/markdown; charset=utf-8, no Link',
        url: `${WWW}/react-data-grid/getting-started.md`,
        method: 'HEAD',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE, link: null },
        refs: ['SE-80', 'SE-81'],
    },
    {
        id: 'markdown.twin-no-cache',
        title: '.md twins revalidate like their page: Cache-Control: no-cache',
        url: `${WWW}/react-data-grid/getting-started.md`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': NO_CACHE },
        refs: [finding(11)],
        pending: PENDING.gridNoCache,
    },
    {
        id: 'markdown.negotiated-no-cache',
        title: 'Negotiated markdown on an uncached page revalidates: Cache-Control: no-cache',
        url: `${WWW}/react-data-grid/getting-started/`,
        accept: 'text/markdown',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE, 'cache-control': NO_CACHE },
        refs: [finding(11), 'SE-80'],
        pending: PENDING.gridNoCache,
    },
    {
        id: 'markdown.archive-negotiated',
        title: 'Grid archive pages negotiate markdown (rebuilt 36.2.0 archive)',
        url: `${WWW}/archive/36.2.0/react-data-grid/getting-started/`,
        accept: 'text/markdown',
        status: 200,
        expect: { 'content-type': MARKDOWN_TYPE },
        varyIncludes: ['accept'],
        refs: [finding(4)],
        pending: PENDING.gridArchiveMarkdown,
    },
    // Archived markdown has no <head> for a robots meta tag, so it carries the header instead.
    ...(
        [
            ['grid', `${WWW}/archive/36.2.0/react-data-grid/getting-started.md`, PENDING.gridNoCache],
            [
                'charts',
                `${WWW}/charts/archive/14.2.0/react/quick-start.md`,
                `${PENDING.gridNoCache}; ${PENDING.chartsHosts}`,
            ],
            [
                'studio',
                `${WWW}/studio/archive/3.0.0/javascript/quick-start.md`,
                `${PENDING.gridNoCache}; ${PENDING.studioHosts}`,
            ],
        ] as const
    ).map(
        ([site, url, pending]): HeaderRow => ({
            id: `markdown.archive-noindex.${site}`,
            title: `Archived ${site} .md twin sends X-Robots-Tag: noindex, like archived HTML`,
            url,
            method: 'HEAD',
            status: 200,
            expect: { 'content-type': /^text\/markdown/, 'x-robots-tag': /\bnoindex\b/ },
            refs: [finding(11), 'SE-24'],
            pending,
        })
    ),

    // ---- non-200 and non-HTML: no Link header (SE-81 scoping) ---------------------------------
    {
        id: 'html.404',
        title: '404 page: no Link header, security headers still sent once',
        url: `${WWW}/this-page-does-not-exist-edge-check/`,
        status: 404,
        security: true,
        expect: { link: null },
        refs: ['SE-81', 'SE-185', 'SE-40'],
    },
    {
        id: 'redirect.301-headers',
        title: '301 responses: no Link header, security headers sent',
        url: `${WWW}/javascript-grid-cell-style/`,
        method: 'HEAD',
        status: 301,
        expect: {
            link: null,
            'strict-transport-security': SECURITY_HEADERS['strict-transport-security'] as string,
            'referrer-policy': SECURITY_HEADERS['referrer-policy'] as string,
            'permissions-policy': SECURITY_HEADERS['permissions-policy'] as string,
        },
        refs: ['SE-81', 'SE-93'],
    },
    {
        id: 'asset.image-svg',
        title: 'Unhashed image: 1-day cache, image/svg+xml, no Link',
        url: `${WWW}/images/moon.svg`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, 'content-type': 'image/svg+xml', link: null },
        refs: ['SE-189'],
    },
    {
        id: 'asset.image-webp',
        title: 'WebP image: image/webp, 1-day cache',
        url: `${WWW}/images/scroller-1.webp`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, 'content-type': 'image/webp' },
        refs: ['SE-189'],
    },
    {
        id: 'asset.example-assets',
        title: 'Example asset: 1-day cache',
        url: `${WWW}/example-assets/gold-star.png`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, 'content-type': 'image/png' },
        refs: ['SE-189'],
    },
    {
        id: 'asset.script',
        title: 'Unhashed script: 1-day cache',
        url: `${WWW}/scripts/announcement-banner.js`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, link: null },
        refs: ['SE-189'],
    },
    {
        id: 'root.robots',
        title: '/robots.txt: 1-day cache, text/plain, no Link',
        url: `${WWW}/robots.txt`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, 'content-type': /^text\/plain/, link: null },
        refs: ['SE-189', 'SE-81'],
    },
    {
        id: 'root.favicon',
        title: '/favicon.ico: 1-day cache',
        url: `${WWW}/favicon.ico`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': DAY_CACHE, link: null },
        refs: ['SE-189', 'SE-186'],
    },
    {
        id: 'root.llms',
        title: '/llms.txt: text/plain, no Link',
        url: `${WWW}/llms.txt`,
        method: 'HEAD',
        status: 200,
        expect: { 'content-type': /^text\/plain/, link: null },
        refs: ['SE-81', 'SE-77'],
    },
    {
        id: 'root.sitemap-index',
        title: '/sitemap-index.xml: XML, no Link',
        url: `${WWW}/sitemap-index.xml`,
        method: 'HEAD',
        status: 200,
        expect: { 'content-type': /xml/, link: null },
        refs: ['SE-81', 'SE-186'],
    },

    // ---- archives ----------------------------------------------------------------------------
    {
        id: 'archive.grid-released',
        title: 'Released grid archive: cached for a year at the edge, noindex',
        url: `${WWW}/archive/35.0.0/react-data-grid/getting-started/`,
        status: 200,
        expect: { 'cache-control': HASHED_CACHE },
        noindex: true,
        refs: ['SE-24', finding(8)],
    },
    {
        id: 'archive.charts-released',
        title: 'Released charts archive: cached for a year at the edge, noindex',
        url: `${WWW}/charts/archive/11.2.0/`,
        status: 200,
        expect: { 'cache-control': HASHED_CACHE },
        noindex: true,
        refs: ['SE-24', finding(8)],
    },
    {
        id: 'archive.studio',
        title: 'Studio archives are never cached',
        url: `${WWW}/studio/archive/1.0.0/`,
        method: 'HEAD',
        status: 200,
        expect: { 'cache-control': NO_CACHE },
        refs: ['studioArchiveNoCacheRules'],
    },
    {
        id: 'archive.charts-host-noindex',
        title: 'charts.ag-grid.com/archive/ serves X-Robots-Tag: noindex, nofollow',
        url: 'https://charts.ag-grid.com/archive/10.0.0/',
        method: 'HEAD',
        status: 200,
        expect: { 'x-robots-tag': 'noindex, nofollow' },
        refs: ['SE-24', 'SE-29'],
    },
    {
        id: 'archive.charts-404-not-cached',
        title: 'A missing page under a charts archive is not cacheable for a year',
        url: `${WWW}/charts/archive/14.2.0/edge-check-missing-page/`,
        method: 'HEAD',
        status: 404,
        expect: { 'cache-control': /^(?!.*s-maxage)/ },
        refs: [finding(4)],
        knownIssue: finding(4),
    },

    // ---- redirects are never cached (a cached Location would replay one visitor's query) -----
    ...(
        [
            ['archive', `${WWW}/archive/35.0.0/react-data-grid?edge-check=1`, PENDING.gridNoCache, [finding(4)]],
            ['www', `${WWW}/javascript-grid-cell-style/`, PENDING.gridNoCache, ['SE-61']],
            ['apex', 'https://ag-grid.com/', PENDING.gridNoCache, ['SE-4']],
            ['charts', `${WWW}/charts/react/line/`, `${PENDING.gridNoCache}; ${PENDING.chartsHosts}`, ['SE-60']],
            [
                'studio',
                `${WWW}/studio/javascript/quick-start`,
                `${PENDING.gridNoCache}; ${PENDING.studioHosts}`,
                ['SE-166'],
            ],
        ] as const
    ).map(
        ([kind, url, pending, refs]): HeaderRow => ({
            id: `redirect.no-cache.${kind}`,
            title: `${kind} 301 sends Cache-Control: no-cache (${url})`,
            url,
            method: 'HEAD',
            status: 301,
            expect: { 'cache-control': NO_CACHE },
            refs: [...new Set([...refs, finding(4)])],
            pending,
        })
    ),

    // ---- SE-187: internal hosts noindexed ------------------------------------------------------
    ...[
        'https://ecommerce.ag-grid.com/',
        'https://registry.ag-grid.com/',
        'https://registry.ag-grid.com/-/verdaccio/data/packages',
    ].map(
        (url, i): HeaderRow => ({
            id: `internal-host.noindex.${i}`,
            title: `${url} sends X-Robots-Tag: noindex, nofollow`,
            url,
            method: 'HEAD',
            expect: { 'x-robots-tag': /noindex/ },
            refs: ['SE-187'],
        })
    ),
];
