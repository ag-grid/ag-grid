const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglifyjs');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const del = require('del');

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

gulp.task('clean-nm-ag-grid', () => {
    return del(['node_modules/ag-grid', '!node_modules']);
});

gulp.task('clean-nm-ag-grid-enterprise', () => {
    return del(['node_modules/ag-grid-enterprise', '!node_modules']);
});

gulp.task('copy-nm-dirs', (callback) => {
    return runSequence('copy-from-ag-grid', 'copy-from-ag-grid-enterprise', 'copy-from-ag-grid-vue', callback);
});

gulp.task('copy-from-ag-grid', () => {
    return gulp.src(['../ag-grid/*', '../ag-grid/dist/**/*'], {base: '../ag-grid'})
        .pipe(gulp.dest('./node_modules/ag-grid'));
});

gulp.task('copy-from-ag-grid-enterprise', () => {
    return gulp.src(['../ag-grid-enterprise/*', '../ag-grid-enterprise/dist/**/*'], {base: '../ag-grid-enterprise'})
        .pipe(gulp.dest('./node_modules/ag-grid-enterprise'));
});

gulp.task('copy-nm-dirs', (callback) => {
    return runSequence('copy-from-ag-grid', 'copy-from-ag-grid-enterprise', callback);
});

gulp.task('watch', ['copy-nm-dirs'], () => {
    gulp.watch(['../ag-grid/dist/**/*', '../ag-grid/src/**/*'], ['copy-from-ag-grid']);
    gulp.watch(['../ag-grid-enterprise/dist/**/*', '../ag-grid-enterprise/src/**/*'], ['copy-from-ag-grid-enterprise']);
    gulp.watch(['./src/**/*','./dist/**/*'], ['default']);
});

