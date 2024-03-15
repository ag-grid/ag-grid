const gulp = require('gulp');
const {series} = gulp;
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const del = require("del");

const DIST_FOLDER = 'dist/esm/es6/';

const mjsProcessing = () => {
    return gulp
        .src(['dist/esm/es6/**/*.js', '!dist/esm/es6/**/*.map'])
        .pipe(replace(/(import|export)(.*['"]\..*)(['"].*)/gi, (line) => {
            const regexp = /(import|export)(.*['"]\..*)(['"].*)/gi;
            const matches = [...line.matchAll(regexp)][0];
            return `${matches[1]}${matches[2]}.mjs${matches[3]}`
        }))
        .pipe(rename({ extname: '.mjs' }))
        .pipe(gulp.dest(DIST_FOLDER));
}

const cleanup = () => del([`${DIST_FOLDER}/**/*.js`]);

gulp.task('mjs-processing', series(mjsProcessing, cleanup));


