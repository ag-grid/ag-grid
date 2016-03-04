var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var clean = require('gulp-clean');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var path = require('path');

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

var bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', ['webpack-all']);

gulp.task('webpack-all', ['webpack','webpack-minify','webpack-noStyle','webpack-minify-noStyle'], tscTask);

gulp.task('webpack-minify-noStyle', ['tsc'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc'], webpackTask.bind(null, false, true));

gulp.task('tsc', ['cleanDist'], tscTask);

gulp.task('cleanDist', cleanDist);

function cleanDist() {
    return gulp
        .src('dist', {read: false})
        .pipe(clean());
}

function tscTask() {
    var tsResult = gulp
        .src('src/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            module: 'commonjs',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            declarationFiles: true,
            target: 'es5',
            noImplicitAny: true
        }));

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib'))
    ])
}

function webpackTask(minify, styles) {

    var plugins = [];
    if (minify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    }
    var mainFile = styles ? './main-with-styles.js' : './main.js';

    var fileName = 'ag-grid-enterprise';
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