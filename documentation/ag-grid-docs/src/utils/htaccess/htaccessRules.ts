// Relative rather than aliased: this module is pulled in by the agHtaccessGen integration, which
// astro.config.mjs bundles without tsconfig path resolution (as with plugins/agDevMarkdownNegotiation).
import { SITE_BASE_URL } from '../../constants';
import { markdownPathAlternation } from '../markdownPages';
import { urlWithBaseUrl } from '../urlWithBaseUrl';
import type { CspEnv, CspMode } from './cspRules';
import {
    BLOG_PATH_CONDITION,
    getBlogCspExprOverride,
    getBranchBuildsCspIfOverride,
    getCampaignsCspIfOverride,
    getCspHtaccessBlock,
    getScopedCspHtaccessBlock,
} from './cspRules';
import type { Redirect } from './redirects';
import { SITE_301_REDIRECTS, SITE_SINGLE_HOP_REWRITES } from './redirects';

export type HtaccessEnv = Extract<CspEnv, 'staging' | 'production'>;

// Rollout state for removing 'unsafe-eval' from the production main-site CSP.
// While 'report-only', production keeps enforcing the previous policy (which
// allows 'unsafe-eval' everywhere) and reports violations of the tightened
// path-scoped split. Flip to 'enforce' once the report-only window is clean.
// Staging always enforces the split. Exported for the tests, which assert
// different output per phase.
export const PRODUCTION_CSP_PHASE: 'report-only' | 'enforce' = 'enforce';

// The two non-CSP security header values, shared by the generated .htaccess (main site) and
// the blog vhost fragment (getBlogVhostHeaderFragment) so the two cannot drift. The blog is
// reverse-proxied, so it never reads the generated .htaccess and needs its own copy of these
// applied with mod_headers' expr= condition — see getBlogVhostHeaderFragment.
export const REFERRER_POLICY_VALUE = 'strict-origin-when-cross-origin';
export const PERMISSIONS_POLICY_VALUE = 'geolocation=(), microphone=(), camera=()';

/**
 * Note: when changing this file please add/update the tests in
 * documentation/ag-grid-docs/testing/htaccess-harness
 */
// Without Cache-Control, browsers heuristically cache for ~10% of a page's age - the
// "had to hard-refresh" behaviour. no-cache (store, but always revalidate) removes it while
// keeping back/forward navigation. Archived versions keep the heuristic window: immutable,
// and cheaper to leave cached. The per-page markdown variants change with their page, so they
// revalidate the same way.
const documentNoCacheRules = `
# Current pages and their markdown variants: always revalidate. Excludes /archive/<v>/ which is immutable.
Header set Cache-Control "no-cache" "expr=%{CONTENT_TYPE} =~ m#^text/(html|markdown)# && !( %{REQUEST_URI} =~ m#^/(charts/)?archive/[0-9]# )"
`;

// A redirect has no content worth caching, and a shared cache that keys it on the path alone
// would replay the first visitor's query string in its Location to everyone after. 'always' is
// what reaches a redirect at all: Apache drops the ordinary (onsuccess) header table on non-2xx
// responses, which also means no later onsuccess rule - an archive's own included - can override
// this one there, while a 200 never matches it. 304 is excluded: it is a 3xx, but it refreshes the
// headers of the copy a cache already holds, so no-cache on it would wipe out the long cache of
// every revalidated asset and released archive page.
const redirectNoCacheRules = `
# Redirects: never cached, so a cached Location cannot carry one visitor's query string to another.
Header always set Cache-Control "no-cache" "expr=%{REQUEST_STATUS} -ge 300 && %{REQUEST_STATUS} -lt 400 && %{REQUEST_STATUS} -ne 304"
`;

// Archived docs stay out of search results: their HTML says so with a robots meta tag (see
// Layout.astro), but a markdown variant has no <head> to carry one, so it gets the header
// equivalent. Matched on content type rather than the .md extension so the negotiated variant,
// served at the page's own URL on Accept: text/markdown, is covered too. Root-only: an archive's
// own .htaccess is applied after this one and carries no X-Robots-Tag rule to undo it.
const archiveMarkdownNoindexRules = `
# Archived markdown variants: noindex, as the archived HTML is by its robots meta tag.
Header set X-Robots-Tag "noindex" "expr=%{CONTENT_TYPE} =~ m#^text/markdown# && %{REQUEST_URI} =~ m#^/(charts/|studio/)?archive/[0-9]#"
`;

// Long-cache content-addressed assets. Matched on hash SHAPE rather than the /_astro/
// directory so anything unhashed is never cached: a changed hash is a different URL, so a
// fix can never be served stale. Replaces an inert mod_expires block - hence no <IfModule>
// guard here, so a missing module fails loudly rather than silently.
const hashedAssetCacheRules = `
# Content-addressed assets - the filename carries a content hash, so changed content is
# always a different URL. Matched by hash shape, so anything unhashed is not cached.
Header set Cache-Control "public, max-age=604800, s-maxage=31536000" "expr=%{REQUEST_URI} =~ m#/_astro/[^/]+\\.[A-Za-z0-9_-]{8}\\.[a-z0-9]+$# || %{REQUEST_URI} =~ m#/_astro/.*/[0-9a-f]{16}\\.[a-z0-9]+$#"
`;

// Archived Studio versions are never cached; /studio/ itself caches normally.
const studioArchiveNoCacheRules = `
# Archived Studio versions: never cached. Does not apply to /studio/ itself.
Header set Cache-Control "no-cache" "expr=%{REQUEST_URI} =~ m#^/studio/archive/#"
`;

const rootStaticFileCacheRules = `
# Root static files (robots.txt, favicon.ico): unhashed but low-churn, so a moderate
# max-age is enough to cut repeat crawler fetches (SE-189 measured /robots.txt refetched
# ~25x/day with no header at all) without risking a stale copy for long after a real change.
Header set Cache-Control "public, max-age=86400" "expr=%{REQUEST_URI} =~ m#^/(robots\\.txt|favicon\\.ico)$#"
`;

