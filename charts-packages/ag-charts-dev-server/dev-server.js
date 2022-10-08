import http from 'http';
import path from 'path';
import { log } from './utils.js';

const mimeTypes = new Map(
    Object.entries({
        '.css': 'text/css',
        '.html': 'text/html',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
    }),
);

export function createDevServer(/** @type {number} */port) {
    /** @type {Map<string, string | Buffer>} */
    const files = new Map();

    const server = http.createServer((req, res) => {
        const baseURL = `${req.headers.protocol}://${req.headers.host}/`;
        const parsedURL = new URL(/** @type {string} */(req.url), baseURL);
        const pathName = parsedURL.pathname.replace(/^\//, '').replace(/\/$/, '');

        // Display all the files
        if (pathName === '__dir__') {
            const paths = Array.from(files.keys());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const html = [
                '<ul>',
                ...paths.map((href) => `<li><a href="${href}">${href}</a></li>`),
                '</ul>',
            ].join('\n');
            res.end(html, 'utf8');
            return;
        }

        const fallbackPath = pathName ? `${pathName}/index.html` : 'index.html';
        const successPath = [
            pathName,
            fallbackPath,
        ].find((p) => files.has(p));
        if (!successPath) {
            res.statusCode = 404;
            res.end(`Not found "${pathName}"`);
            return;
        }

        const content = files.get(successPath);
        const ext = path.extname(successPath);
        const contentType = mimeTypes.get(ext) || 'text/plain';

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(content, content instanceof Buffer ? 'binary' : 'utf8');
    });

    /**
     * @param {string} path
     * @param {string | Buffer} content
     */
    function addStaticFile(path, content) {
        files.set(path, content);
    }

    function close() {
        server.close(() => log.ok('Dev Server exit'));
    }

    /**
     * @param {string} extensionWithDot
     * @param {string} mimeType
     */
    function addMimeType(extensionWithDot, mimeType) {
        mimeTypes.set(extensionWithDot, mimeType);
    }

    /**
     * @returns {Promise<void>}
     */
    function start() {
        return new Promise((resolve) => {
            server.listen(port, () => {
                log.ok(`Dev Server started on port ${port}`);
                resolve();
            });
        });
    }

    return { start, addStaticFile, addMimeType, close, httpServer: server };
}