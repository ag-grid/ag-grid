const gulp = require('gulp');
const replace = require('gulp-replace');
const merge = require('merge-stream');

const copyFromModuleSource = () => {
    const srcCopy = gulp.src("../../grid-community-modules/vue/src/**/*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./src"));
    const mainCopy = gulp.src("../../grid-community-modules/vue/main*.*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./"));

    return merge(srcCopy, mainCopy);
};

gulp.task('copy-from-module-source', copyFromModuleSource);