// Unlike hashedAssetCacheRules, these filenames carry no content hash, so a stale copy can
// persist after content changes. A moderate max-age bounds that staleness window instead of
// relying on a release-time cache invalidation step being remembered.
//
// Requires a real static-asset extension, not just the directory name - /example/ and
// /example/index.html are the live demo page (documentNoCacheRules), and since this rule is
// emitted after that one, an unanchored match here would win and override its no-cache with
// a day-long public cache. Anchoring on the file extension makes that impossible by
// construction, rather than relying on rule order to avoid it. Uses ".+" rather than "[^/]+"
// before the extension so nested paths still match (e.g. example-assets/space-company-logos/
// nasa.png, images/ag-logos/png-logos/react.png) - a real example-assets/flags/index.html
// proves the extension allowlist, not the lack of nesting, is what has to keep HTML out.
//
// theme-icons (public/theme-icons/<theme>/<icon>.svg, plus a per-theme <theme>-icons.zip
// bundle) is the same asset class - unhashed, build-time static, never a content page - so it
// shares this rule rather than getting its own. zip is only needed for those bundle downloads;
// none of images/example-assets/example are expected to contain one today, but allowing it
// there too is no more risky than the rest of the allowlist.
//
// "videos" (public/videos/*.json|png here; public/videos/*.mp4|webm on the /studio side)
// belongs for the same reason - and matters beyond grid's own directory: this rule is
// unanchored on the directory segment (matches the substring anywhere in the path, same as
// images/example-assets already did), so it cascades via nested .htaccess merge into
// /charts/* and /studio/* too. Confirmed live: /studio/scripts/*.js and /studio/images/* were
// already getting this header for free through that cascade, but /studio/videos/* was not -
// "videos" was simply missing from the alternation, not a cascade failure.
const staticAssetCacheRules = `
# Images, example-page assets, theme icon downloads, and videos: unhashed filenames, so cap
# staleness with a moderate max-age rather than caching indefinitely.
Header set Cache-Control "public, max-age=86400" "expr=%{REQUEST_URI} =~ m#/(images|example-assets|example|theme-icons|videos)/.+\\.(png|jpe?g|gif|svg|webp|ico|json|xlsx|mp4|webm|zip)$#"
`;

// public/scripts/ (cookie consent, GTM, video/carousel players, the announcement banner,
// etc.) - unhashed filenames, so the same reasoning as staticAssetCacheRules applies.
// Anchored to .js so it can only ever match an actual script file, not a directory or
// anything else that might one day live under /scripts/ - the /example/ bug this rule was
// added alongside showed relying on that never happening is not a safe assumption.
const scriptAssetCacheRules = `
# Static script bundles: unhashed filenames, so cap staleness with a moderate max-age
# rather than caching indefinitely.
Header set Cache-Control "public, max-age=86400" "expr=%{REQUEST_URI} =~ m#/scripts/[^/]+\\.js$#"
`;

// A released archive version is permanently immutable, so unlike every other rule in this
// file this one has no extension allowlist or content-type restriction - everything under it
// can be cached. Emitted before studioArchiveNoCacheRules and getInFlightArchiveRules, both of
// which must keep overriding it for their own scope.
const archiveCacheRules = `
# Released archive versions: fully immutable, so cache literally everything under them
# indefinitely, not just specific asset types. Never applies to /studio/archive/, which stays
# no-cache always (see studioArchiveNoCacheRules) or to a version still listed in the
# in-flight block below, which overrides this back to no-cache for that version only.
Header set Cache-Control "public, max-age=604800, s-maxage=31536000" "expr=%{REQUEST_URI} =~ m#^/(charts/)?archive/[0-9]#"
`;

// Archive builds ship their own .htaccess, which Apache applies after the root one, so any
// Cache-Control rule in it that matches unhashed content would override the root's in-flight
// no-cache and make a release candidate cacheable while it is still under test. The root
// .htaccess already applies every one of these rules to the archives and owns the in-flight
// state, so archive builds emit none of them. Content-hashed assets keep their rule: a changed
// hash is a new URL, so it can never serve a release candidate stale.
const isArchiveBuild = (): boolean => SITE_BASE_URL?.includes('/archive/') ?? false;
const unlessArchiveBuild = (rules: string): string => (isArchiveBuild() ? '' : rules);

// The build's base URL without its trailing slash: '' for the live site, '/archive/<v>' for an
// archive build. Built lazily because the base URL is only resolved at build time.
const getBasePath = (): string => (SITE_BASE_URL ?? '').replace(/\/$/, '');

// The base as a regex fragment: its dots (36.2.0) are literal, not any-character.
const getBasePattern = (): string => getBasePath().replace(/\./g, '\\.');

// The canonical-host redirect target. In a per-directory .htaccess, $1 is the path below that
// directory, so an archive build would lose its /archive/<v>/ prefix and land on the current
// docs; %{REQUEST_URI} is always the full path. The live site keeps its original form.
const getHostCanonicalTarget = (): string =>
    isArchiveBuild() ? 'https://www.ag-grid.com%{REQUEST_URI}' : 'https://www.ag-grid.com/$1';

// Delimiters for the in-place patchable block. Exported so the patch script and the tests
// use the same literals rather than duplicating them.
export const IN_FLIGHT_BEGIN = '# BEGIN in-flight release archives - patched in place, do not edit by hand';
export const IN_FLIGHT_END = '# END in-flight release archives';

// Archives under release testing must serve fresh, so they opt out of the caching released
// archives get. Emitted last, so it overrides the archive exclusion and the hashed-asset rule.
export function getInFlightArchiveRules(grid: string | null, charts: string | null): string {
    // Single backslash in the emitted regex, so Apache reads a literal dot.
    const escape = (v: string) => v.replace(/\./g, '\\.');
    const rules = [
        grid && `Header set Cache-Control "no-cache" "expr=%{REQUEST_URI} =~ m#^/archive/${escape(grid)}/#"`,
        charts && `Header set Cache-Control "no-cache" "expr=%{REQUEST_URI} =~ m#^/charts/archive/${escape(charts)}/#"`,
    ].filter(Boolean);
    // Always emitted, so scripts/uncached-archives.mjs can patch the deployed file between them.
    return `
${IN_FLIGHT_BEGIN}${rules.length ? '\n' + rules.join('\n') : ''}
${IN_FLIGHT_END}
`;
}

