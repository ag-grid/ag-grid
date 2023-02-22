const gulp = require('gulp');
const {series, parallel} = gulp;
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const gulpif = require('gulp-if');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');

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
const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscTask = async (tsConfigFile, destination, sourceMaps) => {
    const tsProject = gulpTypescript.createProject(tsConfigFile, {typescript: typescript});

    const tsResult = gulp
        .src(['src/ts/**/*.ts', '!src/ts/**/*.test.ts', '!src/ts/test-utils/mock.ts'])
        .pipe(gulpif(sourceMaps, sourcemaps.init()))
        .pipe(tsProject());

    return await merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
            .pipe(gulp.dest(destination)),
        tsResult.js
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulpif(sourceMaps, sourcemaps.write('.')))
            .pipe(gulp.dest(destination))
    ]);

}

const tscSrcCjsEs5Task = async () => {
    return await tscTask('tsconfig.cjs.es5.json', 'dist/cjs/es5', true);
};

const tscSrcCjsEs6Task = async () => {
    return await tscTask('tsconfig.cjs.es6.json', 'dist/cjs/es6', true);
};

const tscSrcEsModulesEs6Task = async () => {
    return await tscTask('tsconfig.esm.es6.json', 'dist/esm/es6', true);
};

const tscSrcEsModulesEs5Task = async () => {
    return await tscTask('tsconfig.esm.es5.json', 'dist/esm/es5', true);
};

const tscSrcCjsEs5ProdTask = async () => {
    return await tscTask('tsconfig.cjs.es5.json', 'dist/cjs/es5', false);
};

const tscSrcCjsEs6ProdTask = async () => {
    return await tscTask('tsconfig.cjs.es6.json', 'dist/cjs/es6', false);
};

const tscSrcEsModulesEs6ProdTask = async () => {
    return await tscTask('tsconfig.esm.es6.json', 'dist/esm/es6', false);
};

const tscSrcEsModulesEs5ProdTask = async () => {
    return await tscTask('tsconfig.esm.es5.json', 'dist/esm/es5', false);
};

const watch = () => {
    return gulp.watch(['./src/ts/**/*.ts'], tscSrcEsModulesEs5Task);
};

const watchAndBuildBoth = () => {
    return gulp.watch(['./src/ts/**/*.ts'], parallel[tscSrcCjsEs5Task, tscSrcEsModulesEs5Task]);
};

// End of Typescript related tasks

// Typescript related tasks
gulp.task('clean', cleanDist);
gulp.task('tsc-no-clean-cjs', parallel(tscSrcCjsEs5Task, tscSrcCjsEs6Task));
gulp.task('tsc-no-clean-esm', parallel(tscSrcEsModulesEs5Task, tscSrcEsModulesEs6Task));
gulp.task('tsc-no-clean-cjs-prod', parallel(tscSrcCjsEs5ProdTask, tscSrcCjsEs6ProdTask));
gulp.task('tsc-no-clean-esm-prod', parallel(tscSrcEsModulesEs5ProdTask, tscSrcEsModulesEs6ProdTask));
gulp.task('tsc-no-clean', parallel('tsc-no-clean-cjs', 'tsc-no-clean-esm'));
gulp.task('tsc-no-clean-prod', parallel('tsc-no-clean-cjs-prod', 'tsc-no-clean-esm-prod'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));
gulp.task('test', tscSrcCjsEs5ProdTask)

// tsc related tasks
gulp.task('tsc-es6-watch', series('tsc-no-clean-esm', watch));
gulp.task('tsc-watch', series('tsc-no-clean', watchAndBuildBoth));
gulp.task('tsc-clean', series('clean', 'tsc-no-clean'));
gulp.task('tsc-clean-prod', parallel('clean', 'tsc-no-clean-prod'));
gulp.task('tsc-no-clean', parallel('tsc-no-clean'));

// default/release task
gulp.task('default', series('tsc-clean'));
gulp.task('prod', series('tsc-clean-prod'));


