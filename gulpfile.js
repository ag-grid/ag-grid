var gulp = require('gulp');
var path = require('path');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
var stylus = require('gulp-stylus');
var buffer = require('vinyl-buffer');
var nib = require('nib');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var tsd = require('gulp-tsd');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');

var jasmine = require('gulp-jasmine');

var bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

var headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

var dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ceolter/>\n' +
    '// Definitions: https://github.com/borisyankov/DefinitelyTyped\n';

gulp.task('default', ['watch']);
gulp.task('release', ['copyToDocs-release']);

gulp.task('webpack-all', ['webpack','webpack-minify','webpack-noStyle','webpack-minify-noStyle'], tscTask);

gulp.task('tsc', ['cleanDist','cleanDocs'], tscTask);

gulp.task('webpack-minify-noStyle', ['tsc','stylus'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc','stylus'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc','stylus'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc','stylus'], webpackTask.bind(null, false, true));

gulp.task('copyToDocs-dev', ['webpack'], copyToDocsTask);
gulp.task('copyToDocs-release', ['webpack-all'], copyToDocsTask);

gulp.task('watch', ['copyToDocs-dev'], watchTask);
//gulp.task('tsd', tsdTask);
gulp.task('stylus', ['cleanDist','cleanDocs'], stylusTask);
gulp.task('cleanDist', cleanDist);
gulp.task('cleanDocs', cleanDocs);

function cleanDist() {
    return gulp
        .src('dist', {read: false})
        .pipe(clean());
}

function cleanDocs() {
    return gulp
        .src('docs/dist', {read: false})
        .pipe(clean());
}

//function tsdTask(callback) {
//    tsd({
//        command: 'reinstall',
//        config: './tsd.json'
//    }, callback);
//}

//function tsTestTask() {
//    return gulp.src('./spec/**/*.js')
//        .pipe(jasmine({
//            verbose: false
//        }));
//}

function tscTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        //.pipe(sourcemaps.init())
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
            .pipe(header(dtsHeaderTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            //.pipe(sourcemaps.write())
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

    var fileName = 'ag-grid';
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
    gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false
                }))
                .pipe(gulp.dest('./dist/styles/'));
        }));

}

function copyToDocsTask() {
    gulp.src('./dist/*')
        .pipe(gulp.dest('./docs/dist'));
}

function watchTask() {
    gulp.watch('./src/ts/**/*', ['copyToDocs-dev']);
    gulp.watch('./src/styles/**/*', ['copyToDocs-dev']);
}
