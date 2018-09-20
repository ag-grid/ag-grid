const gulp = require('gulp');
const path = require('path');
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const autoprefixer = require('autoprefixer');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const webpackStream = require('webpack-stream');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const filter = require('gulp-filter');
const named = require('vinyl-named');
const replace = require('gulp-replace');

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
    '// Definitions by: Niall Crosby <https://github.com/ag-grid/>\n';

gulp.task('default', ['webpack-all']);
gulp.task('release', ['webpack-all']);

gulp.task('webpack-all', ['webpack', 'webpack-minify', 'webpack-noStyle', 'webpack-minify-noStyle'], tscSrcTask);

gulp.task('webpack-minify-noStyle', ['tsc', 'scss'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc', 'scss'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc', 'scss'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc', 'scss'], webpackTask.bind(null, false, true));

gulp.task('scss-watch', ['scss-no-clean'], scssWatch);
gulp.task('scss-no-clean', scssTask);

gulp.task('tsc-no-clean', tscSrcTask);
gulp.task('tsc', ['tsc-src'], tscMainTask);
gulp.task('tsc-src', ['cleanDist'], tscSrcTask);
gulp.task('tsc-main', ['cleanMain'], tscMainTask);
gulp.task('scss', ['cleanDist'], scssTask);

gulp.task('cleanDist', cleanDist);
gulp.task('cleanMain', cleanMain);

gulp.task('tsc-watch', ['tsc-no-clean'], tscWatch);

function scssWatch() {
    gulp.watch('./src/styles/!**/!*', ['scss-no-clean']);
}

function tscWatch() {
    gulp.watch('./src/ts/**/*', ['tsc-no-clean']);
}

function cleanDist() {
    return gulp
        .src('dist', {read: false})
        .pipe(clean());
}

function cleanMain() {
    return gulp
        .src(['./main.d.ts', 'main.js'], {read: false})
        .pipe(clean());
}

function tscSrcTask() {
    const tsProject = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib'))
    ]);
}

function tscMainTask() {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/ts/main.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/lib/"))
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./')),
        tsResult.js
            .pipe(replace("require(\"./", "require(\"./dist/lib/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./'))
    ]);
}

function webpackTask(minify, styles) {
    const mainFile = styles ? './main-with-styles.js' : './main.js';

    let fileName = 'ag-grid-community';
    fileName += minify ? '.min' : '';
    fileName += styles ? '' : '.noStyle';
    fileName += '.js';

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            mode: minify ? 'production' : 'none',
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
                rules: [
                    {
                        test: /\.css$/, 
                        use: ['style-loader', {
                            loader:'css-loader',
                            options: {
                                minimze: !!minify
                            }
                        }]
                    }
                ]
            }
        }))
        .pipe(header(bundleTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function scssTask() {
    const svgMinOptions = {
        plugins: [
            {cleanupAttrs: true},
            {removeDoctype: true},
            {removeComments: true},
            {removeMetadata: true},
            {removeTitle: true},
            {removeDesc: true},
            {removeEditorsNSData: true},
            {removeUselessStrokeAndFill: true},
            {cleanupIDs: true},
            {collapseGroups: true},
            {convertShapeToPath: true}
        ]
    };

    // Uncompressed
    return gulp.src(['src/styles/*.scss', '!src/styles/_*.scss'])
        .pipe(named())
        .pipe(webpackStream({
            mode: 'none',
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: "css-loader",
                                options: {
                                    minimize: false
                                }
                            },
                            "sass-loader",
                            {
                                loader: 'postcss-loader',
                                options: {
                                    syntax: 'postcss-scss', 
                                    plugins: [autoprefixer()]
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(svg)$/,
                        use: [
                            'cache-loader',
                            {
                                loader: 'url-loader',
                                options: {
                                    limit: 8192
                                }
                            },
                            {
                                loader: 'image-webpack-loader',
                                options: {
                                    svgo: svgMinOptions
                                }
                            },
                            {
                                loader: 'svg-colorize-loader',
                                options: {
                                    color1: "#000000",
                                    color2: "#FFFFFF"
                                }
                            }
                        ]
                    }
                ]
            },
            plugins: [
                new MiniCssExtractPlugin('[name].css')
            ]
        }))
        .pipe(filter("**/*.css"))
        .pipe(gulp.dest('dist/styles/'));
}

