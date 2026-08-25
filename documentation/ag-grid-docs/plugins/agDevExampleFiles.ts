import type { Connect, Plugin, ViteDevServer } from 'vite';

import { getIsDev } from '../src/utils/env';

const ROUTE_MODULE = '/src/pages/examples/[pageName]/[exampleName]/[internalFramework]/[fileName].ts';

/** `/examples/<page>/<example>/<framework>/<file.ext>` */
const EXAMPLE_FILE_PATH = /^\/examples\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+\.[^/.]+)$/;

/** Sibling routes that also end in a dotted segment but have their own handlers. */
const NOT_EXAMPLE_FILES = new Set(['contents.json']);

/**
 * Serves example files through the route's own `GET` instead of astro's router.
 *
 * The route's `getStaticPaths` enumerates the generated file list of all ~6,000 example/framework
 * pairs, which just-in-time generation would turn into building the entire corpus on the first
 * example file request. Astro only skips `getStaticPaths` for a route whose `prerender` export is
 * the literal `false`, and that would leave the production build needing an adapter — so dev
 * bypasses the router for these paths, and the build keeps prerendering them unchanged.
 */
export default function agDevExampleFiles(): Plugin {
    return {
        name: 'ag-dev-example-files',
        enforce: 'post',
        configureServer(server: ViteDevServer) {
            if (!getIsDev()) {
                return;
            }

            return () => {
                const serveExampleFile: Connect.NextHandleFunction = (req, res, next) => {
                    const pathname = (req.url ?? '').split('?')[0];
                    const match = EXAMPLE_FILE_PATH.exec(pathname);

                    if (!match || NOT_EXAMPLE_FILES.has(match[4])) {
                        next();
                        return;
                    }

                    const [, pageName, exampleName, internalFramework, fileName] = match;

                    server
                        .ssrLoadModule(ROUTE_MODULE)
                        .then((module) =>
                            module.GET({ params: { pageName, exampleName, internalFramework, fileName } })
                        )
                        .then(async (response: Response) => {
                            res.statusCode = response.status;
                            response.headers.forEach((value, name) => res.setHeader(name, value));
                            res.end(await response.text());
                        })
                        .catch((error) => {
                            server.ssrFixStacktrace(error);
                            next(error);
                        });
                };

                server.middlewares.stack.unshift({ route: '', handle: serveExampleFile });
            };
        },
    };
}
