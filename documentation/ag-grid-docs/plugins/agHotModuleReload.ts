import chokidar from 'chokidar';
import type { Plugin, ViteDevServer } from 'vite';

import { getIsDev } from '../src/utils/env';

const BUILD_QUEUE_EMPTY_FILE = '../../node_modules/.cache/ag-build-queue.empty';

export default function createAgHotModuleReload(): Plugin {
    return {
        name: 'ag-hmr',
        async configureServer(server: ViteDevServer) {
            if (!getIsDev()) return;

            const filesToWatch = [BUILD_QUEUE_EMPTY_FILE];
            let timeout: NodeJS.Timeout | undefined;
            const fullReload = (path: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    server.ws.send({ type: 'full-reload', path });
                }, 300);
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
