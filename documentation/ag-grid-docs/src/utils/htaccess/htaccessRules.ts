import { urlWithBaseUrl } from '../urlWithBaseUrl';
import { SITE_301_REDIRECTS } from './redirects';

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

const modRewriteRules = `
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Always use https for secure connections
    # (as it appears on your SSL certificate)
    RewriteCond %{SERVER_PORT} 80
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$
    RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/(?:\\ Ballot169)?
    RewriteRule ^(.*)$ https://www.ag-grid.com/$1 [R=301,L]

    # rollback for now 
    # RewriteCond %{HTTP_HOST} !^www\\. [NC]
    # RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [R=301,L]
    
    # Redirect angulargrid.com to ag-grid.com
    RewriteCond %{HTTP_HOST} ^angulargrid\\.com$ [OR]
    RewriteCond %{HTTP_HOST} ^www\\.angulargrid\\.com$
    RewriteRule ^/?$ "http\\:\\/\\/www\\.ag\\-grid\\.com" [R=301,L]

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
    const { from, fromPattern, to } = redirect as any;
    if (!to) {
        // eslint-disable-next-line no-console
        console.warn('Missing `to` in redirect', redirect);
        return;
    } else if (!from && !fromPattern) {
        // eslint-disable-next-line no-console
        console.warn('Missing `from` in redirect', redirect);
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

export function getHtaccessContent() {
    return `### AUTOGENERATED DO NOT EDIT
ErrorDocument 404 /404.html

# add MIME types for serving example files
AddType text/javascript ts jsx

${modExpiresRules}
${modDeflateRules}
${modRewriteRules}

# CORS settings
Header add Access-Control-Allow-Origin "*"
Header add Access-Control-Allow-Methods: "GET,POST,OPTIONS,DELETE,PUT"

Options -Indexes
`;
}
