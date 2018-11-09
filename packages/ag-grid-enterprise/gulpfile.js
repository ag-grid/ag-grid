const gulpTypescript = require('gulp-typescript');
const gulp = require('gulp');
const typescript = require('typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const clean = require('gulp-clean');
const webpackStream = require('webpack-stream');
const path = require('path');
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const tslint = require("gulp-tslint");

const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';
const bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', ['webpack-all']);
gulp.task('release', ['webpack-all']);

gulp.task('webpack-all', ['webpack', 'webpack-minify', 'webpack-noStyle', 'webpack-minify-noStyle'], tscSrcTask);

gulp.task('webpack-minify-noStyle', ['tsc'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc'], webpackTask.bind(null, false, true));

gulp.task('tsc', ['tsc-src'], tscMainTask);
gulp.task('tsc-no-clean', tscSrcTask);
gulp.task('tsc-src', ['cleanDist', 'tslint'], tscSrcTask);
gulp.task('tsc-main', ['cleanMain'], tscMainTask);

gulp.task('cleanDist', cleanDist);
gulp.task('cleanMain', cleanMain);

gulp.task('watch', ['tsc'], tscWatch);

gulp.task("tslint", () =>
    gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

function tscWatch() {
    gulp.watch([
        './node_modules/ag-grid-community/dist/lib/**/*',
        './src/**/*'
    ],
    ['tsc']);
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
}

function tscMainTask() {
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
}

function webpackTask(minify, styles) {

    const mainFile = styles ? './webpack-with-styles.js' : './webpack.js';

    let fileName = 'ag-grid-enterprise';
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
