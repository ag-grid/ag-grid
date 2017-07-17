var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var merge = require('merge2');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var path = require('path');
var foreach = require('gulp-foreach');
var stylus = require('gulp-stylus');
var nib = require('nib');
var liveReload = require('gulp-livereload');
var replace = require('gulp-replace');
var gulpIf = require('gulp-if');

gulp.task('default', ['webpack'], watchTask);
gulp.task('watch-angular', ['webpack-angular'], watchAngularTask);

gulp.task('webpack', ['webpackEnterprise','webpackGrid'], liveReloadTask);
gulp.task('webpack-angular', ['webpackAngular','webpackEnterprise','webpackGrid'], liveReloadTask);
gulp.task('webpackAngular', ['tscAngular'], webpackAngular);
gulp.task('webpackEnterprise', ['tscEnterprise'], webpackEnterprise);
gulp.task('webpackGrid', ['stylusGrid','tscGrid'], webpackGrid);

gulp.task('tscGrid', tscGrid);
gulp.task('tscEnterprise', ['tscGrid'], tscEnterprise);
gulp.task('tscAngular', ['tscEnterprise'], tscAngular);

gulp.task('stylusGrid', stylusGrid);

gulp.task('liveReload', liveReloadTask);

function watchTask() {
    // listen for changes with a custom port
    liveReload.listen();
    gulp.watch(['../ag-grid/src/**/*','../ag-grid-enterprise/src/**/*'], ['webpack']);
    gulp.watch(['../ag-grid-docs/src/**/*','!../ag-grid-docs/src/dist/**/*'], ['liveReload']);
}

function watchAngularTask() {
    // listen for changes with a custom port
    liveReload.listen();
    gulp.watch(['../ag-grid/src/**/*','../ag-grid-enterprise/src/**/*','../ag-grid-angular/src/**/*'], ['webpack-angular']);
    gulp.watch(['../ag-grid-docs/src/**/*','!../ag-grid-docs/src/dist/**/*'], ['liveReload']);
}

function tscGrid() {
    var project = gulpTypescript.createProject('../ag-grid/tsconfig.json', {typescript: typescript});

    var tsResult = gulp
        .src('../ag-grid/src/ts/**/*.ts')
        //.pipe(sourcemaps.init())
        .pipe(project());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid/dist/lib')),
        tsResult.js
        // .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('../ag-grid/dist/lib'))
    ]);
}

function tscEnterprise() {

    var project = gulpTypescript.createProject('../ag-grid-enterprise/tsconfig.json', {typescript: typescript});

    var tsResult = gulp
        .src('../ag-grid-enterprise/src/**/*.ts')
        //.pipe(sourcemaps.init())
        .pipe(project());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-enterprise/dist/lib')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-enterprise/dist/lib'))
    ]);
}

function tscAngular() {
    var project = gulpTypescript.createProject('../ag-grid-angular/tsconfig-gulp.json');

    var tsResult = gulp
        .src('../ag-grid-angular/src/**/*.ts', {typescript: typescript})
        .pipe(project());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-angular/dist')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-angular/dist'))
    ]);
}
function stylusGrid() {
    // Uncompressed
    gulp.src(['../ag-grid/src/styles/*.styl', '!../ag-grid/src/styles/theme-common.styl'])
        .pipe(foreach(function(stream, file) {
            var currentTheme = path.basename(file.path, '.styl');
            var themeName = currentTheme.replace('theme-','');
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false
                }))
                .pipe(gulpIf(currentTheme !== 'ag-grid', replace('ag-common','ag-' + themeName)))
                .pipe(gulp.dest('../ag-grid/dist/styles/'));
        }));
}

function liveReloadTask() {
    return gulp.src('./gulpfile.js').pipe(liveReload());
}

function webpackEnterprise() {

    var mainFile = '../ag-grid-enterprise/webpack-with-styles.js';
    var fileName = 'ag-grid-enterprise.js';

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
            module: {
                loaders: [
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            }
        }))
        .pipe(gulp.dest('../ag-grid-enterprise/dist'));
}

function webpackGrid() {

    var mainFile = '../ag-grid/main-with-styles.js';
    var fileName = 'ag-grid.js';

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
            module: {
                loaders: [
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            }
        }))
        .pipe(gulp.dest('../ag-grid/dist'));
}

function webpackAngular() {

    var mainFile = '../ag-grid-angular/main.js';
    var fileName = 'ag-grid-angular.js';

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
            module: {
                loaders: [
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            }
        }))
        .pipe(gulp.dest('../ag-grid-angular/dist'));
}