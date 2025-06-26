// cwd is always the root of the project
import express from 'express';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as mkcert from 'vite-plugin-mkcert';

const PORT = process.env['PORT'] ?? '4610';
const HOST = process.env['HOST'] ?? 'localhost';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        const staticTestFiles = path.join(__root, 'testing', 'performance', 'e2e');
        console.log('Adding route', staticTestFiles);
        app.use('/', (req, res, next) => {
            if (req.url === '/healthcheck') {
                // used by Playwright to check if the server is running
                res.send('OK', 200);
                return next();
            }
            return express.static(staticTestFiles)(req, res, next);
        });
        const server = https.createServer(options.server.https, app);
        server.listen(PORT, () => {
            console.log(`App listening on https://${HOST}:${PORT}`);
        });
    })
    .catch((e) => console.error(e));
