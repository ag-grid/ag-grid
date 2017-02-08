var gulp = require('gulp');

gulp.task('copy-from-ag-grid-enterprise', copyFromAgGridEnterprise);

function copyFromAgGridEnterprise() {
    return gulp.src(['../ag-grid-enterprise/*', '../ag-grid-enterprise/dist/**/*'], {base: '../ag-grid-enterprise'})
        .pipe(gulp.dest('./node_modules/ag-grid-enterprise'));
}
