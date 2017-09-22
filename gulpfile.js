var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');

var htmlmin = require('gulp-htmlmin');
var uncss = require('gulp-uncss');
const debug = require('gulp-debug');

const cp = require('child_process');

const webpack = require('webpack-stream');
const named = require('vinyl-named');
const webpackConfig = require('./webpack.config.js');
const path = require('path');

const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const replace = require('gulp-replace');

gulp.task('process-src', processSrc);
gulp.task('copy-from-ag-grid', copyFromAgGrid);
gulp.task('copy-from-ag-grid-enterprise', copyFromAgGridEnterprise);

gulp.task('release', ['process-src', 'bundle-site', 'copy-from-ag-grid', 'copy-from-ag-grid-enterprise']);
gulp.task('default', ['release']);

/* for ci */
gulp.task('copy-ag-dependencies-to-dist', ['copy-ag-grid-to-dist', 'copy-ag-grid-enterprise-to-dist']);
gulp.task('copy-ag-grid-to-dist', copyAgGridToDist);
gulp.task('copy-ag-grid-enterprise-to-dist', copyAgGridEnterpriseToDist);

gulp.task('bundle-site', () => {
    // remove entry, we will pipe the site file
    // the rest of the files will come from CDN
    delete webpackConfig.entry; // = [ './src/_assets/ts/site.ts'  ];

    // delete webpackConfig.output.path;

    return gulp
        .src('./src/_assets/ts/site.ts')
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/dist'));
});

const SKIP_INLINE = true;

// the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
function processSrc() {
    const version = require('../ag-grid/package.json').version;

    const phpFilter = filter('**/*.php', {restore: true});
    const bootstrapFilter = filter('src/dist/bootstrap/css/bootstrap.css', {
        restore: true
    });

    const uncssPipe = uncss({
        html: ['src/**/*.php', 'src/**/*.html'],
        ignore: ['.nav-pills > li.active > a', '.nav-pills > li.active > a:hover', '.nav-pills > li.active > a:focus']
    });

    return (
        gulp
            .src(['./src/**/*', '!./src/dist/ag-grid/', '!./src/dist/ag-grid-enterprise/'])
            // inline the PHP part
            .pipe(phpFilter)
            // .pipe(debug())
            .pipe(gulpIf(!SKIP_INLINE, inlinesource()))
            .pipe(phpFilter.restore)
            // do uncss
            .pipe(bootstrapFilter)
            // .pipe(debug())
            .pipe(gulpIf(!SKIP_INLINE, uncssPipe))
            .pipe(bootstrapFilter.restore)
            .pipe(gulp.dest('./dist'))
    );
}

gulp.task('replace-to-cdn', () => {
    const version = require('../ag-grid/package.json').version;

    return gulp
        .src('./dist/config.php')
        .pipe(replace('$$LOCAL$$', version))
        .pipe(gulp.dest('./dist'));
});

function copyAgGridToDist() {
    return gulp.src(['./node_modules/ag-grid/dist/ag-grid.js']).pipe(gulp.dest('./src/dist/ag-grid/'));
}

function copyAgGridEnterpriseToDist() {
    return gulp
        .src(['./node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.js'])
        .pipe(gulp.dest('./src/dist/ag-grid-enterprise/'));
}

function copyFromAgGrid() {
    return gulp.src(['../ag-grid/dist/ag-grid.js']).pipe(gulp.dest('./dist/dist/ag-grid/'));
}

function copyFromAgGridEnterprise() {
    return gulp
        .src([
            '../ag-grid-enterprise/dist/ag-grid-enterprise.js',
            '../ag-grid-enterprise/dist/ag-grid-enterprise.min.js'
        ])
        .pipe(gulp.dest('./dist/dist/ag-grid-enterprise'));
}

gulp.task('serve', cb => {
    const webpackDevServerCmd =
        process.platform == 'win32'
            ? '.\\node_modules\\.bin\\webpack-dev-server.cmd'
            : './node_modules/.bin/webpack-dev-server';

    const php = cp.spawn('php', ['-S', '127.0.0.1:8888', '-t', 'src'], {
        stdio: 'inherit',
        env: {AG_DEV: 'true'}
    });
    const gulp = cp.spawn(webpackDevServerCmd, {stdio: 'inherit'});

    process.on('exit', () => {
        php.kill();
        gulp.kill();
    });
});

gulp.task('serve-release', () => {
    const php = cp.spawn('php', ['-S', '127.0.0.1:9090', '-t', 'dist'], {
        stdio: 'inherit'
    });

    process.on('exit', () => {
        php.kill();
    });
});

gulp.task('serve-preview', () => {
    const php = cp.spawn('php', ['-S', '127.0.0.1:9999', '-t', 'dist'], {
        stdio: 'inherit'
    });
    process.on('exit', () => {
        php.kill();
    });
});

const express = require('express');
const realWebpack = require('webpack');
const proxy = require('express-http-proxy');
const webpackMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

function addWebpackMiddleware(app, configPath, path) {
    const webpackConfig = require(configPath);
    const compiler = realWebpack(webpackConfig);
    app.use(path, 
        webpackMiddleware(compiler, {
            noInfo: true, 
            publicPath: '/'
        })
    );

    app.use(path, hotMiddleware(compiler));
}

gulp.task('s', callback => {
    const app = express();

    const angularWatch = cp.spawn('gulp', ['watch'], {
        stdio: 'inherit',
        cwd: '../ag-grid-angular'
    });

    const php = cp.spawn('php', ['-S', '127.0.0.1:8888', '-t', 'src'], {
        stdio: 'inherit',
        env: {AG_DEV: 'true'}
    });

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return next();
    });

    addWebpackMiddleware(app, './webpack.ag-grid.config', '/dev/ag-grid/');
    addWebpackMiddleware(app, './webpack.site.config', '/dist/');
    addWebpackMiddleware(app, './webpack.ag-grid-enterprise.config', '/dev/ag-grid-enterprise');
    addWebpackMiddleware(app, './webpack.ag-grid-enterprise-bundle.config', '/dev/ag-grid-enterprise-bundle');
    addWebpackMiddleware(app, './webpack.ag-grid-react.config', '/dev/ag-grid-react');

    app.use('/dev/ag-grid-angular', express.static('../ag-grid-angular'));
    app.use(
        '/',
        proxy('http://127.0.0.1:8888', {
            proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
                proxyReqOpts.headers['X-PROXY-HTTP-HOST'] = srcReq.headers.host;
                return proxyReqOpts;
            }
        })
    );

    app.listen(3000, function() {
        console.log('Example app listening on port 3000!');
    });
});
