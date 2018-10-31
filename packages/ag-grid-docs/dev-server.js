const os = require('os');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const run = require('gulp-run');
const express = require('express');
const realWebpack = require('webpack');
const proxy = require('express-http-proxy');
const webpackMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const chokidar = require('chokidar');
const generateExamples = require('./example-generator');

const lnk = require('lnk').sync;
const mkdirp = require('mkdir-p').sync;

const EXPRESS_PORT = 8080;
const PHP_PORT = 8888;
const HOST = '127.0.0.1';
const WINDOWS = /^win/.test(os.platform());

const rewrite = require('express-urlrewrite');

var argv = require('minimist')(process.argv.slice(2));
const useHmr = argv.hmr;

function addWebpackMiddleware(app, configPath, prefix) {
    const webpackConfig = require(path.resolve('./webpack-config/', configPath + '.js'));

    webpackConfig.plugins.push( new realWebpack.DefinePlugin({ HMR: useHmr }));

    // remove the HMR plugins - very "hardcoded" approach. 
    if (!useHmr) {
        webpackConfig.plugins.splice(0, 2);
    }

    const compiler = realWebpack(webpackConfig);

    app.use(rewrite(new RegExp(`^${prefix}/(.+).hot-update.(json|js)`), `${prefix}${prefix}/$1.hot-update.$2`));

    app.use(
        prefix,
        webpackMiddleware(compiler, {
            noInfo: true,
            publicPath: '/'
        })
    );

    if (useHmr) {
        app.use(prefix, hotMiddleware(compiler));
    }
}

function launchPhpCP(app) {
    const php = cp.spawn('php', ['-S', `${HOST}:${PHP_PORT}`, '-t', 'src'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        env: {AG_DEV: 'true'}
    });

    app.use(
        '/',
        proxy(`${HOST}:${PHP_PORT}`, {
            proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
                proxyReqOpts.headers['X-PROXY-HTTP-HOST'] = srcReq.headers.host;
                return proxyReqOpts;
            }
        })
    );

    process.on('exit', () => {
        php.kill();
    });
}

function serveAndWatchAngular(app) {
    const gulpPath = WINDOWS ? 'node_modules\\.bin\\gulp.cmd' : 'node_modules/.bin/gulp';

    const angularWatch = cp.spawn(gulpPath, ['watch'], {
        stdio: 'inherit',
        cwd: '../ag-grid-angular'
    });

    app.use('/dev/ag-grid-angular', express.static('../ag-grid-angular'));

    process.on('exit', () => {
        angularWatch.kill();
    });
}

function serveAndWatchVue(app) {
    const gulpPath = WINDOWS ? 'node_modules\\.bin\\gulp.cmd' : 'node_modules/.bin/gulp';

    const vueWatch = cp.spawn(gulpPath, ['watch'], {
        stdio: 'inherit',
        cwd: '../ag-grid-vue'
    });

    app.use('/dev/ag-grid-vue', express.static('../ag-grid-vue'));

    process.on('exit', () => {
        vueWatch.kill();
    });
}

function launchTSCCheck() {
    if (!fs.existsSync('_dev')) {
        console.log('_dev not present, creating links...');
        mkdirp('_dev/ag-grid-community/dist');

        if(WINDOWS) {
            console.log('creating window links...');
            run('create-windows-links.bat').exec();
        } else {
            const linkType = 'symbolic';
            lnk('../ag-grid-community/src/main.ts', '_dev/ag-grid-community/', {force: true, type: linkType, rename: 'main.ts'});
            lnk('../ag-grid-community/src/ts', '_dev/ag-grid-community/dist', {force: true, type: linkType, rename: 'lib'});
            lnk('../ag-grid-enterprise/', '_dev', {force: true, type: linkType});
            lnk('../ag-grid-react/', '_dev', {force: true, type: linkType});
            lnk('../ag-grid-angular/exports.ts', '_dev/ag-grid-angular/', {
                force: true,
                type: linkType,
                rename: 'main.ts'
            });
            lnk('../ag-grid-angular/', '_dev', {force: true, type: linkType});
            lnk('../ag-grid-vue/', '_dev', {force: true, type: linkType});
        }
    }

    const tscPath = WINDOWS ? 'node_modules\\.bin\\tsc.cmd' : 'node_modules/.bin/tsc';

    const tsChecker = cp.spawn(tscPath, ['--watch', '--noEmit']);

    tsChecker.stdout.on('data', data => {
        data
            .toString()
            .trim()
            .split('\n')
            .filter(line => line.indexOf('Watching for') === -1 && line.indexOf('File change') === -1)
            .forEach(line => console.log(line.replace('_dev', '..').replace('/dist/lib/', '/src/ts/').red));
    });
}

const exampleDirMatch = new RegExp('src/([-\\w]+)/');
function watchAndGenerateExamples() {
    const callback = file => {
        let dir;
        if (file) {
            console.log(`${file} changed, regenerating`);
            try {
                dir = file.replace(/\\/g, '/').match(exampleDirMatch)[1];
            } catch (e) {
                throw new Error(`'${exampleDirMatch}' did not extract the example dir from '${file}'. Fix the regexp in dev-server.js`);
            }
        }
        console.log('regenerating examples...');
        generateExamples(() => console.log('generation done.'), dir);
    };

    callback();

    chokidar.watch('./src/*/*.php').on('change', callback);
    chokidar.watch('./src/*/*/*.{html,css,js}').on('change', callback);
}

module.exports = () => {
    const app = express();

    // necessary for plunkers
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return next();
    });

    // serve ag-grid, enterprise and react
    addWebpackMiddleware(app, 'standard', '/dev/ag-grid-community');
    addWebpackMiddleware(app, 'site', '/dist');
    addWebpackMiddleware(app, 'enterprise', '/dev/ag-grid-enterprise');
    addWebpackMiddleware(app, 'enterprise-bundle', '/dev/ag-grid-enterprise-bundle');
    addWebpackMiddleware(app, 'react', '/dev/ag-grid-react');

    // angular & vue are separate processes
    serveAndWatchAngular(app);
    serveAndWatchVue(app);

    // regenerate examples
    watchAndGenerateExamples();

    // PHP
    launchPhpCP(app);

    // Watch TS for errors. No actual transpiling happens here, just errors
    launchTSCCheck();

    app.listen(EXPRESS_PORT, function() {
        console.log(`ag-Grid dev server available on http://${HOST}:${EXPRESS_PORT}`);
    });
};

//     node dev-server.js generate-examples [src directory]
// eg: node dev-server.js generate-examples javascript-grid-accessing-data
console.log(process.argv);
if(process.argv.length >= 3 && process.argv[2] === 'generate-examples') {
    console.log('regenerating examples...');
    generateExamples(() => console.log('generation done.'), process.argv[3]);
}

