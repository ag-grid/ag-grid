const gulp = require('gulp');
const replace = require('gulp-replace');
const merge = require('merge-stream');

const copyFromModuleSource = () => {
    const srcCopy = gulp.src("../../community-modules/vue/src/**/*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./src"));
    const mainCopy = gulp.src("../../community-modules/vue/main*.*")
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(gulp.dest("./"));

    return merge(srcCopy, mainCopy);
};

const copyBuildArtefactsFromLegacy = () => {
    const libCopy = gulp.src("../ag-grid-vue-legacy/lib/**/*")
        .pipe(gulp.dest("./lib/legacy"));
    const distCopy = gulp.src("../ag-grid-vue-legacy/dist/**/*")
        .pipe(gulp.dest("./dist/legacy"));

    return merge(libCopy, distCopy);
};

gulp.task('copy-build-artefacts-from-legacy', copyBuildArtefactsFromLegacy);
gulp.task('copy-from-module-source', copyFromModuleSource);
