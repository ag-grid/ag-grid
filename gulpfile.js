
var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var tsConfig = 'tsconfig.json';

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

var tsProject = gulpTypescript.createProject(tsConfig);

gulp.task('default', tscTask);

function tscTask() {
    var tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib'))
    ]);
}