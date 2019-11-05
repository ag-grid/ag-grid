const gulp = require('gulp');
const {series, parallel} = gulp;

const fs = require('fs');
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const replace = require('gulp-replace');

const headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

const dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ag-grid/>\n';

// Start of Typescript related tasks
const tscSrcTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/lib'))
    ]);
};

const tscMainTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/lib/"))
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./')),
        tsResult.js
            .pipe(replace("require(\"./", "require(\"./dist/lib/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./'))
    ]);
};

const cleanMain = () => {
    return gulp
        .src(['./main.d.ts', 'main.js'], {read: false, allowEmpty: true})
        .pipe(clean());
};

const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscWatch = () => {
    gulp.watch('./src/**/*', series('tsc-no-clean'));
};

const tscSrcEs6Task = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig.es6.json', {typescript: typescript});

    const tsResult = gulp
        .src('src/**/*.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es6')),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest('dist/es6'))
    ]);
};

const tscMainEs6Task = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.es6.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(replace("\"./", "\"./dist/es6/"))
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(rename("main.d.ts"))
            .pipe(gulp.dest('./dist/es6/')),
        tsResult.js
            .pipe(replace("require(\"./", "require(\"./dist/es6/"))
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(rename("main.js"))
            .pipe(gulp.dest('./dist/es6/'))
    ]);
};
// End of Typescript related tasks

const copyGridCoreStyles = (done) => {
    if(!fs.existsSync('./node_modules/@ag-grid-community/core/dist/styles')) {
        done("node_modules/@ag-grid-community/core/dist/styles doesn't exist - exiting")
    }

    return gulp.src('./node_modules/@ag-grid-community/core/dist/styles/**/*').pipe(gulp.dest('./dist/styles'));
};

const copyGridAllUmdFiles = (done) => {
    if(!fs.existsSync('./node_modules/@ag-grid-community/all-modules/dist')) {
        done("./node_modules/@ag-grid-community/all-modules/dist doesn't exist - exiting")
    }

    return gulp.src('./node_modules/@ag-grid-community/all-modules/dist/ag-grid-community*.js').pipe(gulp.dest('./dist/'));
};

// copy from grid-core tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);
gulp.task('copy-umd-files', copyGridAllUmdFiles);

// Typescript related tasks
gulp.task('clean-dist', cleanDist);
gulp.task('clean-main', cleanMain);
gulp.task('clean', parallel('clean-dist', 'clean-main'));
gulp.task('tsc-no-clean-src', tscSrcTask);
gulp.task('tsc-no-clean-main', tscMainTask);
gulp.task('tsc-es6-no-clean-src', tscSrcEs6Task);
gulp.task('tsc-es6-no-clean-main', tscMainEs6Task);
gulp.task('tsc-es6-no-clean', parallel('tsc-es6-no-clean-src', 'tsc-es6-no-clean-main'));
gulp.task('tsc-no-clean', parallel('tsc-no-clean-src', 'tsc-no-clean-main', 'tsc-es6-no-clean'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));

// webpack related tasks
gulp.task('package', series('tsc', 'copy-grid-core-styles', 'copy-umd-files'));

// default/release task
gulp.task('default', series('package'));


