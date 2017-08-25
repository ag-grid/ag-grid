var gulpTypescript = require('gulp-typescript');
var gulp = require('gulp');
var typescript = require('typescript');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var clean = require('gulp-clean');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var path = require('path');
const rename = require("gulp-rename");

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

var bundleTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', ['webpack-all']);
gulp.task('release', ['webpack-all']);

gulp.task('webpack-all', ['webpack', 'webpack-minify', 'webpack-noStyle', 'webpack-minify-noStyle'], tscTask);

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
    var project = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    var tsResult = gulp
        .src('src/**/*.ts')
        //.pipe(sourcemaps.init())
        .pipe(gulpTypescript(project));

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib'))
    ])
}

function webpackTask(minify, styles) {

    var plugins = [];
    if (minify) {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin(
                {
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    },
                    mangle: {
                        except:['csvCreator','CsvCreator']
                    }
                }
            )
        );
    }
    var mainFile = styles ? './webpack-with-styles.js' : './webpack.js';

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
                    {test: /\.css$/, loader: "style-loader!css-loader"}
                ]
            },
            plugins: plugins
        }))
        .pipe(header(bundleTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

gulp.task('publishForCI', () => {
    return gulp.src("./ag-grid-enterprise*.tgz")
        .pipe(rename("ag-grid-enterprise.tgz"))
        .pipe(gulp.dest("c:/ci/ag-grid-enterprise/"));

});