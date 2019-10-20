const gulp = require('gulp');
const {series, parallel} = gulp;

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
const cssnano = require('gulp-cssnano');
const filter = require('gulp-filter');
const named = require('vinyl-named');
const replace = require('gulp-replace');

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
const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscWatch = () => {
    gulp.watch('./src/ts/**/*', series('tsc-no-clean'));
};

const tscSrcTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/cjs')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/cjs'))
    ]);
};

const tscSrcEs6Task = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig.es6.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es6')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es6'))
    ]);
};
// End of Typescript related tasks

// Start of scss/css related tasks
const scssTask = () => {
    var f = filter(["**/*.css", '*Font*.css'], {restore: true});

    return gulp.src(['src/styles/**/*.scss', '!src/styles/**/_*.scss', '!**/node_modules/**'])
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

const minifyCss = () => {
    return gulp.src(['./dist/styles/*.css', '!./dist/styles/*.min.css'])
        .pipe(cssnano({
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        }))
        .pipe(rename(path => path.basename = `${path.basename}.min`))
        .pipe(gulp.dest('./dist/styles'));
};

const scssWatch = () => {
    gulp.watch('./src/styles/**/*', series('scss-no-clean'));
};
// End of scss/css related tasks

// Typescript related tasks
gulp.task('clean', cleanDist);
gulp.task('tsc-no-clean-es5', tscSrcTask);
gulp.task('tsc-no-clean-es6', tscSrcEs6Task);
gulp.task('tsc-no-clean', parallel('tsc-no-clean-es5', 'tsc-no-clean-es6'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));
gulp.task('tsc-watch', series('tsc-no-clean', tscWatch));

// scss/css related tasks
gulp.task('scss-no-clean', scssTask);
gulp.task('minify-css', minifyCss);
gulp.task('scss', series('clean', 'scss-no-clean'));
gulp.task('scss-watch', series('scss-no-clean', scssWatch));

// tsc & scss/css related tasks
gulp.task('tsc-scss-clean', series('clean', parallel('tsc-no-clean', series('scss-no-clean', 'minify-css'))));
gulp.task('tsc-scss-no-clean', parallel('tsc-no-clean', series('scss-no-clean', 'minify-css')));

gulp.task('watch', series('tsc-scss-no-clean'));

// default/release task
gulp.task('default', series('tsc-scss-clean'));


