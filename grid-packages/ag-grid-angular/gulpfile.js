const gulp = require('gulp');
const replace = require('gulp-replace');
var childProcess = require('child_process');

const copyFromModuleSource = () => {
    return gulp.src(["**/*"], {cwd: '../../grid-community-modules/angular/projects/ag-grid-angular/src'})
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./projects/ag-grid-angular/src", {cwd: '.'}));
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
gulp.task('default', watch);
