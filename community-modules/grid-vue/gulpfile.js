const gulp = require('gulp');
const {series} = require('gulp');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const merge = require('merge2');

const compileSource = () => {
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
};

const watch = () => {
    gulp.watch([
            './src/*',
            './node_modules/ag-grid-community/dist/lib/**/*'],
        compileSource);
};


gulp.task('compile-source', compileSource);
gulp.task('watch', series('compile-source', watch));
gulp.task('default', series('compile-source'));
