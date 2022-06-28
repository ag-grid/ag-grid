const gulp = require('gulp');
const {series} = gulp;
const {EOL} = require('os');
const merge = require('merge2');
const fs = require('fs');
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const header = require('gulp-header');
const concat = require('gulp-concat');
const pkg = require('./package.json');
const replace = require('gulp-replace');

const dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ag-grid/>\n';

const exportedCommunityModules = fs.readFileSync('../ag-grid-community/src/main.ts').toString().split("\n")
    .filter(line => line.includes('export ') && line.includes('@ag-grid-community'))
    .filter(line => !line.includes('@ag-grid-community/core'))
    .map(line => line.substring(line.indexOf("@ag-grid-community"), line.lastIndexOf('"') === -1 ? line.lastIndexOf('\'') : line.lastIndexOf('"')))

const exportedEnterpriseModules = fs.readFileSync('./src/main.ts').toString().split("\n")
    .filter(line => line.includes('export ') && line.includes('@ag-grid-enterprise'))
    .map(line => line.substring(line.indexOf("@ag-grid-enterprise"), line.lastIndexOf('"') === -1 ? line.lastIndexOf('\'') : line.lastIndexOf('"')))


function updateBetweenStrings(
    fileContents,
    startString,
    endString,
    contentToInsert) {

    const startIndex = fileContents.indexOf(startString) + startString.length;
    const endIndex = fileContents.indexOf(endString);

    return `${fileContents.substring(0, startIndex)}${EOL}${contentToInsert}${EOL}${fileContents.substring(endIndex)}`;
}

// Start of Typescript related tasks
const tscMainTask = () => {
    const tsProject = gulpTypescript.createProject('./tsconfig-main.json', {typescript: typescript});


    const communityMainFilename = './node_modules/ag-grid-community/dist/lib/main.d.ts';
    const communityMainFileContents = fs.readFileSync(communityMainFilename, 'UTF-8');

    const newContents = communityMainFileContents.replace(/from .*/g, 'from "ag-grid-community";')
        .replace(/export \* from "ag-grid-community";/g, "")
        .replace(/^\s*\n/gm, ""); // delete empty lines

    const mainTsFilename = './src/main.ts';
    const mainTsFileContents = fs.readFileSync(mainTsFilename, 'UTF-8');

    const updatedUtilFileContents = updateBetweenStrings(mainTsFileContents,
        '/* COMMUNITY_EXPORTS_START_DO_NOT_DELETE */',
        '/* COMMUNITY_EXPORTS_END_DO_NOT_DELETE */',
        newContents);

    fs.writeFileSync(mainTsFilename, updatedUtilFileContents, 'UTF-8');

    const tsResult = gulp
        .src('./src/main.ts')
        .pipe(tsProject());

    let result = tsResult.dts.pipe(replace("@ag-grid-enterprise/core", "./dist/lib/main"));

    exportedEnterpriseModules.forEach(exportedEnterpriseModule => result = result.pipe(replace(exportedEnterpriseModule, "./dist/lib/main")));

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
    if (!fs.existsSync('./node_modules/ag-grid-community/dist/styles')) {
        done("node_modules/ag-grid-community/dist/styles doesn't exist - exiting")
    }

    if (!fs.existsSync('./node_modules/ag-grid-community/styles/ag-grid.css')) {
        done("./node_modules/ag-grid-community/styles doesn't exist - exiting")
    }

    return merge([
            gulp.src('./node_modules/ag-grid-community/dist/styles/**/*').pipe(gulp.dest('./dist/styles')),
            gulp.src('./node_modules/ag-grid-community/styles/*.css').pipe(gulp.dest('./styles')),
            gulp.src('./node_modules/ag-grid-community/styles/*.scss').pipe(gulp.dest('./styles'))
        ]
    );
};

const copyAndConcatMainTypings = () => {
    const typingsDirs = exportedEnterpriseModules.map(exportedEnterpriseModule => `./node_modules/${exportedEnterpriseModule}/typings/main.*`)

    return gulp.src([
        './node_modules/@ag-grid-enterprise/core/typings/main.*',
        ...typingsDirs
    ])
        .pipe(concat('main.d.ts'))
        .pipe(gulp.dest('./dist/lib'));
};

const copyGridCoreTypings = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-enterprise/core/typings')) {
        done("node_modules/@ag-grid-enterprise/core/typings doesn't exist - exiting")
    }

    exportedEnterpriseModules.forEach(exportedEnterpriseModule => {
        if (!fs.existsSync(`./node_modules/${exportedEnterpriseModule}/typings`)) {
            done(`./node_modules/${exportedEnterpriseModule}/typings doesn't exist - exiting`)
        }
    })

    const typingsDirs = exportedEnterpriseModules.map(exportedEnterpriseModule =>
        [
            `./node_modules/${exportedEnterpriseModule}/typings/**/*`,
            `!./node_modules/${exportedEnterpriseModule}/typings/main.*`,
        ]).flatMap(x => x)


    let result = gulp.src([
        './node_modules/@ag-grid-enterprise/core/typings/**/*',
        ...typingsDirs
    ])
        .pipe(replace("@ag-grid-community/core", "ag-grid-community"));

    exportedCommunityModules.forEach(exportedCommunityModule => result = result.pipe(replace(exportedCommunityModule, "ag-grid-community")));

    return result.pipe(gulp.dest('./dist/lib'));
};

const copyGridAllUmdFiles = (done) => {
    if (!fs.existsSync('./node_modules/@ag-grid-enterprise/all-modules/dist')) {
        done("./node_modules/@ag-grid-enterprise/all-modules/dist doesn't exist - exiting")
    }

    return gulp.src([
        './node_modules/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise*.js',
        '!./node_modules/@ag-grid-enterprise/all-modules/dist/**/*.cjs*.js'])
        .pipe(gulp.dest('./dist/'));
};

// copy from core/all modules tasks
gulp.task('copy-grid-core-styles', copyGridCoreStyles);
gulp.task('copy-umd-files', copyGridAllUmdFiles);
gulp.task('copy-core-typings', copyGridCoreTypings);
gulp.task('copy-and-concat-typings-main', copyAndConcatMainTypings);

// Typescript related tasks
gulp.task('clean', cleanDist);
gulp.task('tsc-no-clean', tscMainTask);
gulp.task('tsc', series('clean', 'tsc-no-clean'));

// build tasks
gulp.task('build', series('tsc', 'copy-grid-core-styles', 'copy-core-typings', 'copy-and-concat-typings-main'));

// default/release task
gulp.task('default', series('build'));


