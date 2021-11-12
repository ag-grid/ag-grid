const sucrase = require('@sucrase/gulp-plugin');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");
const stripTypes = () => {
    return gulp.src(["./doc-pages/column-moving/**/main.ts", "./typings/**"], { base: './' })
        .pipe(tsProject())
        .pipe(sucrase({ transforms: ['typescript'] }))
        .pipe(gulp.dest('./'))
};


console.log(`--------------------------------------------------------------------------------`);
console.log(`Stripping types from main.ts files...`);

const success = [
    stripTypes(),
].every(x => x);

if (success) {
    console.log(`Finished!`);
} else {
    console.error('Failed.');
    process.exitCode = 1;
}

console.log(`--------------------------------------------------------------------------------`);
