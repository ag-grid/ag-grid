// cwd is always the root of the project
const express = require('express');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const mkcert = require('vite-plugin-mkcert');

const PORT = process.env['PORT'] ?? '4610';
const HOST = process.env['HOST'] ?? 'localhost';
const CORS = {
    extensions: ['js', 'jsx', 'ts', 'tsx', 'css', 'scss'],
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
    },
};
const __root = path.join(__dirname, '..', '..');
console.log('Using root', __root);
mkcert
    .default()
    .config({ https: true, host: HOST })
    .then((options) => {
        const app = express();
        const projectsDir = path.join(__root, 'packages');
        fs.readdirSync(projectsDir).forEach((project) => {
            const projectPath = path.join(projectsDir, project);
            if (fs.statSync(projectPath).isDirectory()) {
                console.log('Adding route', path.join('files', project, 'dist'), CORS);
                app.use(
                    `/${path.join('files', project, 'dist')}`,
                    express.static(path.join(projectPath, 'dist'), CORS)
                );
                app.use(`/${path.join('files', project, 'styles')}`, express.static(path.join(projectPath, 'styles')));
            }
        });
        const staticRoot = express.static(__root, CORS);
        console.log('Adding route', __root);
        app.use('/', (req, res, next) => {
            if (req.url === '/healthcheck') {
                // used by Playwright to check if the server is running
                res.status(200).send('OK');
                return next();
            }
            return staticRoot(req, res, next);
        });
        const server = https.createServer(options.server.https, app);
        server.listen(PORT, () => {
            console.log(`App listening on https://${HOST}:${PORT}`);
        });
    })
    .catch((e) => console.error(e));
