const gulp = require('gulp');
const path = require('path');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const foreach = require('gulp-foreach');
const rename = require("gulp-rename");
const stylus = require('gulp-stylus');
const buffer = require('vinyl-buffer');
const nib = require('nib');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const sourcemaps = require('gulp-sourcemaps');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const tsd = require('gulp-tsd');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const replace = require('gulp-replace');
const del = require('del');

const jasmine = require('gulp-jasmine');

const bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

const dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ceolter/>\n';

gulp.task('default', ['webpack-all']);
gulp.task('release', ['webpack-all']);

gulp.task('webpack-all', ['webpack','webpack-minify','webpack-noStyle','webpack-minify-noStyle'], tscTask);

gulp.task('webpack-minify-noStyle', ['tsc','stylus'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc','stylus'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc','stylus'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc','stylus'], webpackTask.bind(null, false, true));

gulp.task('stylus-watch', ['stylus-no-clean'], stylusWatch);
gulp.task('stylus-no-clean', stylusTask);

gulp.task('tsc', ['tsc-src'], tscExportsTask);
gulp.task('tsc-src', ['cleanDist'], tscTask);
gulp.task('tsc-exports', ['cleanExports'], tscExportsTask);
gulp.task('stylus', ['cleanDist'], stylusTask);

gulp.task('cleanDist', cleanDist);
gulp.task('cleanExports', cleanExports);

gulp.task('cleanForCI', ['cleanDist', 'cleanExports'], () => {
    return del('ag-grid*.tgz');
});

function stylusWatch() {
    gulp.watch('./src/styles/!**/!*', ['stylus-no-clean']);
}

function cleanDist() {
    return gulp
        .src('dist', {read: false})
        .pipe(clean());
}

function cleanExports() {
    return gulp
        .src(['./main.d.ts','main.js'], {read: false})
        .pipe(clean());
}

function tscTask() {
    const project = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(gulpTypescript(project));

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib'))
    ])
}

function tscExportsTask() {
    const project = gulpTypescript.createProject('./tsconfig-exports.json', {typescript: typescript});

    const tsResult = gulp
        .src('./exports.ts')
        .pipe(gulpTypescript(project));

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, { pkg : pkg }))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./'))
    ])
}

function webpackTask(minify, styles) {

    const plugins = [];
    if (minify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    }
    const mainFile = styles ? './main-with-styles.js' : './main.js';

    let fileName = 'ag-grid';
    fileName += minify ? '.min' : '';
    fileName += styles ? '' : '.noStyle';
    fileName += '.js';

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            entry: {
                main: mainFile
            },
            output: {
                path: path.join(__dirname, "dist"),
                filename: fileName,
                library: ["agGrid"],
                libraryTarget: "umd"
            },
            //devtool: 'inline-source-map',
            module: {
                loaders: [
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            },
            plugins: plugins
        }))
        .pipe(header(bundleTemplate, { pkg : pkg }))
        .pipe(gulp.dest('./dist/'));
}

function stylusTask() {
    // Uncompressed
    gulp.src(['src/styles/*.styl', '!src/styles/theme-common.styl'])
        .pipe(stylus({
            use: nib(),
            compress: false
        }))
        .pipe(gulp.dest('dist/styles'));
}

