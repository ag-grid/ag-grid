const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

gulp.task('default', ['src', 'exports']);

gulp.task('src', () => {
    return gulp.src('src/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('exports', () => {
    return gulp.src('./exports.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('main.js'))
        .pipe(gulp.dest('./'));
});

