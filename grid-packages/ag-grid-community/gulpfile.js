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
const concat = require('gulp-concat');

const os = require('os');
const WINDOWS = /^win/.test(os.platform());

const dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ag-grid/>\n';

const exportedCommunityModules = fs.readFileSync('./src/main.ts').toString().split("\n")
    .filter(line => line.includes('export ') && line.includes('@ag-grid-community'))
    .filter(line => !line.includes('@ag-grid-community/core'))
    .map(line => line.substring(line.indexOf("@ag-grid-community"), line.lastIndexOf('"') === -1 ? line.lastIndexOf('\'') : line.lastIndexOf('"')))

// Start of Typescript related tasks
const tscMainTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    let result = tsResult.dts.pipe(replace("@ag-grid-community/core", "./dist/lib/main"));

    exportedCommunityModules.forEach(exportedCommunityModule => result = result.pipe(replace(exportedCommunityModule, "./dist/lib/main")));

    return result.pipe(header(dtsHeaderTemplate, {pkg: pkg}))
        .pipe(rename("main.d.ts"))
        .pipe(gulp.dest('./'));
};

const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

// End of Typescript related tasks

const copyGridCoreStyles = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-community/core/dist/styles')) {
        done("node_modules/@ag-grid-community/core/dist/styles doesn't exist - exiting")
    }

    // we don't have a dist folder in styles so just check for at least the core structural css file
    if (!fs.existsSync('./node_modules/@ag-grid-community/styles/ag-grid.css')) {
        done("./node_modules/@ag-grid-community/styles/ag-grid.css doesn't exist - exiting")
    }

    return merge([
            gulp.src('./node_modules/@ag-grid-community/core/dist/styles/**/*').pipe(gulp.dest('./dist/styles')),
            gulp.src('./node_modules/@ag-grid-community/styles/*.css').pipe(gulp.dest('./styles')),
            gulp.src('./node_modules/@ag-grid-community/styles/*.scss').pipe(gulp.dest('./styles'))
        ]
    );
};

const copyGridCoreTypings = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-community/core/typings')) {
        done("node_modules/@ag-grid-community/core/typings doesn't exist - exiting")
    }

    exportedCommunityModules.forEach(exportedCommunityModule => {
        if (!fs.existsSync(`./node_modules/${exportedCommunityModule}/typings`)) {
            done(`./node_modules/${exportedCommunityModule}/typings doesn't exist - exiting`)
        }
    })

    const typingsDirs = exportedCommunityModules.map(exportedCommunityModule =>
        [
            `./node_modules/${exportedCommunityModule}/typings/**/*`,
            `!./node_modules/${exportedCommunityModule}/typings/main.*`,
        ]).flatMap(x => x)

    return gulp.src([
        './node_modules/@ag-grid-community/core/typings/**/*',
        ...typingsDirs
    ])
        .pipe(replace(/\@ag-grid-community\/core/, function () {
            // replace references to @ag-grid-community/core with relative imports based on the file location
            // ie a file in a/b/ importing from @ag-grid-community/core will instead import from '../../main'
            const match = (this.file.relative.match(WINDOWS ? /\\/g : /\//g) || []);
            const depth = match.length;

            if (depth === 0) {
                return './main';
            }

            return `${Array(depth).fill('../').join('')}main`;
        }))
        .pipe(gulp.dest('./dist/lib'));
};

const copyAndConcatMainTypings = () => {
    const typingsDirs = exportedCommunityModules.map(exportedCommunityModule => `./node_modules/${exportedCommunityModule}/typings/main.*`);

    return gulp.src([
        './node_modules/@ag-grid-community/core/typings/main.*',
        ...typingsDirs
    ])
        .pipe(concat('main.d.ts'))
        .pipe(gulp.dest('./dist/lib'));
};

const copyGridAllUmdFiles = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-community/all-modules/dist')) {
        done("./node_modules/@ag-grid-community/all-modules/dist doesn't exist - exiting")
    }

    return gulp.src([
        './node_modules/@ag-grid-community/all-modules/dist/ag-grid-community*.js',
        '!./node_modules/@ag-grid-community/all-modules/dist/**/*.cjs*.js'])
        .pipe(gulp.dest('./dist/'));
};

// copy from grid-core tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);
gulp.task('copy-umd-files', copyGridAllUmdFiles);
gulp.task('copy-core-typings', copyGridCoreTypings);
gulp.task('copy-and-concat-typings-main', copyAndConcatMainTypings);

// Typescript related tasks
gulp.task('clean', cleanDist);
gulp.task('tsc-no-clean', tscMainTask);
gulp.task('tsc', series('clean', 'tsc-no-clean'));

// webpack related tasks
gulp.task('package', series('copy-umd-files'));

// default/release task
gulp.task('build', series('tsc', 'copy-core-typings', 'copy-grid-core-styles', 'copy-and-concat-typings-main'))


