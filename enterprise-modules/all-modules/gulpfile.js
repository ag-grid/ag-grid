const gulp = require('gulp');
const {series, parallel} = gulp;
const path = require('path');
const fs = require('fs');
const merge = require('merge2');
const clean = require('gulp-clean');
const webpackStream = require('webpack-stream');
const TerserPlugin = require('terser-webpack-plugin');
const header = require('gulp-header');
const pkg = require('./package.json');

const ts = require('gulp-typescript');

const bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const buildEsmEs5 = () => {
    const tsProject = ts.createProject('tsconfig.esm.es5.json');
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist/esm/es5'));
};

const buildEsmEs6 = () => {
    const tsProject = ts.createProject('tsconfig.esm.es6.json');
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist/esm/es6'));
};

const buildCjsEs5 = () => {
    const tsProject = ts.createProject('tsconfig.cjs.es5.json');
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist/cjs/es5'));
};

const buildCjsEs6 = () => {
    const tsProject = ts.createProject('tsconfig.cjs.es6.json');
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist/cjs/es6'));
};

// Start of webpack related tasks
const webpackTask = (minify, styles, libraryTarget) => {
    const mainFile = styles ? './webpack-with-styles.js' : './webpack-no-styles.js';

    const isUmd = libraryTarget === 'umd';

    let fileName = 'ag-grid-enterprise';
    fileName += isUmd ? '' : `.${libraryTarget}`;
    fileName += minify ? '.min' : '';
    fileName += styles ? '' : '.noStyle';
    fileName += '.js';

    return gulp.src(mainFile)
        .pipe(webpackStream({
            mode: minify ? 'production' : 'none',
            optimization: {
                minimizer: !!minify ? [
                    new TerserPlugin({
                        terserOptions: {
                            output: {
                                comments: false
                            }
                        },
                        extractComments: false
                    })
                ] : [],
            },
            devtool: false,
            output: {
                path: path.join(__dirname, "dist"),
                filename: fileName,
                library: "agGrid",
                libraryTarget
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'string-replace-loader',
                        options: {

                            search: /\/\/# sourceMappingURL.*/g,
                            replace: ''
                        }
                    },
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
        .pipe(header(headerTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
};
// End of webpack related tasks

const copyGridCoreStyles = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-community/core/dist/styles')) {
        done("node_modules/@ag-grid-community/core/dist/styles doesn't exist - exiting")
    }

    // we don't have a dist folder in styles so just check for at least the core structural css file
    if (!fs.existsSync('./node_modules/@ag-grid-community/styles/ag-grid.css')) {
        done("./node_modules/@ag-grid-community/styles/ag-grid.css doesn't exist - exiting")
    }

    return merge([
            gulp.src('./node_modules/@ag-grid-community/core/dist/styles/**/*').pipe(gulp.dest('./dist/styles')),
            gulp.src('./node_modules/@ag-grid-community/styles/*.css').pipe(gulp.dest('./styles')),
            gulp.src('./node_modules/@ag-grid-community/styles/*.scss').pipe(gulp.dest('./styles'))
        ]
    );
};

gulp.task('clean', cleanDist);
gulp.task('buildCjs', parallel(buildCjsEs5, buildCjsEs6));
gulp.task('buildEsm', parallel(buildEsmEs5, buildEsmEs6));
gulp.task('build', parallel('buildCjs', 'buildEsm'));

// copy from grid-core tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);

// webpack related tasks
gulp.task('webpack', series(webpackTask.bind(null, false, true, 'umd')));
// gulp.task('webpack', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, true, 'umd')));
gulp.task('webpack-no-clean', series(webpackTask.bind(null, false, true, 'umd')));
gulp.task('webpack-minify', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, true, 'umd')));
gulp.task('webpack-minify-no-clean', series(webpackTask.bind(null, true, true, 'umd')));
gulp.task('webpack-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, false, 'umd')));
gulp.task('webpack-noStyle-no-clean', series(webpackTask.bind(null, false, false, 'umd')));
gulp.task('webpack-minify-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, false, 'umd')));
gulp.task('webpack-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false, 'umd')));

gulp.task('webpack-amd', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, true, 'amd')));
gulp.task('webpack-amd-no-clean', series(webpackTask.bind(null, false, true, 'amd')));
gulp.task('webpack-amd-minify', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, true, 'amd')));
gulp.task('webpack-amd-minify-no-clean', series(webpackTask.bind(null, true, true, 'amd')));
gulp.task('webpack-amd-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, false, 'amd')));
gulp.task('webpack-amd-noStyle-no-clean', series(webpackTask.bind(null, false, false, 'amd')));
gulp.task('webpack-amd-minify-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, false, 'amd')));
gulp.task('webpack-amd-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false, 'amd')));

// for us to be able to parallise the webpack compilations we need to pin webpack-stream to 5.0.0. See: https://github.com/shama/webpack-stream/issues/201
gulp.task('webpack-all-no-clean', series('copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean', 'webpack-amd-no-clean', 'webpack-amd-minify-no-clean', 'webpack-amd-noStyle-no-clean', 'webpack-amd-minify-noStyle-no-clean')));
gulp.task('webpack-all', series('clean', 'build', 'copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean', 'webpack-amd-no-clean', 'webpack-amd-minify-no-clean', 'webpack-amd-noStyle-no-clean', 'webpack-amd-minify-noStyle-no-clean')));

// default/release task
gulp.task('default', series('webpack-all'));

