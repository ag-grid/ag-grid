const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const tsConfig = 'tsconfig.json';
const rename = require('gulp-rename');

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

gulp.task('publishForCI', () => {
    return gulp.src("./ag-grid-react*.tgz")
        .pipe(rename("ag-grid-react.tgz"))
        .pipe(gulp.dest("c:/ci/ag-grid-react/"));

});