import type { Connect, Plugin, ViteDevServer } from 'vite';

import { FILES_BASE_PATH } from '../src/constants';

const FILES_PREFIX = `${FILES_BASE_PATH}/`;

/**
 * Astro 6's dev-server `secFetchMiddleware` rejects (403) any cross-site
 * subresource request that does not carry an `Origin` matching
 * `security.allowedDomains`. That is the right policy for pages, but it breaks
 * examples opened on an external host (Plunker, CodeSandbox):
 *
 *  - SystemJS fetches the library JS over XHR (a CORS request) so it sends
 *    `Origin: https://run.plnkr.co`, matches the allow-list, and loads fine.
 *  - `import '…/styles/ag-grid.css'` is loaded with a `<link rel="stylesheet">`
 *    — a *no-cors* request that sends NO `Origin` header, so it can never match
 *    the allow-list and is blocked, surfacing in the example as
 *    "Error loading CSS file."
 *
 * Every example dependency asset is served under `${FILES_BASE_PATH}/…` and is
 * a public, read-only library file that is *meant* to be loaded by those
 * external hosts. This plugin lets only those requests through `secFetch` by
 * clearing the `sec-fetch-site` header before Astro's middleware inspects it
 * (Astro short-circuits to `next()` when the header is absent). No other path
 * is relaxed, so ordinary pages and routes keep the full cross-origin guard.
 *
 * Ordering is load-bearing: Astro registers `secFetch` by unshifting it to the
 * front of the connect stack in a `configureServer` post-hook. Vite runs
 * post-hooks in sorted-plugin order, so an `enforce: 'post'` plugin that also
 * unshifts lands in front of Astro's entry and is guaranteed to run first.
 */
export default function agDevExampleAssetCors(): Plugin {
    return {
        name: 'ag-dev-example-asset-cors',
        enforce: 'post',
        configureServer(server: ViteDevServer) {
            return () => {
                const allowExampleAssetCors: Connect.NextHandleFunction = (req, _res, next) => {
                    const pathname = (req.url ?? '').split('?')[0];
                    if (req.headers['sec-fetch-site'] != null && pathname.startsWith(FILES_PREFIX)) {
                        delete req.headers['sec-fetch-site'];
                    }
                    next();
                };
                server.middlewares.stack.unshift({ route: '', handle: allowExampleAssetCors });
            };
        },
    };
}
