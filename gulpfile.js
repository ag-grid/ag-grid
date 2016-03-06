var gulp = require('gulp');
var liveReload = require('gulp-livereload');
var inlinesource = require('gulp-inline-source');

gulp.task('default', ['watch']);
gulp.task('release', ['inline-into-php']);

gulp.task('watch', ['copy-all'], watchTask);

gulp.task('copy-all', ['copy-from-docs','copy-from-ag-grid','copy-from-ag-grid-enterprise','copy-from-libs']);

gulp.task('copy-from-ag-grid', copyFromAgGrid);
gulp.task('copy-from-ag-grid-enterprise', copyFromAgGridEnterprise);
gulp.task('copy-from-docs', copyFromDocs);
gulp.task('copy-from-libs', copyFromLibs);

gulp.task('inline-into-php', ['copy-from-docs','copy-from-ag-grid','copy-from-ag-grid-enterprise'], inlineIntoPhp);

function copyFromLibs() {
    return gulp.src([
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/bootstrap/dist/css/bootstrap.css',
            './node_modules/bootstrap/dist/css/bootstrap-theme.css'
        ])
        .pipe(gulp.dest('./dist/dist'));
}

function copyFromAgGrid() {
    return gulp.src(['../ag-grid/dist/ag-grid.js'])
        .pipe(gulp.dest('./dist/dist'))
        .pipe(liveReload());
}

function copyFromAgGridEnterprise() {
    return gulp.src(['../ag-grid-enterprise/dist/ag-grid-enterprise.js'])
        .pipe(gulp.dest('./dist/dist'))
        .pipe(liveReload());
}

function copyFromDocs() {
    return gulp.src(['./src/**/*'])
        .pipe(gulp.dest('./dist'));
}

function inlineIntoPhp() {
    return gulp.src(['./dist/**/*.php'])
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
}

function watchTask() {
    liveReload.listen();
    gulp.watch('../ag-grid/dist/ag-grid.js', ['copy-from-ag-grid']);
    gulp.watch('../ag-grid-enterprise/dist/ag-grid-enterprise.js', ['copy-from-ag-grid-enterprise']);
    gulp.watch('./src/**/*', ['copy-from-docs']);
}

