const gulp = require('gulp');
const {series, parallel} = gulp;

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

// Start of Typescript related tasks
const tscSrcTask = () => {
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
};

const tscMainTask = () => {
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
};

const cleanMain = () => {
    return gulp
        .src(['./main.d.ts', 'main.js'], {read: false, allowEmpty: true})
        .pipe(clean());
};

const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscWatch = () => {
    gulp.watch('./src/ts/**/*', series('tsc-no-clean'));
};

// End of Typescript related tasks

// Start of scss/css related tasks
const scssTask = () => {
    var f = filter(["**/*.css", '!*Font*.css'], {restore: true});

    return gulp.src(['src/styles/**/*.scss', '!src/styles/**/_*.scss'])
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
                                loader: "css-loader"
                            },
                            "sass-loader",
                            {
                                loader: 'postcss-loader',
                                options: {
                                    syntax: 'postcss-scss',
                                    plugins: [autoprefixer({
                                        overrideBrowserslist: ["last 2 version"],
                                        flexbox: true
                                    })]
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
                                    svgo: {
                                        cleanupAttrs: true,
                                        removeDoctype: true,
                                        removeComments: true,
                                        removeMetadata: true,
                                        removeTitle: true,
                                        removeDesc: true,
                                        removeEditorsNSData: true,
                                        removeUselessStrokeAndFill: true,
                                        cleanupIDs: true,
                                        collapseGroups: true,
                                        convertShapeToPath: true
                                    }
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
        .pipe(f)
        .pipe(gulp.dest('dist/styles/'))
        .pipe(f.restore)
        .pipe(filter('*Font*.css'))
        .pipe(gulp.dest('dist/styles/webfont/'));
};

const scssWatch = () => {
    gulp.watch('./src/styles/!**/!*', series('scss-no-clean'));
};
// End of scss/css related tasks

// Start of webpack related tasks
const webpackTask = (minify, styles) => {
    const mainFile = styles ? './main-with-styles.js' : './main.js';

    let fileName = 'ag-grid-community';
    fileName += minify ? '.min' : '';
    fileName += styles ? '' : '.noStyle';
    fileName += '.js';

    return gulp.src(mainFile)
        .pipe(webpackStream({
            mode: minify ? 'production' : 'none',
            output: {
                path: path.join(__dirname, "dist"),
                filename: fileName,
                library: ["agGrid"],
                libraryTarget: "umd"
            },
            module: {
                rules: [
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            'css-loader'
                        ].concat(
                            !!minify ?
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        ident: 'postcss',
                                        plugins: () => [
                                            require('cssnano')({
                                                preset: ['default', {
                                                    discardComments: {
                                                        removeAll: true,
                                                    },
                                                }]
                                            })
                                        ]
                                    }
                                } : []
                        )
                    }
                ]
            }
        }))
        .pipe(header(bundleTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
};

const watch = () => {
    gulp.watch('./src/ts/**/*', series('webpack'));
};
// End of webpack related tasks


// Typescript related tasks
gulp.task('clean-dist', cleanDist);
gulp.task('clean-main', cleanMain);
gulp.task('clean', parallel('clean-dist', 'clean-main'));
gulp.task('tsc-no-clean-src', tscSrcTask);
gulp.task('tsc-no-clean-main', tscMainTask);
gulp.task('tsc-no-clean', parallel('tsc-no-clean-src', 'tsc-no-clean-main'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));
gulp.task('tsc-watch', series('tsc-no-clean', tscWatch));

// scss/css related tasks
gulp.task('scss-no-clean', scssTask);
gulp.task('scss', series('clean', 'scss-no-clean'));
gulp.task('scss-watch', series('scss-no-clean', scssWatch));

// tsc & scss/css related tasks
gulp.task('tsc-scss-no-clean', parallel('tsc-no-clean', 'scss-no-clean'));

// webpack related tasks
gulp.task('webpack', series('clean', 'tsc-scss-no-clean', webpackTask.bind(null, false, true)));
gulp.task('webpack-no-clean', series(webpackTask.bind(null, false, true)));
gulp.task('webpack-minify', series('clean', 'tsc-scss-no-clean', webpackTask.bind(null, true, true)));
gulp.task('webpack-minify-no-clean', series(webpackTask.bind(null, true, true)));
gulp.task('webpack-noStyle', series('clean', 'tsc-scss-no-clean', webpackTask.bind(null, false, false)));
gulp.task('webpack-noStyle-no-clean', series(webpackTask.bind(null, false, false)));
gulp.task('webpack-minify-noStyle', series('clean', 'tsc-scss-no-clean', webpackTask.bind(null, true, false)));
gulp.task('webpack-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false)));
// for us to be able to parallise the webpack compilations we need to pin webpack-stream to 5.0.0. See: https://github.com/shama/webpack-stream/issues/201
gulp.task('webpack-all', series('clean', 'tsc-scss-no-clean', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean')));
gulp.task('watch', series('webpack', watch));

// default/release task
gulp.task('default', series('webpack-all'));


