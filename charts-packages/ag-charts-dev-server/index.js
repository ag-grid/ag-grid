import { promises as fs } from 'fs';
import path from 'path';
import { transpileTSAndWatch } from './transpiler.js';
import { createDevServer } from './dev-server.js';
import { createLivereloadServer } from './livereload-server.js';
import { glob } from './file.js';
import { log, openURLInBrowser } from './utils.js';

const PORT = 2020;
const SRC_DIR = '../ag-charts-community/src';
const SRC_ENTRY = `${SRC_DIR}/main.ts`;
const CHARTS_DEST_DIR = 'ag-charts';
const STATIC_DIR = 'www';
const DEBOUNCE = 250;

async function run() {
    const devServer = createDevServer(PORT);
    const livereloadServer = createLivereloadServer(devServer.httpServer);

    const staticFiles = await glob(`${STATIC_DIR}/**/*.*`);
    for (const file of staticFiles) {
        const content = await fs.readFile(file, 'utf8');
        const relative = path.relative(STATIC_DIR, file);
        devServer.addStaticFile(relative, content);
    }

    const watcher = transpileTSAndWatch({
        entry: SRC_ENTRY,
        srcDir: SRC_DIR,
        destDir: CHARTS_DEST_DIR,
        debounce: DEBOUNCE,
        emit: (file, content) => {
            devServer.addStaticFile(file, content);
        },
    });

    let isStopped = false;

    function stop() {
        if (isStopped) return;

        livereloadServer.close();
        devServer.close();
        watcher.stop();
        isStopped = true;
    }

    process.on('exit', stop);
    process.on('SIGINT', stop);

    await devServer.start();
    watcher.onChange(() => livereloadServer.sendMessage({ type: 'reload-full' }));

    log.ok('watching...');
    openURLInBrowser(`http://localhost:${PORT}/`);
}

run();
