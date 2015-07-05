var gulp = require('gulp');
var path = require('path');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
var stylus = require('gulp-stylus');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var nib = require('nib');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

gulp.task('default', ['debug-build', 'watch']);
gulp.task('release', ['stylus', 'ts-release']);

// Build
gulp.task('debug-build', ['stylus', 'ts-debug']);
gulp.task('stylus', stylusTask);
gulp.task('ts-debug', tsDebugTask);
gulp.task('ts-release', tsReleaseTask);

// Watch
gulp.task('watch', watchTask);

// does TS compiling, sourcemaps = yes, minification = no, distFolder = no
function tsDebugTask() {

    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(sourcemaps.init()) // for sourcemaps only
        .pipe(typescript({
            noImplicitAny: true,
            out: 'output.js'
        }));

    return tsResult.js
        .pipe(sourcemaps.write()) // for sourcemaps only
        .pipe(rename('angular-grid.js'))
        .pipe(gulp.dest('./docs/dist'));

}

// does TS compiling, sourcemaps = no, minification = yes, distFolder = yes
function tsReleaseTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(typescript({
            noImplicitAny: true,
            declarationFiles: true,
            out: 'output.js'
        }));

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(rename('angular-grid.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(rename('angular-grid.min.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
    ]);
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
    gulp.watch('./src/**/*', ['debug-build']);
}
