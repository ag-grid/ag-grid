const sucrase = require('@sucrase/gulp-plugin');
const { dest, series, src } = require('gulp');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");
const stripTypes = () => {
    return src(["./doc-pages/**/main.ts"], { base: './' })
        .pipe(sucrase({ transforms: ['typescript'] }))
        .pipe(dest((d) => {
            return d.path.replace('main.js', '_gen/main.js');
        }))
};

const checkTypes = () => {
    return src(["./doc-pages/**/main.ts", "./custom-types/**"], { base: './' })
        .pipe(tsProject())
};

exports.default = series(checkTypes, stripTypes)
