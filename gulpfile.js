var gulp = require('gulp');
var amdOptimize = require('amd-optimize');
var concat = require('gulp-concat');

gulp.task('default', function() {
    return gulp.src('./src/**/*.js')
        .pipe(amdOptimize('angularGrid'))
        .pipe(concat('main-bundle.js'))
        .pipe(gulp.dest('dist'));
});
