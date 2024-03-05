const gulp = require('gulp');
const replace = require('gulp-replace');

const copyFromModuleSource = () => {
    return gulp.src(
        [
            "**/*",
            '!**/__tests__*/**/*',
            '!**/*Test*'
        ], {cwd: '../../community-modules/angular/projects'})
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./projects"), {cwd: '.'})
};

gulp.task('copy-from-module-source', copyFromModuleSource);
