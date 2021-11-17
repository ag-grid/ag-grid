const { src } = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");

const checkTypes = () => {
    return src(["./doc-pages/**/main.ts", "./custom-types/**"], { base: './' })
        .pipe(tsProject())
};

exports.default = checkTypes
