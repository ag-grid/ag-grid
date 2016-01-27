var gulp = require('gulp');
//var path = require('path');
var uglify = require('gulp-uglify');
//var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
//var stylus = require('gulp-stylus');
var buffer = require('vinyl-buffer');
//var nib = require('nib');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
//var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var tsd = require('gulp-tsd');

    //"gulp-foreach": "0.1.0",
    //"gulp-stylus": "2.2.0",
    //"gulp-sourcemaps": "1.5.2",
    //"json-stable-stringify": "1.0.0",
    //"jasmine-core": "2.4.1",
    //"gulp-jasmine": "2.2.1",
    //"nib": "^1.1.0",
    //"stylus": "0.53.0",

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
    '// Definitions by: Niall Crosby <https://github.com/ceolter/>\n';

gulp.task('default', ['tsd'], tsReleaseTask);

function tsReleaseTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            //experimentalDecorators: true,
            //emitDecoratorMetadata: true,
            target: 'es5',
            //module: 'commonjs',
            //jsx: 'react',
            declarationFiles: true,
            out: 'ag-grid-react-component.js'
        }));

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(rename('ag-grid-react-component.js'))
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('./dist'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(rename('ag-grid-react-component.min.js'))
            .pipe(gulp.dest('./dist'))
    ]);
}

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});