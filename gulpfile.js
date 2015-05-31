var gulp = require('gulp');
var path = require('path');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var streamify = require("streamify");
var nib = require('nib');


gulp.task('default', ['build', 'watch']);

// Build
gulp.task('build', ['stylus', 'js']);
gulp.task('stylus', stylusTask);
gulp.task('js', jsTask);

// Watch
gulp.task('watch', watchTask);



function jsTask() {
    return browserify('./src/js/main.js', {debug: true})
        .bundle()
        .pipe(source('angular-grid.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/dist'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename('angular-grid.min.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/dist'));
}


function stylusTask() {

    // Uncompressed
    gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false,
                }))
                .pipe(gulp.dest('./docs/dist/'))
                .pipe(gulp.dest('./dist/'));
        }));

    // Compressed
    return gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: true
                }))
                .pipe(rename((function() {
                    var name = path.basename(file.path);
                    var dot = name.indexOf('.');
                    name = name.substring(0, dot) + '.min.css';
                    return name;
                })()))
                .pipe(gulp.dest('./dist/'))
                .pipe(gulp.dest('./docs/dist/'));
        }));


}


function watchTask() {
    gulp.watch('./src/**/*', ['build']);
}
