import type { Connect, Plugin, ViteDevServer } from 'vite';

export interface MarkdownNegotiationOptions {
    /**
     * Path patterns (matched against the request pathname) that have a `.md` twin.
     * A request matches if any pattern matches. Each product supplies its own — e.g.
     * grid's `<framework>-data-grid/<page>` docs pages plus its top-level `.md` pages.
     */
    pathPatterns: RegExp[];
    /** When true the plugin is a no-op (mirrors the build-time DISABLE_MARKDOWN_DOCS flag). */
    disabled: boolean;
}

// A client (typically an AI agent) asks for the markdown variant by sending
// `Accept: text/markdown`. Browsers never send this, so HTML stays the default.
// Kept as a simple substring check to match the production Apache rule
// (`RewriteCond %{HTTP_ACCEPT} text/markdown`).
function prefersMarkdown(accept: string | undefined): boolean {
    return accept != null && accept.includes('text/markdown');
}

/**
 * SE-80: content-negotiate docs pages to their per-page markdown variant in the
 * dev server. When a request carries `Accept: text/markdown` for a page that has a
 * `.md` twin, the `.md` route is served without a redirect (the URL stays put) —
 * the dev-server equivalent of the `mod_rewrite` rule in the generated `.htaccess`.
 *
 * Product-agnostic: the caller supplies the `pathPatterns` that identify negotiable
 * paths, so grid and charts share the mechanism and differ only in their URL shapes.
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
 * page, so a page that exists as HTML always has a matching `.md`.
 */
export default function agDevMarkdownNegotiation({ pathPatterns, disabled }: MarkdownNegotiationOptions): Plugin {
    return {
        name: 'ag-dev-markdown-negotiation',
        enforce: 'post',
        configureServer(server: ViteDevServer) {
            if (disabled) {
                return;
            }
            return () => {
                const negotiateMarkdown: Connect.NextHandleFunction = (req, _res, next) => {
                    if (req.method !== 'GET' || !prefersMarkdown(req.headers.accept)) {
                        next();
                        return;
                    }
                    const [pathname, query] = (req.url ?? '').split('?');
                    if (pathPatterns.some((pattern) => pattern.test(pathname))) {
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
