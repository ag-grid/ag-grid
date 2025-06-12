// cwd is always the root of the project
const express = require('express');
const fs = require('fs');
const path = require('path');
const mkcert = require('vite-plugin-mkcert');
const https = require('https');

const PORT = process.env['PORT'] ?? '4610';
const HOST = process.env['HOST'] ?? 'localhost';
console.log('Using cwd', process.cwd());
mkcert
    .default()
    .config({ https: true, host: HOST })
    .then((options) => {
        const app = express();
        const projectsDir = './packages';
        fs.readdirSync(projectsDir).forEach((project) => {
            const projectPath = path.join(projectsDir, project);
            if (fs.statSync(projectPath).isDirectory()) {
                console.log('Adding route', path.join('files', project, 'dist'));
                app.use(`/${path.join('files', project, 'dist')}`, express.static(path.join(projectPath, 'dist')));
            }
        });
        app.use('/', (req, res) => res.send('Hello from the web server!'));
        const server = https.createServer(options.server.https, app);
        server.listen(PORT, () => {
            console.log(`App listening on https://${HOST}:${PORT}`);
        });
    })
    .catch((e) => console.error(e));
