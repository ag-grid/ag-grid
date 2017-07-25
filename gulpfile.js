const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const tsConfig = 'tsconfig.json';

const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const tsProject = gulpTypescript.createProject(tsConfig);

gulp.task('default', tscTask);

function tscTask() {
    const tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('lib')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('lib'))
    ]);
}