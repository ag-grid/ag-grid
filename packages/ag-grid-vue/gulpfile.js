const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const merge = require('merge2');

gulp.task('default', ['src']);

gulp.task('src', () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-lib.json');

    const tsResult = gulp
        .src('./src/**/*.ts', {typescript: typescript})
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('./lib')),
        tsResult.js
            .pipe(gulp.dest('./lib'))
    ]);
});

gulp.task('watch', ['src'], () => {
    gulp.watch([
            './src/*',
            './node_modules/ag-grid-community/dist/lib/**/*'],
        ['src']);
});
