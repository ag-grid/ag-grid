// @ts-check
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { transpileFiles } from './transpiler.js';
import { createDevServer } from './dev-server.js';
import { createLivereloadServer } from './livereload-server.js';
import { glob } from './file.js';
import { log } from './log.js';

function openURL(/** @type {string} */url) {
    const { platform } = process;
    const start = platform == 'darwin' ? 'open' : platform == 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
}


const PORT = 2020;
const SRC_DIR = '../ag-charts-community/src';
const STATIC_DIR = 'www';

async function getSrcFiles() {
    /** @type {string[]} */
    const tsFiles = await glob(`${SRC_DIR}/**/*.ts`);
    return tsFiles.filter((file) => {
        // Filter out test files
        return !(
            file.endsWith('.test.ts') ||
            file.includes('/test/')
        );
    });
}

async function run() {
    const staticFiles = await glob(`${STATIC_DIR}/**/*.*`);
    const srcFiles = await getSrcFiles();
    const transpiledFiles = await transpileFiles(srcFiles, { cwd: SRC_DIR });

    const devServer = createDevServer(PORT);
    const livereloadServer = createLivereloadServer(devServer.httpServer);

    for (const file of staticFiles) {
        const content = await fs.readFile(file, 'utf8');
        const relative = path.relative(STATIC_DIR, file);
        devServer.addStaticFile(relative, content);
    }

    for (const transpiled of transpiledFiles) {
        devServer.addStaticFile(transpiled.jsFile, transpiled.jsContent);
        devServer.addStaticFile(transpiled.sourcemapFile, transpiled.sourcemapContent);
        devServer.addStaticFile(transpiled.tsFile, transpiled.tsContent);
    }

    let isStopped = false;

    function stop() {
        if (isStopped) return;

        livereloadServer.close();
        devServer.close();
        // watchers.forEach((watcher) => {
        //     watcher.stop();
        // });
        isStopped = true;
    }

    process.on('exit', stop);
    process.on('SIGINT', stop);

    await devServer.start();

    log.ok('watching...');
    openURL(`http://localhost:${PORT}/`);
}

run();
