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

gulp.task('default', ['copyFromDocs','copyFromBootstrap','copyFromFontAwesome','webpack'], watchTask);

gulp.task('copyFromGrid', copyFromGrid);
gulp.task('tscGrid', ['copyFromGrid'], tscGrid);
gulp.task('stylusGrid', ['copyFromGrid'], stylusGrid);

gulp.task('copyFromEnterprise', copyFromEnterprise);
gulp.task('copyGridToEnterprise', ['webpackGrid'], copyGridToEnterprise);
gulp.task('tscEnterprise', ['copyFromEnterprise','copyGridToEnterprise','stylusGrid','tscGrid'], tscEnterprise);

gulp.task('webpack', ['webpackEnterprise','webpackGrid'], liveReloadTask);
gulp.task('webpackEnterprise', ['tscEnterprise'], webpackEnterprise);
gulp.task('webpackGrid', ['stylusGrid','tscGrid'], webpackGrid);


gulp.task('liveReloadAfterCopyFromDocs', ['copyFromDocs'], liveReloadTask);
gulp.task('copyFromDocs', copyFromDocs);
gulp.task('copyFromBootstrap', copyFromBootstrap);
gulp.task('copyFromFontAwesome', copyFromFontAwesome);

function watchTask() {
    liveReload.listen();
    gulp.watch(['../ag-grid/src/**/*','../ag-grid-enterprise/src/**/*'], ['webpack']);
    gulp.watch('../ag-grid-docs/src/**/*', ['liveReloadAfterCopyFromDocs']);
}

function copyFromGrid() {
    return gulp.src(['../ag-grid/*', '../ag-grid/src/**/*'], {base: '../ag-grid'})
        .pipe(gulp.dest('./node_modules/ag-grid'));
}

function copyFromEnterprise() {
    return gulp.src(['../ag-grid-enterprise/*', '../ag-grid-enterprise/src/**/*'], {base: '../ag-grid-enterprise'})
        .pipe(gulp.dest('./node_modules/ag-grid-enterprise'));
}

function copyGridToEnterprise() {
    return gulp.src('./node_modules/ag-grid/**/*')
        .pipe(gulp.dest('../ag-grid-enterprise/node_modules/ag-grid'));
}

function tscGrid() {
    var tsResult = gulp
        .src('./node_modules/ag-grid/src/ts/**/*.ts')
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
            .pipe(gulp.dest('./node_modules/ag-grid/dist/lib')),
        tsResult.js
            .pipe(gulp.dest('./node_modules/ag-grid/dist/lib'))
    ])
}

function tscEnterprise() {
    var tsResult = gulp
        .src('./node_modules/ag-grid-enterprise/src/**/*.ts')
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
            .pipe(gulp.dest('./node_modules/ag-grid-enterprise/dist/lib')),
        tsResult.js
            .pipe(gulp.dest('./node_modules/ag-grid-enterprise/dist/lib'))
    ])
}


function stylusGrid() {
    // Uncompressed
    gulp.src(['./node_modules/ag-grid/src/styles/*.styl', '!./node_modules/ag-grid/src/styles/theme-common.styl'])
        .pipe(foreach(function(stream, file) {
            var currentTheme = path.basename(file.path, '.styl');
            var themeName = currentTheme.replace('theme-','');
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false
                }))
                .pipe(gulpIf(currentTheme !== 'ag-grid', replace('ag-common','ag-' + themeName)))
                .pipe(gulp.dest('./node_modules/ag-grid/dist/styles/'));
        }));
}

function liveReloadTask() {
    return gulp.src('./gulpfile.js').pipe(liveReload());
}

function webpackEnterprise() {

    var mainFile = './node_modules/ag-grid-enterprise/webpack-with-styles.js';
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
        .pipe(gulp.dest('./web-root/dist'));
}

function webpackGrid() {

    var mainFile = './node_modules/ag-grid/main-with-styles.js';
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
        .pipe(gulp.dest('./web-root/dist'));
}

function copyFromDocs() {
    return gulp.src(['../ag-grid-docs/src/**/*'])
        .pipe(gulp.dest('./web-root'));
}

function copyFromBootstrap() {
    return gulp.src([
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/bootstrap/dist/css/bootstrap.css',
            './node_modules/bootstrap/dist/css/bootstrap-theme.css'
        ])
        .pipe(gulp.dest('./web-root/dist'));
}

function copyFromFontAwesome() {
    return gulp.src([
            './node_modules/font-awesome/css/font-awesome.css',
            './node_modules/font-awesome/fonts/*'
        ]
        , {base: './node_modules/font-awesome'}
        )
        .pipe(gulp.dest('./web-root/font-awesome'));
}
