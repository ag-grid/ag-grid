const gulp = require('gulp');
const {series, parallel} = gulp;
const path = require('path');
const fs = require('fs');
const clean = require('gulp-clean');
const webpackStream = require('webpack-stream');
const TerserPlugin = require('terser-webpack-plugin');
const header = require('gulp-header');
const pkg = require('./package.json');

const ts = require('gulp-typescript');

const tsEs6Project = ts.createProject('tsconfig.es6.json');
const tsEs5Project = ts.createProject('tsconfig.es5.json');
const tsDocsProject = ts.createProject('tsconfig.docs.json');

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

const buildEs6 = () => {
    const tsResult = tsEs6Project.src()
        .pipe(tsEs6Project());

    return tsResult.js.pipe(gulp.dest('dist/es6'));
};

const buildEs5 = () => {
    const tsResult = tsEs5Project.src()
        .pipe(tsEs5Project());

    return tsResult.js.pipe(gulp.dest('dist/es5'));
};

const buildDocs = () => {
    const tsResult = tsEs5Project.src()
        .pipe(tsDocsProject());

    return tsResult.js.pipe(gulp.dest('dist/cjs'));
};

// Start of webpack related tasks
const webpackTask = (minify, styles) => {
    const mainFile = styles ? './webpack-with-styles.js' : './webpack-no-styles.js';

    let fileName = 'ag-grid-community';
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
        .pipe(header(headerTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
};
// End of webpack related tasks

const copyGridCoreStyles = (done) => {
    if(!fs.existsSync('./node_modules/@ag-grid-community/grid-core/dist/styles')) {
        done("node_modules/@ag-grid-community/grid-core/dist/styles doesn't exist - exiting")
    }

    return gulp.src('./node_modules/@ag-grid-community/grid-core/dist/styles/**/*').pipe(gulp.dest('./dist/styles'));
};

gulp.task('clean', cleanDist);
gulp.task('buildEs5', buildEs5);
gulp.task('buildEs6', buildEs6);
gulp.task('buildDocs', buildDocs);
gulp.task('build', parallel('buildEs5', 'buildEs6'));

// copy from grid-core tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);

// webpack related tasks
gulp.task('webpack', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, true)));
gulp.task('webpack-no-clean', series(webpackTask.bind(null, false, true)));
gulp.task('webpack-minify', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, true)));
gulp.task('webpack-minify-no-clean', series(webpackTask.bind(null, true, true)));
gulp.task('webpack-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, false, false)));
gulp.task('webpack-noStyle-no-clean', series(webpackTask.bind(null, false, false)));
gulp.task('webpack-minify-noStyle', series('clean', 'build', 'copy-grid-core-styles', webpackTask.bind(null, true, false)));
gulp.task('webpack-minify-noStyle-no-clean', series(webpackTask.bind(null, true, false)));

// for us to be able to parallise the webpack compilations we need to pin webpack-stream to 5.0.0. See: https://github.com/shama/webpack-stream/issues/201
gulp.task('webpack-all-no-clean', series('copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean')));
gulp.task('webpack-all', series('clean', 'build', 'copy-grid-core-styles', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean')));

// default/release task
gulp.task('default', series('webpack-all'));


