const http = require('http');
const path = require('path');
const { log } = require('./utils.js');

/** @typedef {import('./types').DevServer} DevServer */

const mimeTypes = new Map(
    Object.entries({
        '.css': 'text/css',
        '.html': 'text/html',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.ts': 'application/typescript',
    })
);

/**
 * @param {number} port
 * @returns {DevServer}
 */
function createDevServer(port) {
    /** @type {Map<string, string | Buffer>} */
    const files = new Map();

    const server = http.createServer((req, res) => {
        const baseURL = `${req.headers.protocol}://${req.headers.host}/`;
        const parsedURL = new URL(/** @type {string} */ (req.url), baseURL);
        const pathName = parsedURL.pathname.replace(/^\//, '').replace(/\/$/, '');

        // Display all the files
        if (pathName === '__dir__') {
            const paths = Array.from(files.keys()).sort();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const html = ['<ul>', ...paths.map((href) => `<li><a href="${href}">${href}</a></li>`), '</ul>'].join('\n');
            res.end(html, 'utf8');
            return;
        }

        // Fallback to index.html
        const filePath =
            pathName === ''
                ? 'index.html'
                : files.has(pathName)
                ? pathName
                : files.has(`${pathName}/index.html`)
                ? `${pathName}/index.html`
                : null;

        // 404: not found
        if (!filePath) {
            res.statusCode = 404;
            res.end(`Not found "${pathName}"`);
            return;
        }

        // Write file
        const content = files.get(filePath);
        const ext = path.extname(filePath);
        const contentType = mimeTypes.get(ext) || 'text/plain';
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(content, content instanceof Buffer ? 'binary' : 'utf8');
    });

    return {
        httpServer: server,

        addStaticFile(path, content) {
            files.set(path, content);
        },

        start() {
            return new Promise((resolve) => {
                server.listen(port, () => {
                    log.ok(`Dev Server started on port ${port}`);
                    resolve();
                });
            });
        },

        close() {
            server.close((err) => {
                if (err) {
                    log.error(`Dev Server error: ${err}`);
                } else {
                    log.ok('Dev Server exit');
                }
            });
        },
    };
}

module.exports = {
    createDevServer,
};
