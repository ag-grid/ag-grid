import type { Connect, Plugin, ViteDevServer } from 'vite';

import { DISABLE_MARKDOWN_DOCS, FRAMEWORKS } from '../src/constants';

// A single docs page path, e.g. `/react-data-grid/cell-editing/`. The final
// segment excludes dots so the `.md` variant itself never matches (no rewrite
// loop) and the framework landing page (`/react-data-grid/`, which has no `.md`)
// is left alone.
const DOCS_PAGE_PATH = new RegExp(`/(?:${FRAMEWORKS.join('|')})-data-grid/[^/.]+/?$`);

// Top-level (non-docs) pages that also ship a `.md` twin. Kept in sync with the
// same page list in the SE-80 htaccess negotiation rule (see htaccessRules.ts).
const TOP_LEVEL_MD_PATH = /^\/(?:license-pricing)\/?$/;

// A client (typically an AI agent) asks for the markdown variant by sending
// `Accept: text/markdown`. Browsers never send this, so HTML stays the default.
// Kept as a simple substring check to match the production Apache rule
// (`RewriteCond %{HTTP_ACCEPT} text/markdown`).
function prefersMarkdown(accept: string | undefined): boolean {
    return accept != null && accept.includes('text/markdown');
}

/**
 * SE-80: content-negotiate docs pages to their per-page markdown variant in the
 * dev server. When a request carries `Accept: text/markdown` for a docs page, the
 * `.md` route is served without a redirect (the URL stays put) — the dev-server
 * equivalent of the `mod_rewrite` rule in the generated `.htaccess`.
 *
 * This has to be a Vite dev-server middleware rather than the Astro middleware:
 * docs pages are prerendered, and Astro strips request headers on prerendered
 * routes (`Astro.request.headers` is empty), so the Accept header is only visible
 * on the raw Node request here. Production is a static build served by Apache, so
 * negotiation there is Apache's job, not this plugin's — this runs in dev only.
 *
 * Ordering mirrors `agDevExampleAssetCors`: `enforce: 'post'` + `unshift` lands
 * this in front of Astro's routing entry, so the rewritten URL is what Astro
 * routes on. The `.md` route is generated from the same page fan-out as the HTML
 * page, so a docs page that exists as HTML always has a matching `.md`.
 */
export default function agDevMarkdownNegotiation(): Plugin {
    return {
        name: 'ag-dev-markdown-negotiation',
        enforce: 'post',
        configureServer(server: ViteDevServer) {
            if (DISABLE_MARKDOWN_DOCS) {
                return;
            }
            return () => {
                const negotiateMarkdown: Connect.NextHandleFunction = (req, _res, next) => {
                    if (req.method !== 'GET' || !prefersMarkdown(req.headers.accept)) {
                        next();
                        return;
                    }
                    const [pathname, query] = (req.url ?? '').split('?');
                    if (DOCS_PAGE_PATH.test(pathname) || TOP_LEVEL_MD_PATH.test(pathname)) {
                        const markdownPath = pathname.replace(/\/$/, '') + '.md';
                        req.url = query != null ? `${markdownPath}?${query}` : markdownPath;
                    }
                    next();
                };
                server.middlewares.stack.unshift({ route: '', handle: negotiateMarkdown });
            };
        },
    };
}
