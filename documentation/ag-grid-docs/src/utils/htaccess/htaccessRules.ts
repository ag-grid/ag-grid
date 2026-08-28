// Relative rather than aliased: this module is pulled in by the agHtaccessGen integration, which
// astro.config.mjs bundles without tsconfig path resolution (as with plugins/agDevMarkdownNegotiation).
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
// and cheaper to leave cached.
const documentNoCacheRules = `
# Current pages: always revalidate. Excludes /archive/<v>/ which is immutable.
Header set Cache-Control "no-cache" "expr=%{CONTENT_TYPE} =~ m#^text/html# && !( %{REQUEST_URI} =~ m#^/(charts/|studio/)?archive/[0-9]# )"
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

// SE-80: the RewriteCond/RewriteRule lines that serve the per-page markdown variant
// on `Accept: text/markdown`, shared by the production and staging .htaccess so the
// rule can't drift between them. Indented 4 spaces for use inside a mod_rewrite block.
// The negotiation is an internal rewrite (no redirect, URL unchanged), gated by an
// on-disk check so a path without a .md is left untouched. %1 is the page path
// captured below, reused in both the -f test and the rewrite target.
//
// The path alternation is derived from GRID_MARKDOWN_PAGE_GROUPS — the same registry the
// dev-server plugin uses — so the two can't disagree about what is negotiable.
const markdownNegotiationRules = `    RewriteCond %{HTTP_ACCEPT} text/markdown
    RewriteCond %{REQUEST_URI} ^/(${markdownPathAlternation()})/?$
    RewriteCond %{DOCUMENT_ROOT}/%1.md -f
    RewriteRule ^ /%1.md [L]

    # SE-80: the homepage twin (/ -> /index.md). Handled separately because the root URL has no
    # path segment to capture in %1; ^/$ matches only the root, so no other route is affected.
    RewriteCond %{HTTP_ACCEPT} text/markdown
    RewriteCond %{REQUEST_URI} ^/$
    RewriteCond %{DOCUMENT_ROOT}/index.md -f
    RewriteRule ^ /index.md [L]`;

// Staging has no redirect rewrites, so negotiation gets its own minimal mod_rewrite
// block. Production embeds the same rules inside its existing block instead.
const markdownNegotiationBlock = `<IfModule mod_rewrite.c>
    RewriteEngine On

    # SE-80: content-negotiate docs pages to their markdown variant on Accept: text/markdown.
${markdownNegotiationRules}
</IfModule>`;

// SE-80: negotiated pages content-negotiate on the Accept header (see the markdown rewrite
// above), so shared caches must key on it — otherwise they could serve the markdown
// variant to a browser, or HTML to an agent. Scoped to the negotiated paths so the rest of
// the site keeps its default (URL-only) cache key. Derived from the same registry as the
// rewrite rule, so the two stay in lockstep.
const markdownVaryHeader = `# SE-80: negotiated pages content-negotiate on Accept (see the markdown rewrite), so shared
# caches must key on it. Scoped to the negotiated paths so the rest of the site keeps its default.
<If "%{REQUEST_URI} =~ m#^/(?:${markdownPathAlternation()})/?$# || %{REQUEST_URI} == '/'">
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

