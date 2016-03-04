var gulp = require('gulp');
var liveReload = require('gulp-livereload');

gulp.task('default', ['watch']);

gulp.task('watch', ['copy-from-ag-grid','copy-from-ag-grid-enterprise','copy-from-docs'], watchTask);

gulp.task('copy-from-ag-grid', copyFromAgGrid);
gulp.task('copy-from-ag-grid-enterprise', copyFromAgGridEnterprise);
gulp.task('copy-from-docs', copyFromDocs);

function copyFromAgGrid() {
    return gulp.src(['../ag-grid/dist/ag-grid.js'])
        .pipe(gulp.dest('./dist/dist'))
        .pipe(liveReload());
}

function copyFromAgGridEnterprise() {
    return gulp.src(['../ag-grid-enterprise/dist/ag-grid-enterprise.js'])
        .pipe(gulp.dest('./dist/dist'));
}

function copyFromDocs() {
    return gulp.src(['./src/**/*'])
        .pipe(gulp.dest('./dist'));
}

function watchTask() {
    liveReload.listen();
    gulp.watch('../ag-grid/dist/ag-grid.js', ['copy-from-ag-grid']);
    gulp.watch('../ag-grid-enterprise/dist/ag-grid-enterprise.js', ['copy-from-ag-grid-enterprise']);
    gulp.watch('./src/**/*', ['copy-from-docs']);
}

