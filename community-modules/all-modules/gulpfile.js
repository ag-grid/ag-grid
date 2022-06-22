const gulp = require('gulp');
const {series, parallel} = gulp;
const path = require('path');
const fs = require('fs');
const clean = require('gulp-clean');
const webpackStream = require('webpack-stream');
const TerserPlugin = require('terser-webpack-plugin');
const header = require('gulp-header');
const pkg = require('./package.json');
const merge = require('merge2');

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
// Start of webpack related tasks
const webpackTask = (minify, styles, libraryTarget) => {
    const mainFile = styles ? './webpack-with-styles.js' : './webpack-no-styles.js';

    const isUmd = libraryTarget === 'umd';

    let fileName = 'ag-grid-community';
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
                        loader:  'string-replace-loader',
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
    if(!fs.existsSync('./node_modules/@ag-grid-community/core/dist/styles')) {
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

// copy from grid-core tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);

// webpack related tasks
gulp.task('webpack-no-clean', series(webpackTask.bind(null, false, true, 'umd')));
gulp.task('webpack-minify-no-clean', series(webpackTask.bind(null, true, true, 'umd')));
gulp.task('webpack-noStyle-no-clean', series(webpackTask.bind(null, false, false, 'umd')));
gulp.task('webpack-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false, 'umd')));
gulp.task('webpack-amd-no-clean', series(webpackTask.bind(null, false, true, 'amd')));
gulp.task('webpack-amd-minify-no-clean', series(webpackTask.bind(null, true, true, 'amd')));
gulp.task('webpack-amd-noStyle-no-clean', series(webpackTask.bind(null, false, false, 'amd')));
gulp.task('webpack-amd-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false, 'amd')));

// for us to be able to parallise the webpack compilations we need to pin webpack-stream to 5.0.0. See: https://github.com/shama/webpack-stream/issues/201
gulp.task('webpack-all-no-clean', series('copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean', 'webpack-amd-no-clean', 'webpack-amd-minify-no-clean', 'webpack-amd-noStyle-no-clean', 'webpack-amd-minify-noStyle-no-clean')));
gulp.task('webpack-all', series('clean', 'copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean', 'webpack-amd-no-clean', 'webpack-amd-minify-no-clean', 'webpack-amd-noStyle-no-clean', 'webpack-amd-minify-noStyle-no-clean')));

// default/release task
gulp.task('default', series('webpack-all'));


