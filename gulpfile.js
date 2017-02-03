const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglifyjs');
const rename = require('gulp-rename');

gulp.task('default',['src','exports']);

gulp.task('src', () => {
    return gulp.src('src/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(rename('ag-grid-vue.js'))
        .pipe(gulp.dest('dist/'));
    // .pipe(uglify())
    // .pipe(rename('ag-grid-vue.min.js'))
    // .pipe(gulp.dest('dist'));
});

gulp.task('exports', () => {
    return gulp.src('./exports.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('main.js'))
        .pipe(gulp.dest('./'));
});