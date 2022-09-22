import gulp from 'gulp';
import replace from 'gulp-replace';

const copyFromModuleSource = () => {
  return gulp.src(
    [
      "**/*",
      '!**/__tests__*/**/*',
      '!**/*Test*'
    ], {cwd: '../../community-modules/solid/src'})
    .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
    .pipe(gulp.dest("./src"), {cwd: '.'});
};

gulp.task('copy-from-module-source', copyFromModuleSource);
gulp.task('default', gulp.series('copy-from-module-source'));
