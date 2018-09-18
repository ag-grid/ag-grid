var path = require('path');

var gulp = require('gulp');
var replace = require('gulp-replace');
var gulpIf = require('gulp-if');
var filter = require('gulp-filter');
var merge = require('merge2');
var flatmap = require('gulp-flatmap');
var liveReload = require('gulp-livereload');
var named = require('vinyl-named');

var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');

var webpackStream = require('webpack-stream');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var autoprefixer = require('autoprefixer');

gulp.task('default', ['webpack'], watchTask);
gulp.task('watch-angular', ['webpack-angular'], watchAngularTask);
gulp.task('watch-react', ['webpack-react'], watchReactTask);

gulp.task('webpack', ['webpackEnterprise','webpackGrid'], liveReloadTask);
gulp.task('webpack-angular', ['tscAngularExample','webpackAngular','webpackEnterprise','webpackGrid'], liveReloadTask);
gulp.task('webpack-react', ['webpackReact','webpackEnterprise','webpackGrid'], liveReloadTask);

gulp.task('webpackReact', ['tscReact'], webpackReact);
gulp.task('webpackAngular', ['tscAngular'], webpackAngular);
gulp.task('webpackEnterprise', ['tscEnterprise'], webpackEnterprise);
gulp.task('webpackGrid', ['scssGrid','tscGrid'], webpackGrid);

gulp.task('tscGrid', tscGrid);
gulp.task('tscEnterprise', ['tscGrid'], tscEnterprise);
gulp.task('tscReact', ['tscEnterprise'], tscAngular);
gulp.task('tscAngular', ['tscEnterprise'], tscAngular);
gulp.task('tscAngularExample', ['tscAngular'], tscAngularExample);
gulp.task('tscReactExample', ['tscReact'], tscReactExample);

gulp.task('scssGrid', scssGrid);

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
    gulp.watch([
        '../ag-grid/src/**/*',
        '../ag-grid-enterprise/src/**/*',
        '../ag-grid-angular/src/**/*',
        '../ag-grid-angular-example/systemjs_aot/app/**/*'
    ], ['webpack-angular']);
    gulp.watch(['../ag-grid-docs/src/**/*','!../ag-grid-docs/src/dist/**/*'], ['liveReload']);
}

function watchReactTask() {
    // listen for changes with a custom port
    liveReload.listen();
    gulp.watch([
        '../ag-grid/src/**/*',
        '../ag-grid-enterprise/src/**/*',
        '../ag-grid-react/src/**/*',
        '../ag-grid-react-example/src/**/*'
    ], ['webpack-react']);
    gulp.watch(['../ag-grid-docs/src/**/*','!../ag-grid-docs/src/dist/**/*'], ['liveReload']);
}


function tscGrid() {
    var tsProject = gulpTypescript.createProject('../ag-grid/tsconfig.json', {typescript: typescript});

    var tsResult = gulp
        .src('../ag-grid/src/ts/**/*.ts')
        //.pipe(sourcemaps.init())
        .pipe(tsProject());

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

    var tsProject = gulpTypescript.createProject('../ag-grid-enterprise/tsconfig.json', {typescript: typescript});

    var tsResult = gulp
        .src('../ag-grid-enterprise/src/**/*.ts')
        //.pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-enterprise/dist/lib')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-enterprise/dist/lib'))
    ]);
}

function tscAngular() {
    var tsProject = gulpTypescript.createProject('../ag-grid-angular/tsconfig-gulp.json');

    var tsResult = gulp
        .src('../ag-grid-angular/src/**/*.ts', {typescript: typescript})
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-angular/dist')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-angular/dist'))
    ]);
}


function tscAngularExample() {
    var tsProject = gulpTypescript.createProject('../ag-grid-angular-example/systemjs_aot/tsconfig-gulp.json');

    var tsResult = gulp
        .src('../ag-grid-angular-example/systemjs_aot/app/boot.ts', {typescript: typescript})
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-angular-example/systemjs_aot/dist')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-angular-example/systemjs_aot/dist'))
    ]);
}

function tscReactExample() {
    var tsProject = gulpTypescript.createProject('../ag-grid-react-example/src/tsconfig.json');

    var tsResult = gulp
        .src('../ag-grid-react-example/src/index.js', {typescript: typescript})
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('../ag-grid-react-example/dist')),
        tsResult.js
            .pipe(gulp.dest('../ag-grid-react-example/dist'))
    ]);
}

function scssGrid() {
    // Uncompressed
    return gulp.src(['../ag-grid/src/styles/*.scss'])
        .pipe(flatmap(function(stream, file) {
            var currentTheme = path.basename(file.path, '.scss');
            var themeName = currentTheme.replace('theme-','');
            return stream.pipe(gulpIf(currentTheme !== 'ag-grid', replace('ag-common','ag-' + themeName)));
        }))
        .pipe(named())
        .pipe(webpackStream({
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            //resolve-url-loader may be chained before sass-loader if necessary
                            use: [
                                'css-loader', 
                                'sass-loader',
                                { loader: 'postcss-loader', options: { syntax: 'postcss-scss', plugins: [ autoprefixer() ] } },
                            ]
                        })
                    }, 
                    {
                        test: /\.(svg)$/,
                        use: [
                            {
                                loader: 'url-loader',
                                options: {
                                    limit: 8192
                                }
                            }
                        ]
                    }
                ]
            },
            plugins: [
                new ExtractTextPlugin('[name].css')
            ]
        }))
        .pipe(filter("**/*.css"))
        .pipe(gulp.dest('../ag-grid/dist/styles/'));
}

function liveReloadTask() {
    return gulp.src('./gulpfile.js').pipe(liveReload());
}

function webpackEnterprise() {

    var mainFile = '../ag-grid-enterprise/webpack-with-styles.js';
    var fileName = 'ag-grid-enterprise.js';

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            mode: 'development',
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
            mode: 'development',
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
            mode: 'development',
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

function webpackReact() {
    var mainFile = '../ag-grid-react/main.js';
    var fileName = 'ag-grid-react.js';

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            mode: 'development',
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
        .pipe(gulp.dest('../ag-grid-react/dist'));
}