const modDeflateRules = `
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
    AddOutputFilterByType DEFLATE application/x-font
    AddOutputFilterByType DEFLATE application/x-font-opentype
    AddOutputFilterByType DEFLATE application/x-font-otf
    AddOutputFilterByType DEFLATE application/x-font-truetype
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/markdown
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
</IfModule>
`;

// mod_deflate tags a compressed response's ETag with a "-gzip" suffix but compares If-None-Match
// against the unsuffixed ETag, so a compressed page never revalidates to a 304: every browser and
// CloudFront revalidation re-downloads the full body (If-None-Match outranks If-Modified-Since).
// Stripping the suffix from the request validators makes them match again. 'edit*' replaces every
// occurrence, so a list of ETags and weak (W/) ETags are covered; anything else passes unchanged.
// DeflateAlterETag would fix this at the source but is not allowed in .htaccess.
// Root-only: mod_headers merges this into every directory below, archives included.
const compressedRevalidationRules = `
# Let compressed responses revalidate: drop mod_deflate's "-gzip" ETag suffix from If-None-Match.
RequestHeader edit* If-None-Match '-gzip"' '"'
`;

// SE-80: the RewriteCond/RewriteRule lines that serve the per-page markdown variant
// on `Accept: text/markdown`, shared by the production and staging .htaccess so the
// rule can't drift between them. Indented 4 spaces for use inside a mod_rewrite block.
// The negotiation is an internal rewrite (no redirect, URL unchanged), gated by an
// on-disk check so a path without a .md is left untouched. %1 is the page path
// captured below, reused in both the -f test and the rewrite target.
//
// The path alternation is derived from GRID_MARKDOWN_PAGE_GROUPS — the same registry the
// dev-server plugin uses — so the two can't disagree about what is negotiable.
//
// Prefixed with the build's base URL, so an archive build (/archive/<v>/) negotiates under its
// own path exactly as the live site does at the root - the same approach ag-charts takes. An
// empty base emits the original root-anchored rules unchanged.
//
// The negotiable page paths below the base. Grouped when prefixed, since the alternation
// has top-level `|` branches that the prefix must apply to as a whole.
const getMarkdownPagesBelowBase = (): string => {
    const basePattern = getBasePattern();
    return basePattern ? `${basePattern.slice(1)}/(?:${markdownPathAlternation()})` : markdownPathAlternation();
};

const getMarkdownNegotiationRules = (): string => {
    const basePath = getBasePath();
    return `    RewriteCond %{HTTP_ACCEPT} text/markdown
    RewriteCond %{REQUEST_URI} ^/(${getMarkdownPagesBelowBase()})/?$
    RewriteCond %{DOCUMENT_ROOT}/%1.md -f
    RewriteRule ^ /%1.md [L]

    # SE-80: the homepage twin (/ -> /index.md). Handled separately because the root URL has no
    # path segment to capture in %1; ^/$ matches only the root, so no other route is affected.
    RewriteCond %{HTTP_ACCEPT} text/markdown
    RewriteCond %{REQUEST_URI} ^${getBasePattern()}/$
    RewriteCond %{DOCUMENT_ROOT}${basePath}/index.md -f
    RewriteRule ^ ${basePath}/index.md [L]`;
};

// Staging has no redirect rewrites, so negotiation gets its own minimal mod_rewrite
// block. Production embeds the same rules inside its existing block instead.
const getMarkdownNegotiationBlock = (): string => `<IfModule mod_rewrite.c>
    RewriteEngine On

    # SE-80: content-negotiate docs pages to their markdown variant on Accept: text/markdown.
${getMarkdownNegotiationRules()}
</IfModule>`;

// SE-80: negotiated pages content-negotiate on the Accept header (see the markdown rewrite
// above), so shared caches must key on it — otherwise they could serve the markdown
// variant to a browser, or HTML to an agent. Scoped to the negotiated paths so the rest of
// the site keeps its default (URL-only) cache key. Derived from the same registry and base
// as the rewrite rule, so the two stay in lockstep.
//
// The HTML variant is served through mod_dir's DirectoryIndex, an internal redirect that has
// already rewritten REQUEST_URI to <page>/index.html by the time this header is applied, so
// that form must match too - otherwise only the markdown variant (whose Vary mod_rewrite adds
// itself) carries Vary: Accept, and a shared cache holding the HTML would serve it to agents.
const getMarkdownVaryHeader =
    (): string => `# SE-80: negotiated pages content-negotiate on Accept (see the markdown rewrite), so shared
# caches must key on it. Scoped to the negotiated paths so the rest of the site keeps its default.
<If "%{REQUEST_URI} =~ m#^/(?:${getMarkdownPagesBelowBase()})(?:/|/index\\.html)?$# || %{REQUEST_URI} =~ m#^${getBasePattern()}/(?:index\\.html)?$#">
    Header append Vary Accept
</If>`;

// SE-81: agent-useful Link response header. Gives AI agents a machine-readable pointer
// to the key resources without parsing the page first: rel=describedby -> /llms.txt,
// rel=sitemap -> the sitemap index, and rel=related -> the MCP server docs. Single-token
// rel values are unquoted per RFC 8288, which keeps the directive free of escaped quotes.
// Scoped to successful HTML documents via the expr (evaluated at response time): the
// header is document metadata, so applying it to assets, downloads, redirects and error
// responses only wastes bandwidth and, for rel=describedby, wrongly describes non-documents.
// The Content-Type check alone is not enough: the custom `ErrorDocument 404 /404.html` is a
// real text/html file served via an internal subrequest, so a 404 would still match on
// content-type and leak the header (verified on staging). The `%{REQUEST_STATUS} == 200`
// guard restricts it to genuine 200 documents — REQUEST_STATUS reflects the final response
// status (404 for the error page), confirmed against Apache 2.4. Shared by the staging and
// production .htaccess so the header can be verified on staging.
const agentLinkHeader = `Header set Link "</llms.txt>; rel=describedby, </sitemap-index.xml>; rel=sitemap, <https://www.ag-grid.com/javascript-data-grid/mcp-server/>; rel=related" "expr=%{REQUEST_STATUS} == 200 && %{CONTENT_TYPE} =~ m#^text/html#"`;

