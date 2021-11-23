const gulp = require('gulp');
const replace = require('gulp-replace');

const copyFromModuleSource = () => {
    return gulp.src("../../community-modules/vue3/src/**/*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./src"));
};

gulp.task('copy-from-module-source', copyFromModuleSource);
