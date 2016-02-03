var gulp = require('gulp');
var path = require('path');
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
gulp.task('release', ['webpack','webpack-minify','copyToDocs']);

gulp.task('tsc', tscTask);
gulp.task('webpack-minify', ['tsc','stylus'], webpackTask.bind(null, true));
gulp.task('webpack', ['tsc','stylus'], webpackTask.bind(null, false));

gulp.task('copyToDocs', ['webpack'], copyToDocsTask);

gulp.task('watch', ['copyToDocs'], watchTask);
gulp.task('tsd', tsdTask);
gulp.task('stylus', stylusTask);

function tsdTask(callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
}

//function tsTestTask() {
//    return gulp.src('./spec/**/*.js')
//        .pipe(jasmine({
//            verbose: false
//        }));
//}

function tscTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
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
            .pipe(gulp.dest('lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib'))
    ])
}

function webpackTask(minify) {

    var plugins = [];
    var fileName;
    if (minify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
        fileName = 'ag-grid.min.js';
    } else {
        fileName = 'ag-grid.js';
    }

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            entry: {
                main: "./main-webpack.js"
            },
            output: {
                path: path.join(__dirname, "dist"),
                filename: fileName,
                library: ["agGrid"],
                libraryTarget: "umd"
            },
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
                .pipe(gulp.dest('./styles/'));
        }));

}

function copyToDocsTask() {
    gulp.src('./dist/*')
        .pipe(gulp.dest('./docs/dist'));
}

function watchTask() {
    gulp.watch('./src/ts/**/*', ['copyToDocs']);
    gulp.watch('./src/styles/**/*', ['copyToDocs']);
}
