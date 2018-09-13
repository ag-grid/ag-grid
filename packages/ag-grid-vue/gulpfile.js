const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

gulp.task('default', ['src', 'exports']);

gulp.task('src', () =>
    gulp.src('src/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist'))
);

gulp.task('exports', () => {
    return gulp.src('./exports.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(rename('main.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['src'], () => {
    gulp.watch([
        './src/*',
        './node_modules/ag-grid-community/dist/lib/**/*'],
    ['src']);
});


