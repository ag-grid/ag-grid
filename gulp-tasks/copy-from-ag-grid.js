var gulp = require('gulp');

gulp.task('copy-from-ag-grid', copyFromAgGrid);

function copyFromAgGrid() {
    return gulp.src(['../ag-grid/*', '../ag-grid/dist/**/*'], {base: '../ag-grid'})
        .pipe(gulp.dest('./node_modules/ag-grid'));
}
