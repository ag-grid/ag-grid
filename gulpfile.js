const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const gulp = require('gulp');

const header = require('gulp-header');
const pkg = require('./package.json');
const del = require('del');
const ngc = require('gulp-ngc');
const runSequence = require('run-sequence');

gulp.task('clean', function () {
    return del(['aot/**', '!aot',
        'dist/**', '!dist',
        './main.metadata.json', './main.js*', './main.d.ts']);
});

/*
 * ngc compilation tasks
 */
gulp.task('clean-ngc', (callback) => {
    return runSequence('clean', 'ngc', callback);
});

gulp.task('ngc', (callback) => {
    return runSequence('ngc-src', 'ngc-main', callback)
});

gulp.task('ngc-src', (callback) => {
    return ngc('./tsconfig-src.json', callback);
});

gulp.task('ngc-main', (callback) => {
    return ngc('./tsconfig-main.json', callback);
});

// the main release task - clean, compile and add header template
gulp.task('release', ['clean-ngc'], function () {
    require('./agGridPropertiesCheck');
    gulp.src(['./dist/', '!./dist/**/*.metadata.json'])
        .pipe(header(headerTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', ['clean-ngc'], () => {
    gulp.watch([
        './node_modules/ag-grid/dist/**/*', './node_modules/ag-grid/main.js',
        './node_modules/ag-grid-enterprise/dist/**/*', './node_modules/ag-grid-enterprise/main.js',
        './src/**/*'
    ], ['clean-ngc']);
});
