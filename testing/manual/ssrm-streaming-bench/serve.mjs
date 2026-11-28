import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../../../packages/ag-grid-enterprise/dist');
const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.md': 'text/plain',
};

/** Serves this folder, plus the built enterprise UMD bundle under /dist/. Binds to localhost only. */
export function startServer(port = 0) {
    const server = createServer((req, res) => {
        const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const file = path.startsWith('/dist/')
            ? join(distDir, normalize(path.slice('/dist/'.length)))
            : join(here, normalize(path === '/' ? 'index.html' : path));
        if (!(file.startsWith(here) || file.startsWith(distDir)) || !existsSync(file) || !statSync(file).isFile()) {
            res.writeHead(404).end('not found');
            return;
        }
        res.writeHead(200, {
            'content-type': types[extname(file)] ?? 'application/octet-stream',
            'cache-control': 'no-store',
        });
        createReadStream(file).pipe(res);
    });
    return new Promise((done) => server.listen(port, '127.0.0.1', () => done(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    if (!existsSync(join(distDir, 'ag-grid-enterprise.min.js'))) {
        console.error(
            `Missing ${distDir}/ag-grid-enterprise.min.js. Build it with:\n  yarn nx run-many -t build:umd -p ag-grid-community,ag-grid-enterprise`
        );
        process.exit(1);
    }
    const server = await startServer(Number(process.argv[2] ?? 4620));
    console.log(`SSRM streaming benchmark: http://localhost:${server.address().port}/`);
}
