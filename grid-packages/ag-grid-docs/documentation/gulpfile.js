// AUTOMATED script to convert js examples to ts, covering the most often changes

const { dest, series, src } = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-string-replace');
const prettier = require('gulp-prettier');
const gulpIf = require('gulp-if');
const gulpIgnore = require('gulp-ignore');
const fs = require('fs-extra');
const del = require('del');
const tap = require('gulp-tap')
var argv = require('yargs').argv;

// npx gulp --dir accessing-data
let folder = argv.dir;
console.log('Running on ', folder)

const renameFiles = () => {
    return src([`./doc-pages/**/${folder}/**/main.js`, '!./doc-pages/**/{_gen,provided}/**/*.js'], { base: './' })
        .pipe(tap(function (file) {
            fs.moveSync(file.path, file.path.replace('.js', '.ts'));
            return file
        }))
};

const containsGridOptions = function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes('gridOptions =')
}

const containsEvent = (eventName) => function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes(eventName)
}

const containsColDef = function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes('columnDefs =')
}
const fileFixed = function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes('import {')
}

const applyTypes = () => {
    return src([`./doc-pages/**/${folder}/**/main.ts`, '!./doc-pages/**/{_gen,provided}/**/*.ts'], { base: './' })
        .pipe(gulpIgnore.exclude(fileFixed))
        .pipe(replace(new RegExp('(var|const) gridOptions =', 'g'), 'const gridOptions: GridOptions ='))
        .pipe(replace(new RegExp('(var|const) columnDefs =', 'g'), 'const columnDefs: ColDef[] ='))
        .pipe(replace(new RegExp('gridOptions\.api(?!!.)', 'g'), 'gridOptions.api!'))
        .pipe(replace(new RegExp('gridOptions\.columnApi(?!!.)', 'g'), 'gridOptions.columnApi!'))
        .pipe(gulpIf(containsEvent('onGridReady'), replace(new RegExp('^', 'g'), 'import { GridReadyEvent } from "@ag-grid-community/core";\n\n')))
        .pipe(gulpIf(containsEvent('onFirstDataRendered'), replace(new RegExp('^', 'g'), 'import { FirstDataRenderedEvent } from "@ag-grid-community/core";\n\n')))
        .pipe(gulpIf(containsGridOptions, replace(new RegExp('^', 'g'), 'import { GridOptions } from "@ag-grid-community/core";\n\n')))
        .pipe(gulpIf(containsColDef, replace(new RegExp('^', 'g'), 'import { ColDef } from "@ag-grid-community/core";\n\n')))
        .pipe(dest('./'))
};

const containsChartOptions = function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes('options =')
}

const applyChartTypes = () => {
    return src([`./doc-pages/**/${folder}/**/main.ts`, '!./doc-pages/**/{_gen,provided}/**/*.ts'], { base: './' })
        .pipe(gulpIgnore.exclude(fileFixed))
        .pipe(replace(new RegExp('(var|const) options =', 'g'), 'const options: AgChartOptions ='))
        .pipe(gulpIf(containsChartOptions, replace(new RegExp('^', 'g'), 'import * as agCharts from "ag-charts-community";\n')))
        .pipe(gulpIf(containsChartOptions, replace(new RegExp('^', 'g'), 'import { AgChartOptions } from "@ag-grid-community/core";\n\n')))
        .pipe(dest('./'))
};

const prettify = () => {
    return src([`./doc-pages/**/${folder}/**/main.ts`, '!./doc-pages/**/{_gen,provided}/**/*.ts'], { base: './' })
        .pipe(prettier({ singleQuote: true }))
        .pipe(dest('./'))
};

// applyTypes
exports.default = series(renameFiles, applyChartTypes, prettify)