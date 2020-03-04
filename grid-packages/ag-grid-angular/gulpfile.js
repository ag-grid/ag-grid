const gulp = require('gulp');
const {series} = gulp;
const gridToNg = require('./updateGridAndColumnProperties');
const replace = require('gulp-replace');
var childProcess = require('child_process');


const updateProperties = (callback) => {
    gridToNg.updatePropertiesSrc(callback);
};

const copyFromModuleSource = () => {
    return gulp.src("../../community-modules/angular/src/**/*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./projects/ag-grid-angular/src"));
};

const angularBuild = () => {
    return childProcess.execFile('npm', ['run', 'build'])
};

const watch = () => {
    gulp.watch([
            './node_modules/ag-grid-community/lib/**/*',
            './projects/ag-grid-angular/src/lib/**/*'
        ],
        angularBuild);
};

gulp.task('copy-from-module-source', copyFromModuleSource);
gulp.task('update-properties', updateProperties);
gulp.task('watch', series('update-properties', watch));
gulp.task('default', series('watch'));
