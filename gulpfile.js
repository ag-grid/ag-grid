var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require("gulp-rename");
var streamify = require("streamify");

gulp.task('default', ['build']);
gulp.task('build', buildTask);



function buildTask() {
    return browserify('./src/js/main.js')
        .bundle()
        .pipe(source('angularGrid.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename('angularGrid.min.js'))
        .pipe(gulp.dest('./dist/'));
}
