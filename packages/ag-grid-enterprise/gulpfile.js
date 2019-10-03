const gulpTypescript = require('gulp-typescript');
const gulp = require('gulp');
const {series, parallel} = gulp;
const typescript = require('typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const clean = require('gulp-clean');
const TerserPlugin = require('terser-webpack-plugin');
const webpackStream = require('webpack-stream');
const path = require('path');
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const tslint = require("gulp-tslint");

const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';
const bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

// Start of typescript related tasks
const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const cleanMain = () => {
    return gulp
        .src(['./main.d.ts', 'main.js'], {read: false, allowEmpty: true})
        .pipe(clean());
};

const cleanModules = () => {
    return gulp
        .src(['./*Module.d.ts', './*Module.js'], {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscSrcTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib'))
    ]);
};

const tscMainTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/lib/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./')),
        tsResult.js
            .pipe(replace("require(\"./", "require(\"./dist/lib/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./'))
    ]);
};

const tscModulesTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/modules/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/lib/"))
            .pipe(replace("\"../", "\"./dist/lib/"))
            .pipe(gulp.dest('./')),
        tsResult.js
            .pipe(replace("require(\"../", "require(\"./dist/lib/"))
            .pipe(gulp.dest('./'))
    ]);
};

const tscWatch = () => {
    gulp.watch([
            './node_modules/ag-grid-community/dist/lib/**/*',
            './src/**/*'
        ],
        series('tsc'));
};

const tscSrcEs2015Task = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-es2015.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es2015')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es2015'))
    ]);
};

const tscMainEs2015Task = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main-es2015.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/es2015/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./dist/es2015/')),
        tsResult.js
            .pipe(replace("require(\"./", "require(\"./dist/es2015/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./dist/es2015/'))
    ]);
};
// End of typescript related tasks

// Start of webpack related tasks
const webpackWatch = () => {
    gulp.watch([
            './node_modules/ag-grid-community/dist/lib/**/*',
            './src/**/*'
        ],
        series('webpack-noStyle'));
};

const webpackTask = (minify, styles) => {
    const mainFile = styles ? './webpack-with-styles.js' : './webpack.js';

    let fileName = 'ag-grid-enterprise';
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
        .pipe(gulp.dest('./dist/'));
};
// End of webpack related tasks

// Typescript related tasks
gulp.task('clean-dist', series(cleanDist));
gulp.task('clean-main', cleanMain);
gulp.task('clean-modules', cleanModules);
gulp.task('clean', parallel('clean-dist', 'clean-main', 'clean-modules'));
gulp.task('tsc-no-clean-src', tscSrcTask);
gulp.task('tsc-no-clean-main', tscMainTask);
gulp.task('tsc-no-clean-modules', tscModulesTask);
gulp.task('tsc-es2015-no-clean-src', tscSrcEs2015Task);
gulp.task('tsc-es2015-no-clean-main', tscMainEs2015Task);
gulp.task('tsc-es2015-no-clean', parallel('tsc-es2015-no-clean-src', 'tsc-es2015-no-clean-main'));
gulp.task('tsc-no-clean', parallel('tsc-no-clean-src', 'tsc-no-clean-main', 'tsc-no-clean-modules', 'tsc-es2015-no-clean'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));
gulp.task('tsc-watch', series('tsc', tscWatch));

// webpack related tasks
gulp.task('webpack', series('clean', 'tsc-no-clean', webpackTask.bind(null, false, true)));
gulp.task('webpack-no-clean', series(webpackTask.bind(null, false, true)));
gulp.task('webpack-minify', series('clean', 'tsc-no-clean', webpackTask.bind(null, true, true)));
gulp.task('webpack-minify-no-clean', series('tsc-no-clean', webpackTask.bind(null, true, true)));
gulp.task('webpack-noStyle', series('clean', 'tsc-no-clean', webpackTask.bind(null, false, false)));
gulp.task('webpack-noStyle-no-clean', series('tsc-no-clean', webpackTask.bind(null, false, false)));
gulp.task('webpack-minify-noStyle', series('clean', 'tsc-no-clean', webpackTask.bind(null, true, false)));
gulp.task('webpack-minify-noStyle-no-clean', series('tsc-no-clean', webpackTask.bind(null, true, false)));
// for us to be able to parallise the webpack compilations we need to pin webpack-stream to 5.0.0. See: https://github.com/shama/webpack-stream/issues/201
gulp.task('webpack-all', series('clean', 'tsc-no-clean', parallel('webpack-no-clean', 'webpack-minify-no-clean', 'webpack-noStyle-no-clean', 'webpack-minify-noStyle-no-clean')));
gulp.task('webpack-watch', series('webpack-noStyle', webpackWatch));

// default/release task
gulp.task('default', series('webpack-all'));

// lint tasks
gulp.task("tslint", () =>
    gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

