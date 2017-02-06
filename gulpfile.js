const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const gulp = require('gulp');

const header = require('gulp-header');
const pkg = require('./package.json');
const del = require('del');
const ngc = require('gulp-ngc');
const runSequence = require('run-sequence');

// pull in shared scripts
// doesn't appear to work going up a dir - so each project needs a copy
// to update the shared scripts, run "gulp update-shared-scripts"
const requireDir = require('require-dir');
requireDir('./gulp-tasks');

gulp.task('clean', function () {
    del(['aot/**', '!aot',
        'dist/**', '!dist',
        './main.metadata.json', './main.js*', './main.d.ts']);
});

/*
 * ngc compilation tasks
 */
gulp.task('clean-ngc', (callback) => {
    runSequence('clean', 'ngc', callback);
});
gulp.task('ngc', ['ngc-src', 'ngc-main']);
gulp.task('ngc-src', () => {
    return ngc('./tsconfig-src.json');
});
gulp.task('ngc-main', () => {
    return ngc('./tsconfig-main.json');
});

// the main release task - clean, compile and add header template
gulp.task('release', ['clean-ngc'], function () {
    require('./agGridPropertiesCheck');
    gulp.src(['./dist/', '!./dist/**/*.metadata.json'])
        .pipe(header(headerTemplate, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-nm-dirs', (callback) => {
    runSequence('copy-from-ag-grid', 'copy-from-ag-grid-enterprise', callback);
});

gulp.task('watch', ['copy-nm-dirs'], () => {
    gulp.watch(['../ag-grid/dist/**/*', '../ag-grid/src/**/*'], ['copy-from-ag-grid']);
    gulp.watch(['../ag-grid-enterprise/dist/**/*', '../ag-grid-enterprise/src/**/*'], ['copy-from-ag-grid-enterprise']);
    gulp.watch(['./src/**/*'], ['ngc']);
});

// utility script to update the shared/common scripts
gulp.task('update-shared-scripts', function () {
    gulp.src(['../ag-grid-dev/gulp-tasks/**/*']).pipe(gulp.dest('./gulp-tasks/'));
});


// const ts = require('gulp-typescript');
// const tsProjectSrc = ts.createProject('./tsconfig-src.json');
// gulp.task('tsc-src', function () {
//     const tsResult = tsProjectSrc.src()
//         .pipe(tsProjectSrc());
//
//     return tsResult.js.pipe(gulp.dest('dist'));
// });
//
// const tsProjectMain = ts.createProject('./tsconfig-main.json');
// gulp.task('tsc-main', function () {
//     const tsResult = tsProjectMain.src()
//         .pipe(tsProjectMain());
//
//     return tsResult.js.pipe(gulp.dest('./'));
// });