const LIVE_ORIGIN = 'https://www.ag-grid.com';

// Separate sites on the same host - charts keeps archives of its own, the blog has none - so a
// grid archive holds no copy of their pages.
const OUTSIDE_GRID_ARCHIVE = /^\/(?:charts|blog)\//;

// Where a single-hop rewrite lands from this build. The live site keeps its www target. An archive
// build lands on the same page inside its own version, still as an absolute www URL so the rule
// keeps reaching the canonical URL in ONE hop from any host or scheme; a target with no copy in the
// archive (charts, blog, anything off-site) gives null and the rule is left out, so no rule ever
// sends an archive URL out of its version. A target is final on the live site, and an archive's
// rules are a base-aware subset of the live ones, so it is final inside the archive too.
const getSingleHopTarget = (to: string): string | null => {
    if (!isArchiveBuild()) {
        return to;
    }
    const path = to.startsWith(`${LIVE_ORIGIN}/`) ? to.slice(LIVE_ORIGIN.length) : null;
    return path && !OUTSIDE_GRID_ARCHIVE.test(path) ? `${LIVE_ORIGIN}${getBasePath()}${path}` : null;
};

// The per-directory pattern sees the path below this .htaccess's directory, so the `from` needs no
// base: the same pattern matches /<from> on the live site and /archive/<v>/<from> in an archive.
const getSingleHopRewriteRules = (): string[] =>
    SITE_SINGLE_HOP_REWRITES.flatMap((r) => {
        const to = getSingleHopTarget(r.to);
        if (!to) {
            return [];
        }
        const from = r.from.replace(/^\//, '').replace(/\./g, '\\.');
        // Targets carrying a URL fragment need [NE] (noescape) so mod_rewrite emits the '#' verbatim in
        // the Location header. Without it mod_rewrite escapes '#' to %23, turning the anchor into a
        // literal path segment (a broken URL).
        const flags = to.includes('#') ? 'R=301,NE,L' : 'R=301,L';
        return [`    RewriteRule "^/?${from}$" "${to}" [${flags}]`];
    });

// SE-64/SE-66 single-hop chain shortening. Hosts other than www/apex skip the lot, so the skip
// count is the number of rules emitted - which an archive build trims to the targets it holds a copy
// of.
//
// Nothing here may target a /charts/ or /studio/ path: those are separate sites whose own
// .htaccess carries a mod_rewrite block, which REPLACES these rules for every request below it.
// A root rule for them never runs (verified in real Apache), so the child .htaccess owns them.
const getSiteRewriteRules = (): string => {
    const singleHopRules = getSingleHopRewriteRules();
    return `
    RewriteCond %{HTTP_HOST} !^(www\\.)?ag-grid\\.com$ [NC]
    RewriteRule ^ - [S=${singleHopRules.length}]

    # SE-64 / SE-66: single-hop chain shortening. These run before the https-upgrade and
    # host-swap so a matching legacy path on either www.ag-grid.com or ag-grid.com (any
    # scheme) lands on its final www URL in ONE 301. Inbound query strings are preserved
    # (targets carry none). See SITE_SINGLE_HOP_REWRITES in redirects.ts.
${singleHopRules.join('\n')}
`;
};

// blog.ag-grid.com -> www.ag-grid.com/blog/. Every target is a live blog or docs URL, so an
// archive build swaps the host instead (see getArchiveBlogHostRule).
const blogHostRedirectRules = `    # blog.ag-grid.com -> www.ag-grid.com/blog/ (SE-86/SE-91). Host-scoped, so www and
    # apex are unaffected. ORDER MATTERS: specific rules first, catch-all host swap last.
    # Targets are final destinations, not intermediate slugs -- SE-86 requires one hop.
    # The 410s are deliberate: those posts are gone, not moved. They swallow any sub-path and
    # are [NC], because a 410 that only matches an enumerated suffix set is walkable: /feed/,
    # /amp/amp/ and case variants otherwise fell through to the catch-all and www's own
    # case-normalising redirect then served the live page, handing the spam links their equity.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?whats-new-in-ag-grid-v24(?:/.*)?$ - [R=410,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/react(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/react-data-grid/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/react(?:/amp|/page/[0-9]+)?/?$ https://www.ag-grid.com/blog/tag/react-data-grid/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?conferences-ag-grid-amsterdam-june-2022(?:/amp)?/?$ https://www.ag-grid.com/blog/js-nation-and-react-summit-june-2022-overview/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?getting-more-from-your-datagrid-introducing-adaptable(?:/amp)?/?$ https://www.ag-grid.com/blog/adaptable-tools-demo-and-interview/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?javascript-grid-comparison-column-pinning-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/column-pinning/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?whats-new-in-ag-studio-2(?:-0)?(?:/amp)?/?$ https://www.ag-grid.com/blog/whats-new-in-ag-studio-2-0-javascript-embedded-analytics/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?whats-new-in-ag-studio-2-1(?:/amp)?/?$ https://www.ag-grid.com/blog/whats-new-in-ag-studio-2-1-javascript-embedded-analytics/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?showcase(?:/amp)?/?$ https://www.ag-grid.com/blog/ag-grid-showcase-examples-demos-samples-and-extensions/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?using-playwright-to-test-ag-grid-react-apps(?:/amp)?/?$ https://www.ag-grid.com/blog/writing-e2e-tests-for-ag-grid-react-tables-with-playwright/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?using-ag-grid-with-react-and-next-js(?:/amp)?/?$ https://www.ag-grid.com/blog/using-ag-grid-with-next-js-to-build-a-react-table/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?condtional-formatting-for-cells-in-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/conditional-formatting-for-cells-in-ag-grid/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?angular-2-0-web-components-and-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/angular-data-grid/getting-started/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?integrated-charts-community-vs-enterprise(?:/amp)?/?$ https://www.ag-grid.com/blog/enhancing-ag-grid-enterprise-with-ag-charts-enterprise/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?vuestic-ui-app-with-ag-grid-tutorial(?:/amp)?/?$ https://epicmax.co/blog/vuestic-ui-with-ag-grid [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/2018/11/29/inside-fiber https://www.ag-grid.com/blog/inside-fiber-an-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/ [R=301,NC,L]

    # SE-86 residual fix: retired posts previously fell through to the catch-all, which sends
    # them to /blog/<old-slug> -- Ghost's own redirects.json then adds a second hop to the real
    # destination. These specific rules resolve each in one hop, per Nick Redding's report.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?a-plain-english-introduction-to-json-web-tokens-jwt-what-it-is-and-what-it-isnt(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?ag-grid-on-the-angular-plus-show-podcast(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?ag-grid-vuex-creating-a-modern-user-widget(?:/amp)?/?$ https://www.ag-grid.com/vue-data-grid/getting-started/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?angular-grid-reports-formatted-values-and-links(?:/amp)?/?$ https://www.ag-grid.com/angular-data-grid/value-formatters/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?build-email-client-with-ag-grid-like-gmail(?:/amp)?/?$ https://www.ag-grid.com/blog/ag-grid-showcase-examples-demos-samples-and-extensions/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?building-crud-in-ag-grid-with-angular-and-ngxs(?:/amp)?/?$ https://www.ag-grid.com/blog/building-crud-in-ag-grid-with-angular-ngrx/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?building-crud-in-ag-grid-with-angular-and-redux(?:/amp)?/?$ https://www.ag-grid.com/blog/building-crud-in-ag-grid-with-angular-ngrx/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?building-crud-operations-with-sequelize-angular-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/building-crud-in-ag-grid-with-angular-ngrx/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?creating-a-react-tile-slider-puzzle(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?custom-angular-directives(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?customising-react-data-grid-with-hooks-and-functions(?:/amp)?/?$ https://www.ag-grid.com/blog/learn-to-customize-react-grid-in-less-than-10-minutes/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?cypress-plugin-for-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/end-to-end-testing-for-ag-grid-in-react-with-cypress/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?football-stats-direct(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?football-stats-direct-interview(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?free-online-training-for-ag-grid-in-react-and-angular(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/getting-started/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?game-of-charts(?:/amp)?/?$ https://www.ag-grid.com/charts/gallery/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?heres-why-column-pinning-in-react-datagrid-by-ag-grid-wins-over-competition(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/column-pinning/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?how-to-write-a-podcast-app-using-react(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?implementing-infinite-loading-in-an-angular-store-application(?:/amp)?/?$ https://www.ag-grid.com/angular-data-grid/infinite-scrolling/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?proof-trading-case-study(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?proof-trading-webrush-podcast-using-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?react-data-grid-example-projects(?:/amp)?/?$ https://www.ag-grid.com/blog/ag-grid-showcase-examples-demos-samples-and-extensions/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?react-data-grid-use-hooks-to-build-a-pomodoro-app(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?react-redux-trading-platform(?:/amp)?/?$ https://www.ag-grid.com/blog/persisting-ag-grid-state-with-react-redux/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?react-ui-animation-getting-started-with-react-spring(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?subscribing-live-data-stream-ag-grid-rxjs-observables(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/data-update-high-frequency/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?take-full-control-of-editing-in-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/next-level-cell-editing-in-ag-grid-with-crud-and-react-hooks/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?testing-ag-grid-react-jest-enzyme(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/testing/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?testing-ag-grid-with-taiko-automation-tool(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/testing/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?type-checking-and-auto-completion-in-plunker(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?upcoming-changes-to-ag-grid-angular-in-v28(?:/amp)?/?$ https://www.ag-grid.com/angular-data-grid/upgrading-to-ag-grid-28/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?upgrading-to-ag-grid-v25-server-side-row-model(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/server-side-model/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?using-ag-grid-inside-a-vuejs-application(?:/amp)?/?$ https://www.ag-grid.com/vue-data-grid/getting-started/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?using-ag-grid-react-ui-with-remix-run(?:/amp)?/?$ https://www.ag-grid.com/react-data-grid/getting-started/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?using-react-testing-library-with-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/unit-testing-ag-grid-react-tables-with-react-testing-library-and-vitest/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?webpack-tutorial-understanding-ngtools-webpack(?:/amp)?/?$ https://www.ag-grid.com/blog/webpack-tutorial-understanding-how-it-works/ [R=301,NC,L]

    # WordPress-era permalinks. Every /index.php/ and bare dated path in the archive was
    # checked and its derived target status-verified: 15 resolve, 6 needed an explicit
    # remap because the slug changed. The remaps MUST precede the generic dated rule.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/get-started-with-react-grid-in-5-minutes(?:/feed)?/?$ https://www.ag-grid.com/blog/react-get-started-with-react-grid-in-5-minutes/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/customise-react-grid(?:/feed)?/?$ https://www.ag-grid.com/blog/learn-to-customize-react-grid-in-less-than-10-minutes/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/customize-angular-grid(?:/feed)?/?$ https://www.ag-grid.com/blog/learn-to-customize-angular-grid-in-less-than-10-minutes/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/customize-javascript-grid(?:/feed)?/?$ https://www.ag-grid.com/blog/learn-to-customize-javascript-grid-in-less-than-10-minutes/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm(?:-in-react)?(?:/feed)?/?$ https://www.ag-grid.com/blog/inside-fiber-an-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/ [R=301,NC,L]

    # Generic dated permalink: the slug survived the WordPress -> Ghost move.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?[0-9]{4}/[0-9]{2}/[0-9]{2}/(.+?)(?:/feed)?/?$ https://www.ag-grid.com/blog/$1/ [R=301,NC,L]

    # WordPress categories became Ghost tags. "react" was itself renamed, so it is
    # mapped directly -- via /blog/tag/react/ it would take a second hop.
    # Feed variants of the WordPress taxonomy URLs. These come FIRST: the generic rules
    # below capture with (.+?), which swallows a trailing /feed and lands on
    # /blog/<taxonomy>/<term>/feed/ -- a 404. Ghost serves /rss, so feeds map to /rss
    # exactly as the non-index.php equivalents do. "react" is additionally a renamed tag.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/(?:category|tag)/react(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/react-data-grid/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/category/([^/]+)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/$1/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/((?:tag|author)/[^/]+)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/$1/rss/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/category/react/?$ https://www.ag-grid.com/blog/tag/react-data-grid/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/category/(.+?)/?$ https://www.ag-grid.com/blog/tag/$1/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/tag/react/?$ https://www.ag-grid.com/blog/tag/react-data-grid/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/(author|tag|page)/(.+?)(?:/feed)?/?$ https://www.ag-grid.com/blog/$1/$2/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?index\\.php/(?:comments/)?feed/?$ https://www.ag-grid.com/blog/rss/ [R=301,NC,L]

    # Retired posts. Each served content once but has no surviving equivalent, so the
    # catch-all would 301 into a 404 -- worse than a plain 404, because it asserts a
    # destination exists. Decision 2026-08-21: declare them Gone.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?avoiding-react-18-double-mount(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?email-sign-up(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?5-tips-for-fixing-a-memory-leak-in-angular(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?angular-nations-ag-grid-music-video(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?deleting-selected-rows-and-cell-ranges-via-key-press(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?untitled(?:/.*)?$ - [R=410,NC,L]

    # WordPress/Ghost infrastructure endpoints with no equivalent. 410 rather than a
    # 301 onto a /blog/ 404.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(?:index\\.php/)?wp-json(?:/.*)?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?wp-includes/.*$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?wp-content/plugins/.*$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?rsslatest\\.xml$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?\\.well-known/nodeinfo/?$ - [R=410,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?\\.ghost/activitypub/.*$ - [R=410,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?ag-grid-vs-datatables(?:/.*)?$ - [R=410,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?private(?:/amp)?/?$ https://www.ag-grid.com/blog/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:angular-grid|angular-table)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/angular/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:angular-grid|angular-table)(?:/amp|/page/[0-9]+)?/?$ https://www.ag-grid.com/blog/tag/angular/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:react-grid|react-table)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/react-data-grid/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:react-grid|react-table)(?:/amp|/page/[0-9]+)?/?$ https://www.ag-grid.com/blog/tag/react-data-grid/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:vue-grid|vue-table)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/vuejs/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:vue-grid|vue-table)(?:/amp|/page/[0-9]+)?/?$ https://www.ag-grid.com/blog/tag/vuejs/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:enzyme|jest)(?:/rss|/feed)/?$ https://www.ag-grid.com/blog/tag/testing/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:enzyme|jest)(?:/amp|/page/[0-9]+)?/?$ https://www.ag-grid.com/blog/tag/testing/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?tag/(?:ag-grid|column-header|columns|data-grid|data-table|date|datepicker|detail|editing|export|filtering|formatting|graphql|localstorage|master|mongodb|multi-line|pdf|range-selection|range-selection-styles|redux|row-background-color|row-selection|row-styling|server-side-row-model|sorting|state|styling-table-rows|tabs|vuex|web-development)(?:/.*)?$ - [R=410,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(.+?)/amp/?$ https://www.ag-grid.com/blog/$1/ [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?content/(.*)$ https://www.ag-grid.com/blog/content/$1 [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(page/[0-9]+|(?:tag|author)/[^/]+/page/[0-9]+)/?$ https://www.ag-grid.com/blog/$1/ [R=301,NC,L]
    # /feed is the WordPress-era spelling and Ghost answers it with its own 301 to /rss,
    # so mapping feed -> feed cost a second hop. Send feed straight to rss.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?feed/?$ https://www.ag-grid.com/blog/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?((?:tag|author)/[^/]+)/feed/?$ https://www.ag-grid.com/blog/$1/rss/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(rss|(?:tag|author)/[^/]+/rss)/?$ https://www.ag-grid.com/blog/$1/ [R=301,NC,L]
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(sitemap[^/]*\\.xml)$ https://www.ag-grid.com/blog/$1 [R=301,NC,L]

    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^/?(.*)$ https://www.ag-grid.com/blog/$1 [R=301,NC,L]`;

// blog.ag-grid.com/archive/<v>/... was never a blog URL, and blogHostRedirectRules would send it
// to /blog/<path below the archive> - a 404. The archive itself lives on www, so canonicalise
// the host and keep the path, exactly as for the other alias hosts.
const getArchiveBlogHostRule =
    (): string => `    # blog.ag-grid.com/archive/<v>/... is archive content on the wrong host: keep the path.
    RewriteCond %{HTTP_HOST} ^blog\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,NC,L]`;

// The partnership tracker is a current-site URL, so archive builds leave it out.
const theoPartnershipRedirect = `    # temporary redirect for tracking of partnership   
    RedirectMatch 302 ^/theo/$ https://www.ag-grid.com/
    `;

// Unlike per-directory mod_rewrite, mod_alias matches the full URL-path, so every pattern
// must carry the base: `from` gets it via urlWithBaseUrl and `fromPattern` has it spliced in
// here (as ag-charts and Studio do). An archive must never redirect out of its own version, so
// an archive build also drops every redirect whose target is absolute - a live (or external)
// URL - and keeps only those that resolve inside the archive. An empty base (the live site)
// leaves every rule unchanged.
const toBaseAwarePattern = (fromPattern: string): string =>
    fromPattern.startsWith('^') ? `^${getBasePattern()}${fromPattern.slice(1)}` : `${getBasePattern()}${fromPattern}`;

const leavesArchive = (redirect: Redirect): boolean => 'to' in redirect && /^https?:\/\//.test(redirect.to);

const getSite301RedirectRules = (): string =>
    SITE_301_REDIRECTS.filter((redirect) => !(isArchiveBuild() && leavesArchive(redirect)))
        .map((redirect) => {
            const { from, fromPattern, to, gone } = redirect as any;
            if (!from && !fromPattern) {
                // eslint-disable-next-line no-console
                console.warn('Missing `from` in redirect', redirect);
                return;
            }
            // 410 Gone: permanently removed, no target.
            if (gone) {
                return from
                    ? `    Redirect 410 ${urlWithBaseUrl(from)}`
                    : `    RedirectMatch 410 "${toBaseAwarePattern(fromPattern)}"`;
            }
            if (!to) {
                // eslint-disable-next-line no-console
                console.warn('Missing `to` in redirect', redirect);
                return;
            }
            return from
                ? `    Redirect 301 ${urlWithBaseUrl(from)} ${urlWithBaseUrl(to)}`
                : `    RedirectMatch 301 "${toBaseAwarePattern(fromPattern)}" "${urlWithBaseUrl(to)}"`;
        })
        .filter(Boolean)
        .join('\n');

// Lazily built: the redirect generation resolves urlWithBaseUrl (which needs the
// build-time base URL), so it must not run at module import — only when the
// production .htaccess is actually generated.
//
// Archive builds ship this file into /archive/<v>/, and a per-directory RewriteRule only sees
// the path below that directory, so a root-relative rule there silently drops the archive
// prefix. Every rule here therefore either keeps the request inside the archive (host
// canonicalisation via %{REQUEST_URI}, single-hop rewrites onto the archive's own copy of their
// target, base-aware index.php/trailing-slash fixes, markdown negotiation, base-aware redirects)
// or is a current-site rule left out of archive builds.
const getModRewriteRules = (): string => `
<IfModule mod_rewrite.c>
    RewriteEngine On
${getSiteRewriteRules()}
    # Always use https for secure connections (scoped to www/bare domain only
    # so that charts.ag-grid.com and studio.ag-grid.com are not affected)
    RewriteCond %{HTTP_HOST} ^(www\\.)?ag-grid\\.com$ [NC]
    RewriteCond %{SERVER_PORT} 80
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]

    # Redirect non-www to www
    RewriteCond %{HTTP_HOST} ^ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]

    # Redirect legacy Phase 1 subdomains to www
    RewriteCond %{HTTP_HOST} ^angulargrid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]
    RewriteCond %{HTTP_HOST} ^angular-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]
    RewriteCond %{HTTP_HOST} ^javascript-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]
    RewriteCond %{HTTP_HOST} ^react-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]

    # Redirect angulargrid.com to www.ag-grid.com
    RewriteCond %{HTTP_HOST} ^angulargrid\\.com$ [OR]
    RewriteCond %{HTTP_HOST} ^www\\.angulargrid\\.com$
    RewriteRule ^(.*)$ ${getHostCanonicalTarget()} [R=301,L]

${isArchiveBuild() ? getArchiveBlogHostRule() : blogHostRedirectRules}

    # SE-80: content-negotiate docs pages to their per-page markdown variant when a
    # client asks for it via Accept: text/markdown (typically an AI agent — browsers
    # never send this, so HTML stays the default). The .md files are generated at
    # build time next to the HTML (see [pageName].md.ts). This is an internal rewrite
    # (no redirect, URL unchanged), gated by an on-disk check so a path without a .md
    # is left untouched. Placed after host/https canonicalization but before the
    # trailing-slash 301 so the canonical (slashed) docs URL negotiates in one hop.
${getMarkdownNegotiationRules()}

    # Remove "index.php" from URLs
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^index\\.php$ ${getBasePath()}/ [R=301,L]

    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^(.*)/index\\.php$ ${getBasePath()}/$1/ [R=301,L]

    # Add trailing slash for directories
    RewriteCond %{REQUEST_URI} /+[^\\.]+$
    RewriteRule ^(.+[^/])$ %{REQUEST_URI}/ [R=301,L]

    # Redirect paths after a php file (ie index.php/path/path => index.php)
    # arguments will be carried over (ie index.php?abc=true will stay as is)
    RewriteRule ^(.*)\\.php(\\/.+)$ ${getBasePath()}/$1.php [R=301,L]
 
${unlessArchiveBuild(theoPartnershipRedirect)}
${getSite301RedirectRules()}

</IfModule>
`;

const baseRules = `### AUTOGENERATED DO NOT EDIT
ErrorDocument 404 /404.html

# add MIME types for serving example files
AddType text/javascript jsx
AddType application/typescript ts tsx
AddType application/x-gzip .gz .tgz

# Apache has no built-in .webp type, so without this the images are served with no Content-Type.
AddType image/webp .webp

# serve the per-page LLM markdown files as markdown
AddType text/markdown md
# ...as UTF-8, so glyphs like ✓/✗ in generated tables aren't mojibaked by a
# Latin-1 fallback (the .md endpoint sets this charset; static hosting must too).
AddCharset utf-8 .md
`;

function getStagingHtaccessContent(inFlightArchiveRules: string): string {
    return `${baseRules}
${documentNoCacheRules}
${redirectNoCacheRules}
${studioArchiveNoCacheRules}
${rootStaticFileCacheRules}
${inFlightArchiveRules}
${compressedRevalidationRules}

${getMarkdownNegotiationBlock()}

${getMarkdownVaryHeader()}

${agentLinkHeader}

# Content-Security-Policy — enforced, path-scoped. Unsets the legacy wildcard CSP on
# the staging vhost so this tightened policy is the only one in effect.
${getScopedCspHtaccessBlock({ env: 'staging' }, 'enforce')}

${getBranchBuildsCspIfOverride('enforce')}

Options -Indexes
`;
}

function getProductionHtaccessContent(inFlightArchiveRules: string): string {
    return `${baseRules}
${documentNoCacheRules}
${unlessArchiveBuild(redirectNoCacheRules)}
${unlessArchiveBuild(archiveMarkdownNoindexRules)}
${hashedAssetCacheRules}
${unlessArchiveBuild(staticAssetCacheRules)}
${unlessArchiveBuild(scriptAssetCacheRules)}
${unlessArchiveBuild(archiveCacheRules)}
${studioArchiveNoCacheRules}
${rootStaticFileCacheRules}
${inFlightArchiveRules}
${modDeflateRules}
${unlessArchiveBuild(compressedRevalidationRules)}
${getModRewriteRules()}

# X-Frame-Options intentionally omitted: it can't allow-list subdomains, so it blocks
# blog.ag-grid.com (and other *.ag-grid.com) from embedding examples. Clickjacking
# protection is handled by the CSP frame-ancestors directive instead (see cspRules.ts).
Header always set Referrer-Policy "${REFERRER_POLICY_VALUE}"
Header always set Permissions-Policy "${PERMISSIONS_POLICY_VALUE}"

${getMarkdownVaryHeader()}

${agentLinkHeader}

${getProductionCspContent()}

# CORS settings — use 'set' (not 'add') so any value inherited from the server vhost is
# replaced rather than appended. 'add' produced a duplicate Access-Control-Allow-Origin
# header ('*, *'), which browsers reject as multiple values (RTI-3400).
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET,POST,OPTIONS,DELETE,PUT"

Options -Indexes
`;
}

function getProductionCspContent(): string {
    if (PRODUCTION_CSP_PHASE === 'enforce') {
        return `# Content-Security-Policy — enforced, path-scoped (the report-only validation window
# for removing 'unsafe-eval' from the main-site policy is complete). The block unsets
# the inherited headers (incl. the legacy wildcard CSP on the vhost) and sets this
# tightened policy as the enforced CSP. If the vhost wildcard lingers as a separate
# header, browsers enforce the intersection, so the tightened policy still wins;
# removing the vhost wildcard line is a follow-up infra cleanup.
${getScopedCspHtaccessBlock({ env: 'production' }, 'enforce')}`;
    }
    return `# Content-Security-Policy — dual policy while removing 'unsafe-eval' from the
# main-site policy is validated: keep enforcing the previous tightened policy (which
# allows 'unsafe-eval' on every page) and report violations of the path-scoped split
# via Report-Only. The Report-Only <If> override matters: without it, every
# example-runner page would report eval violations and drown the signal.
${getCspHtaccessBlock({ env: 'production', scope: 'examples' }, 'enforce')}

# The campaign pages' embedded Bryntum demo needs the bryntum.com origin allowed even
# during the report-only window: the enforced policy above does not include it, so
# re-set the enforced header for /campaigns/ here (still without 'unsafe-eval').
${getCampaignsCspIfOverride({ env: 'production' }, 'enforce')}

${getScopedCspHtaccessBlock({ env: 'production' }, 'report-only')}`;
}

/**
 * Build the complete set of `/blog/` security headers for the Apache VHOST on the Ghost box.
 *
 * This is the counterpart to the generated `.htaccess` for a path the `.htaccess` cannot
 * govern. `/blog/` is reverse-proxied to Ghost, so a request there is mapped to the proxy
 * handler and never reads the docroot file, and `<If>` never fires on the response. Every
 * line here therefore carries mod_headers' `expr=` condition instead, and belongs in the
 * vhost rather than in getHtaccessContent's output.
 *
 * Deploy to the Ghost/primary box only. The Mirror box deliberately sets no /blog/ headers:
 * it proxies to this box's Apache, so it inherits these, and setting its own would produce a
 * second copy of each (see the `unset` note below).
 *
 * Every header is `unset` before being `set`. On the Mirror path a request traverses two
 * Apache instances; `always` writes to err_headers_out while the upstream copy sits in
 * headers_out, and Apache emits both tables — so `set` alone appends rather than replaces.
 * Duplicate CSP headers are the dangerous case, because browsers enforce their intersection.
 *
 * X-Robots-Tag is unset with no matching `set`, deliberately. /blog/ carried
 * "noindex, nofollow" while the migrated instance was staged alongside the live blog; that
 * must be gone now the old URLs redirect here, since a page that is both redirected-to and
 * noindexed is invisible to search. The bare `unset` is not redundant — it strips any copy
 * arriving from the upstream Apache on the Mirror path.
 */
export function getBlogVhostHeaderFragment(options: { env: CspEnv }, mode: CspMode): string {
    const condition = `"expr=${BLOG_PATH_CONDITION}"`;
    return [
        '# Security headers for /blog/ — GENERATED, do not hand-edit.',
        '#   npx tsx documentation/ag-grid-docs/scripts/csp/generate-csp.ts --env=production --mode=enforce --format=vhost --scope=blog',
        '# Paste inside the *:443 ag-grid.com <VirtualHost> on the Ghost box only.',
        '',
        '# /blog/ must NOT be noindexed: the old URLs 301 here. Unset with no matching set, which',
        '# also strips any copy inherited from the upstream Apache on the Mirror path.',
        `Header always unset X-Robots-Tag ${condition}`,
        `Header always unset Referrer-Policy ${condition}`,
        `Header always set Referrer-Policy "${REFERRER_POLICY_VALUE}" ${condition}`,
        `Header always unset Permissions-Policy ${condition}`,
        `Header always set Permissions-Policy "${PERMISSIONS_POLICY_VALUE}" ${condition}`,
        getBlogCspExprOverride(options, mode),
    ].join('\n');
}

// A build always emits an EMPTY in-flight block; the deployed root .htaccess owns that state.
// The archive options exist only so the tests can generate the populated form.
export function getHtaccessContent(options: {
    env: HtaccessEnv;
    uncachedGridArchive?: string | null;
    uncachedChartsArchive?: string | null;
}): string {
    const inFlight = getInFlightArchiveRules(
        options.uncachedGridArchive ?? null,
        options.uncachedChartsArchive ?? null
    );
    return options.env === 'staging' ? getStagingHtaccessContent(inFlight) : getProductionHtaccessContent(inFlight);
}