// Lazily built: the redirect generation resolves urlWithBaseUrl (which needs the
// build-time base URL), so it must not run at module import — only when the
// production .htaccess is actually generated.
const getModRewriteRules = (): string => `
<IfModule mod_rewrite.c>
    RewriteEngine On

    RewriteCond %{HTTP_HOST} !^(www\\.)?ag-grid\\.com$ [NC]
    RewriteRule ^ - [S=${SITE_SINGLE_HOP_REWRITES.length + 21}]

    # SE-64 / SE-66: single-hop chain shortening. These run before the https-upgrade and
    # host-swap so a matching legacy path on either www.ag-grid.com or ag-grid.com (any
    # scheme) lands on its final www URL in ONE 301. Inbound query strings are preserved
    # (targets carry none). See SITE_SINGLE_HOP_REWRITES in redirects.ts.
${SITE_SINGLE_HOP_REWRITES.map((r) => {
    const from = r.from.replace(/^\//, '').replace(/\./g, '\\.');
    // Targets carrying a URL fragment need [NE] (noescape) so mod_rewrite emits the '#' verbatim in
    // the Location header. Without it mod_rewrite escapes '#' to %23, turning the anchor into a
    // literal path segment (a broken URL).
    const flags = r.to.includes('#') ? 'R=301,NE,L' : 'R=301,L';
    return `    RewriteRule "^/?${from}$" "${r.to}" [${flags}]`;
}).join('\n')}

    RewriteRule "^/?charts/(javascript|angular|react|vue)/bullet-series/?$" "https://www.ag-grid.com/charts/$1/linear-gauge/#bullet-series" [R=301,NE,L]
    RewriteRule "^/?charts/(javascript|angular|react|vue)/fonts/?$" "https://www.ag-grid.com/charts/$1/text/" [R=301,L]
    RewriteRule "^/?charts/(javascript|angular|react|vue)/?$" "https://www.ag-grid.com/charts/$1/quick-start/" [R=301,L]
    RewriteRule "^/?charts/(javascript|react)/toolbar/?$" "https://www.ag-grid.com/charts/$1/financial-charts-toolbar/" [R=301,L]
    RewriteRule "^/?charts/react/line/?$" "https://www.ag-grid.com/charts/react/line-series/" [R=301,L]
    RewriteRule "^/?charts/archive/?$" "https://www.ag-grid.com/charts/documentation-archive/" [R=301,L]
    RewriteRule "^/?charts/javascript-charts/javascript/(.+?)/?$" "https://www.ag-grid.com/charts/javascript/$1/" [R=301,L]
    RewriteRule "^/?charts/angular-charts/angular/(.+?)/?$" "https://www.ag-grid.com/charts/angular/$1/" [R=301,L]
    RewriteRule "^/?charts/react-charts/react/(.+?)/?$" "https://www.ag-grid.com/charts/react/$1/" [R=301,L]
    RewriteRule "^/?charts/vue-charts/vue/(.+?)/?$" "https://www.ag-grid.com/charts/vue/$1/" [R=301,L]
    RewriteRule "^/?charts/enterprise-charts/react/(.+?)/?$" "https://www.ag-grid.com/charts/react/$1/" [R=301,L]
    RewriteRule "^/?charts/[a-z]+-charts/gallery(/.*)?$" "https://www.ag-grid.com/charts/gallery/" [R=301,L]
    RewriteRule "^/?charts/[a-z]+-charts/options(/.*)?$" "https://www.ag-grid.com/charts/options/" [R=301,L]
    RewriteRule "^/?charts/enterprise-charts/(?!index\\.html$).+$" "https://www.ag-grid.com/charts/enterprise-charts/" [R=301,L]
    RewriteRule "^/?charts/(?:core|side)/?$" "https://www.ag-grid.com/charts/javascript/quick-start/" [R=301,L]
    RewriteRule "^/?charts/core/(.+?)/?$" "https://www.ag-grid.com/charts/javascript/$1/" [R=301,L]
    RewriteRule "^/?charts/side/(.+?)/?$" "https://www.ag-grid.com/charts/javascript/$1/" [R=301,L]
    RewriteRule "^/?charts/server-side-rendering(/.*)?$" "https://www.ag-grid.com/charts/javascript/server-side-rendering/" [R=301,L]
    RewriteRule "^/?charts/(javascript|angular|react|vue)/series(/.*)?$" "https://www.ag-grid.com/charts/$1/bar-series/" [R=301,L]
    RewriteRule "^/?charts/(javascript|angular|react|vue)/axes(/.*)?$" "https://www.ag-grid.com/charts/$1/axes-configuration/" [R=301,L]

    RewriteCond %{REQUEST_URI} /+[^.]+$
    RewriteRule "^/?(charts/.+[^/])$" "https://www.ag-grid.com/$1/" [R=301,L]

    # Always use https for secure connections (scoped to www/bare domain only
    # so that charts.ag-grid.com and studio.ag-grid.com are not affected)
    RewriteCond %{HTTP_HOST} ^(www\\.)?ag-grid\\.com$ [NC]
    RewriteCond %{SERVER_PORT} 80
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]

    # Redirect non-www to www
    RewriteCond %{HTTP_HOST} ^ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]

    # Redirect legacy Phase 1 subdomains to www
    RewriteCond %{HTTP_HOST} ^angulargrid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]
    RewriteCond %{HTTP_HOST} ^angular-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]
    RewriteCond %{HTTP_HOST} ^javascript-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]
    RewriteCond %{HTTP_HOST} ^react-grid\\.ag-grid\\.com$ [NC]
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]

    # Redirect angulargrid.com to www.ag-grid.com
    RewriteCond %{HTTP_HOST} ^angulargrid\\.com$ [OR]
    RewriteCond %{HTTP_HOST} ^www\\.angulargrid\\.com$
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]

    # blog.ag-grid.com -> www.ag-grid.com/blog/ (SE-86/SE-91). Host-scoped, so www and
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
    RewriteRule ^/?javascript-grid-comparison-column-pinning-ag-grid(?:/amp)?/?$ https://www.ag-grid.com/blog/heres-why-column-pinning-in-react-datagrid-by-ag-grid-wins-over-competition/ [R=301,NC,L]
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
    RewriteRule ^/?(.*)$ https://www.ag-grid.com/blog/$1 [R=301,NC,L]

    # SE-80: content-negotiate docs pages to their per-page markdown variant when a
    # client asks for it via Accept: text/markdown (typically an AI agent — browsers
    # never send this, so HTML stays the default). The .md files are generated at
    # build time next to the HTML (see [pageName].md.ts). This is an internal rewrite
    # (no redirect, URL unchanged), gated by an on-disk check so a path without a .md
    # is left untouched. Placed after host/https canonicalization but before the
    # trailing-slash 301 so the canonical (slashed) docs URL negotiates in one hop.
${markdownNegotiationRules}

    # Remove "index.php" from URLs
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^index\\.php$ / [R=301,L]

    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^(.*)/index\\.php$ /$1/ [R=301,L]

    # Add trailing slash for directories
    RewriteCond %{REQUEST_URI} /+[^\\.]+$
    RewriteRule ^(.+[^/])$ %{REQUEST_URI}/ [R=301,L]

    # Redirect paths after a php file (ie index.php/path/path => index.php)
    # arguments will be carried over (ie index.php?abc=true will stay as is)
    RewriteRule ^(.*)\\.php(\\/.+)$ /$1.php [R=301,L]
 
    # temporary redirect for tracking of partnership   
    RedirectMatch 302 ^/theo/$ https://www.ag-grid.com/
    
${SITE_301_REDIRECTS.map((redirect) => {
    const { from, fromPattern, to, gone } = redirect as any;
    if (!from && !fromPattern) {
        // eslint-disable-next-line no-console
        console.warn('Missing `from` in redirect', redirect);
        return;
    }
    // 410 Gone: permanently removed, no target.
    if (gone) {
        return from ? `    Redirect 410 ${urlWithBaseUrl(from)}` : `    RedirectMatch 410 "${fromPattern}"`;
    }
    if (!to) {
        // eslint-disable-next-line no-console
        console.warn('Missing `to` in redirect', redirect);
        return;
    }
    return from
        ? `    Redirect 301 ${urlWithBaseUrl(from)} ${urlWithBaseUrl(to)}`
        : `    RedirectMatch 301 "${fromPattern}" "${urlWithBaseUrl(to)}"`;
})
    .filter(Boolean)
    .join('\n')}

</IfModule>
`;

