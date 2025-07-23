// cwd is always the root of the project
const express = require('express');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const mkcert = require('vite-plugin-mkcert');

const PORT = process.env['PORT'] ?? '4610';
const HOST = process.env['HOST'] ?? 'localhost';

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
                console.log('Adding route', path.join('files', project, 'dist'));
                app.use(`/${path.join('files', project, 'dist')}`, express.static(path.join(projectPath, 'dist')));
                app.use(`/${path.join('files', project, 'styles')}`, express.static(path.join(projectPath, 'styles')));
            }
        });
        const extensions = {
            extensions: ['js', 'jsx', 'ts', 'tsx', 'css', 'scss'],
            setHeaders: (res, path) => {
                // transpile tsx on the fly
                if (path.endsWith('.tsx')) {
                    res.setHeader('Content-type', 'text/typescript-jsx');
                } else if (path.endsWith('.ts')) {
                    res.setHeader('Content-type', 'text/typescript');
                } else if (path.endsWith('.css')) {
                    res.setHeader('Content-type', 'text/css');
                } else if (path.endsWith('.js')) {
                    res.setHeader('Content-type', 'text/javascript');
                } else if (path.endsWith('.jsx')) {
                    res.setHeader('Content-type', 'text/javascript-jsx');
                } else if (path.endsWith('.html')) {
                    res.setHeader('Content-type', 'text/html');
                } else if (path.endsWith('.json')) {
                    res.setHeader('Content-type', 'application/json');
                }
            },
        };
        const staticTestFiles = express.static(path.join(__root, 'testing', 'performance'), extensions);
        const staticRoot = express.static(__root, extensions);
        app.use('/healthcheck', (req, res, next) => {
            // used by Playwright to check if the server is running
            res.status(200).send('OK');
            return next();
        });

        app.use('/', (req, res, next) => {});

        const server = https.createServer(options.server.https, app);
        server.listen(PORT, () => {
            console.log(`App listening on https://${HOST}:${PORT}`);
        });
    })
    .catch((e) => console.error(e));
