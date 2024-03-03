import chokidar from 'chokidar';
import type { Plugin, ViteDevServer } from 'vite';

import { getIsDev } from '../src/utils/env';
import { getDevFileList, getExampleRootFileUrl } from '../src/utils/pages';

export default function createAgHotModuleReload(): Plugin {
    return {
        name: 'ag-hmr',
        async configureServer(server: ViteDevServer) {
            if (!getIsDev()) return;

            const devFiles = getDevFileList();
            const exampleFiles = getExampleRootFileUrl().pathname;

            let timeout: NodeJS.Timeout | undefined;
            const fullReload = (path: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    server.ws.send({ type: 'full-reload', path });
                }, 300);
            };

            const watcher = chokidar.watch([...devFiles, exampleFiles]);
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
