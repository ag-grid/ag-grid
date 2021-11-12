const sucrase = require('@sucrase/gulp-plugin');
const { series } = require('gulp');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");
const stripTypes = () => {
    return gulp.src(["./doc-pages/**/main.ts"], { base: './' })
        .pipe(sucrase({ transforms: ['typescript'] }))
        .pipe(gulp.dest('./'))
};

const checkTypes = () => {
    return gulp.src(["./doc-pages/**/main.ts", "./custom-types/**"], { base: './' })
        .pipe(tsProject())
};

exports.default = series(checkTypes, stripTypes)
