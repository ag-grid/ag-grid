import chokidar from 'chokidar';
import type { Plugin, ViteDevServer } from 'vite';

import { getIsDev } from '../src/utils/env';

const BUILD_QUEUE_EMPTY_FILE = '../../node_modules/.cache/ag-build-queue.empty';
// Astro's server-side Vite environments, the same ones Astro notifies when content changes
const ASTRO_SERVER_ENVIRONMENTS = ['ssr', 'prerender'];

export default function createAgHotModuleReload(): Plugin {
    return {
        name: 'ag-hmr',
        async configureServer(server: ViteDevServer) {
            if (!getIsDev()) {
                return;
            }

            const filesToWatch = [BUILD_QUEUE_EMPTY_FILE];
            let timeout: ReturnType<typeof setTimeout> | undefined;
            // A rebuild can add or remove generated example files, so drop Astro's cached `getStaticPaths`
            // results. Otherwise new files 404 and deleted ones are still routed. `astro:content-changed` is
            // an internal Astro event, so re-check it when upgrading Astro.
            const clearRouteCache = () => {
                for (const name of ASTRO_SERVER_ENVIRONMENTS) {
                    server.environments[name]?.hot.send('astro:content-changed', {});
                }
            };
            const fullReload = (path: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    clearRouteCache();
                    server.ws.send({ type: 'full-reload', path });
                }, 10);
            };

            const watcher = chokidar.watch(filesToWatch);
            watcher
                .on('change', (path) => {
                    fullReload(path);
                })
                .on('add', (path) => {
                    fullReload(path);
                });
        },
    };
}
