import { urlWithBaseUrl } from '../urlWithBaseUrl';
import type { CspEnv } from './cspRules';
import {
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

/**
 * Note: when changing this file please add/update the tests in
 * documentation/ag-grid-docs/testing/htaccess-harness
 */
const modExpiresRules = `
<IfModule mod_expires.c>
    # Adds caching headers
    ExpiresActive On

    # Default directive
    ExpiresDefault "access plus 1 year"

    ExpiresByType application/json "access plus 1 hour"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/plain "access plus 1 hour"
    ExpiresByType text/richtext "access plus 1 hour"
    ExpiresByType text/xml "access plus 1 hour"
    ExpiresByType text/xsd "access plus 1 hour"
    ExpiresByType text/xsl "access plus 1 hour"

    # CSS
    ExpiresByType text/css "access plus 1 month"
</IfModule>
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
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml

    # Remove browser bugs (only needed for really old browsers)
    BrowserMatch ^Mozilla/4 gzip-only-text/html
    BrowserMatch ^Mozilla/4\\.0[678] no-gzip
    BrowserMatch \\bMSIE !no-gzip !gzip-only-text/html
    Header append Vary User-Agent
</IfModule>
`;

// Lazily built: the redirect generation resolves urlWithBaseUrl (which needs the
// build-time base URL), so it must not run at module import — only when the
// production .htaccess is actually generated.
const getModRewriteRules = (): string => `
<IfModule mod_rewrite.c>
    RewriteEngine On

    # SE-64 / SE-66: single-hop chain shortening. These run before the https-upgrade and
    # host-swap so a matching legacy path on either www.ag-grid.com or ag-grid.com (any
    # scheme) lands on its final www URL in ONE 301. Inbound query strings are preserved
    # (targets carry none). See SITE_SINGLE_HOP_REWRITES in redirects.ts.
${SITE_SINGLE_HOP_REWRITES.map(
    (r) => `    RewriteRule "^/?${r.from.replace(/^\//, '').replace(/\./g, '\\.')}$" "${r.to}" [R=301,L]`
).join('\n')}

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
`;

function getStagingHtaccessContent(): string {
    return `${baseRules}

# Content-Security-Policy — enforced, path-scoped. Unsets the legacy wildcard CSP on
# the staging vhost so this tightened policy is the only one in effect.
${getScopedCspHtaccessBlock({ env: 'staging' }, 'enforce')}

${getBranchBuildsCspIfOverride('enforce')}

Options -Indexes
`;
}

function getProductionHtaccessContent(): string {
    return `${baseRules}
${modExpiresRules}
${modDeflateRules}
${getModRewriteRules()}

# X-Frame-Options intentionally omitted: it can't allow-list subdomains, so it blocks
# blog.ag-grid.com (and other *.ag-grid.com) from embedding examples. Clickjacking
# protection is handled by the CSP frame-ancestors directive instead (see cspRules.ts).
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

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

export function getHtaccessContent(options: { env: HtaccessEnv }): string {
    return options.env === 'staging' ? getStagingHtaccessContent() : getProductionHtaccessContent();
}
