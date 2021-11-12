const sucrase = require('@sucrase/gulp-plugin');
const { dest, series, src } = require('gulp');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");
const stripTypes = () => {
    return src(["./doc-pages/**/main.ts"], { base: './' })
        .pipe(sucrase({ transforms: ['typescript'] }))
        /* .pipe(rename(function (path) {
            // Updates the object in-place
            path.dirname += "/gen";
        })) */
        /* .pipe(rename(function (path) {
            // Updates the object in-place
            path.basename += "-generated";
        })) */
        .pipe(dest('./'))
};

const checkTypes = () => {
    return src(["./doc-pages/**/main.ts", "./custom-types/**"], { base: './' })
        .pipe(tsProject())
};

exports.default = series(checkTypes)
