// AUTOMATED script to convert js examples to ts, covering the most often changes

const { dest, series, src } = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-string-replace');
const prettier = require('gulp-prettier');
const gulpIf = require('gulp-if');
const gulpIgnore = require('gulp-ignore');
const fs = require('fs-extra');
const folder = 'aggregation'
const del = require('del');

const renameFiles = () => {
    return src([`./doc-pages/**/${folder}/**/main.js`], { base: './' })
        .pipe(rename(function (path) {
            //path.extname = ".ts";
            return {
                dirname: path.dirname,
                basename: path.basename,
                extname: ".ts"
            };
        }))
        .pipe(dest('./'))
};

const deleteOriginal = () => {
    return del([`./doc-pages/**/${folder}/**/main.js`], { base: './' })
};

const containsGridOptions = function (file) {
    const fileContent = fs.readFileSync(file.path, "utf8");
    return fileContent.includes('gridOptions =')
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
    return src([`./doc-pages/**/${folder}/**/main.ts`, '!./doc-pages/**/_gen/**/main.ts'], { base: './' })
        .pipe(gulpIgnore.exclude(fileFixed))
        .pipe(replace(new RegExp('(var|const) gridOptions =', 'g'), 'const gridOptions: GridOptions ='))
        .pipe(replace(new RegExp('(var|const) columnDefs =', 'g'), 'const columnDefs: ColDef[] ='))
        .pipe(replace(new RegExp('gridOptions\.api(?!!.)', 'g'), 'gridOptions.api!'))
        .pipe(gulpIf(containsGridOptions, replace(new RegExp('^', 'g'), 'import { GridOptions } from "@ag-grid-community/core";\n\n')))
        .pipe(gulpIf(containsColDef, replace(new RegExp('^', 'g'), 'import { ColDef } from "@ag-grid-community/core";\n\n')))
        .pipe(dest('./'))
};

const prettify = () => {
    return src([`./doc-pages/**/${folder}/**/main.ts`, '!./doc-pages/**/_gen/**/main.ts'], { base: './' })
        .pipe(prettier({ singleQuote: true }))
        .pipe(dest('./'))
};



exports.default = series(renameFiles, deleteOriginal, applyTypes, prettify)