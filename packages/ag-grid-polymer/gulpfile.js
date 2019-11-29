const gulp = require('gulp');
const replace = require('gulp-replace');

const copyFromModuleSource = () => {
    return gulp.src("../../community-modules/polymer/src/**/*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(replace('../../../@polymer/polymer/polymer-element.js', '../../@polymer/polymer/polymer-element.js'))
        .pipe(gulp.dest("./src"));
};

gulp.task('copy-from-module-source', copyFromModuleSource);
