const gulp = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const resolve = require('path').resolve;
const basename = require('path').basename;
const fs = require('fs');

const copyFromModuleSource = () => {
    return gulp
        .src([
            '../../community-modules/core/dist/types/src/**/*.d.ts',
            '../../community-modules/client-side-row-model/dist/types/src/**/*.d.ts',
            '../../community-modules/csv-export/dist/types/src/**/*.d.ts',
            '../../community-modules/infinite-row-model/dist/types/src/**/*.d.ts',
            '!**/__tests__*/**/*',
            '!**/*Test*',
        ])
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(
            rename(function (path, file) {
                const workspaceRoot = resolve(__dirname, '../..');
                const filePath = file.path;
                const relativePathWithFile = filePath
                    .replace(`${workspaceRoot}/`, '')
                    .replace('community-modules/', '')
                    .replace('/dist/types/src', '');
                const relativePath = relativePathWithFile.replace(basename(relativePathWithFile), '');
                path.dirname = `types/${relativePath}`;
            })
        )
        .pipe(gulp.dest('./dist'));
};

gulp.task('copy-from-module-source', copyFromModuleSource);