const baseRules = `### AUTOGENERATED DO NOT EDIT
ErrorDocument 404 /404.html

# add MIME types for serving example files
AddType text/javascript jsx
AddType application/typescript ts tsx
AddType application/x-gzip .gz .tgz

# serve the per-page LLM markdown files as markdown
AddType text/markdown md
# ...as UTF-8, so glyphs like ✓/✗ in generated tables aren't mojibaked by a
# Latin-1 fallback (the .md endpoint sets this charset; static hosting must too).
AddCharset utf-8 .md
`;

function getStagingHtaccessContent(): string {
    return `${baseRules}
${documentNoCacheRules}

${markdownNegotiationBlock}

${markdownVaryHeader}

${agentLinkHeader}

# Content-Security-Policy — enforced, path-scoped. Unsets the legacy wildcard CSP on
# the staging vhost so this tightened policy is the only one in effect.
${getScopedCspHtaccessBlock({ env: 'staging' }, 'enforce')}

${getBranchBuildsCspIfOverride('enforce')}

Options -Indexes
`;
}

function getProductionHtaccessContent(): string {
    return `${baseRules}
${documentNoCacheRules}
${hashedAssetCacheRules}
${modDeflateRules}
${getModRewriteRules()}

# X-Frame-Options intentionally omitted: it can't allow-list subdomains, so it blocks
# blog.ag-grid.com (and other *.ag-grid.com) from embedding examples. Clickjacking
# protection is handled by the CSP frame-ancestors directive instead (see cspRules.ts).
Header always set Referrer-Policy "${REFERRER_POLICY_VALUE}"
Header always set Permissions-Policy "${PERMISSIONS_POLICY_VALUE}"

${markdownVaryHeader}

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

export function getHtaccessContent(options: { env: HtaccessEnv }): string {
    return options.env === 'staging' ? getStagingHtaccessContent() : getProductionHtaccessContent();
}
