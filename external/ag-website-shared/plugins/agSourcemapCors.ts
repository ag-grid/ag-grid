import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';

type ConnectMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
interface StackEntry {
    route: string;
    handle: ConnectMiddleware;
}

/**
 * Vite plugin that allows cross-origin sourcemap requests through Astro's
 * secFetchMiddleware.
 *
 * Chrome DevTools fetches sourcemaps with `Sec-Fetch-Site: cross-site` but
 * without an `Origin` header. Astro's secFetchMiddleware (added in Astro 6)
 * blocks these because it can only validate cross-origin requests that carry
 * an Origin. This plugin wraps secFetchMiddleware to let `.map` requests
 * through unconditionally — they are internal browser/DevTools fetches, not
 * page-initiated subresource loads.
 */
export default function agSourcemapCors(): Plugin {
    return {
        name: 'ag-sourcemap-cors',
        configureServer(server: ViteDevServer) {
            const stack = server.middlewares.stack as StackEntry[];
            const origUnshift = stack.unshift.bind(stack);

            stack.unshift = function (...items: StackEntry[]) {
                for (const item of items) {
                    if (item.handle?.name === 'devSecFetch') {
                        const original = item.handle;
                        item.handle = function devSecFetchWithSourcemaps(
                            req: IncomingMessage,
                            res: ServerResponse,
                            next: () => void
                        ) {
                            if (req.url?.endsWith('.map')) {
                                return next();
                            }
                            return original(req, res, next);
                        };
                    }
                }
                return origUnshift(...items);
            } as typeof stack.unshift;
        },
    };
}
