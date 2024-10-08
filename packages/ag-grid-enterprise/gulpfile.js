const gulp = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const resolve = require('path').resolve;
const basename = require('path').basename;
const fs = require('fs');

const copyFromModuleSource = () => {
    return gulp
        .src([
            '../../enterprise-modules/core/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/advanced-filter/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/charts/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/clipboard/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/column-tool-panel/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/excel-export/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/filter-tool-panel/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/master-detail/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/menu/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/multi-filter/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/range-selection/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/rich-select/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/row-grouping/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/server-side-row-model/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/set-filter/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/side-bar/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/sparklines/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/status-bar/dist/types/src/**/*.d.ts',
            '../../enterprise-modules/viewport-row-model/dist/types/src/**/*.d.ts',
            '!**/__tests__*/**/*',
            '!**/*Test*',
        ])
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(replace('@ag-grid-community/client-side-row-model', 'ag-grid-community'))
        .pipe(replace('@ag-grid-community/csv-export', 'ag-grid-community'))
        .pipe(replace('@ag-grid-community/infinite-row-model', 'ag-grid-community'))
        .pipe(replace('@ag-grid-enterprise/core', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/advanced-filter', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/charts', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/clipboard', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/column-tool-panel', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/excel-export', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/filter-tool-panel', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/master-detail', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/menu', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/multi-filter', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/range-selection', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/rich-select', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/row-grouping', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/server-side-row-model', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/set-filter', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/side-bar', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/sparklines', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/status-bar', 'ag-grid-enterprise'))
        .pipe(replace('@ag-grid-enterprise/viewport-row-model', 'ag-grid-enterprise'))
        .pipe(
            rename(function (path, file) {
                const workspaceRoot = resolve(__dirname, '../..');
                const filePath = file.path;
                const relativePathWithFile = filePath
                    .replace(`${workspaceRoot}/`, '')
                    .replace('community-modules/', '')
                    .replace('enterprise-modules/core/', 'enterprise-core/')
                    .replace('enterprise-modules/', '')
                    .replace('/dist/types/src', '');
                const relativePath = relativePathWithFile.replace(basename(relativePathWithFile), '');
                path.dirname = `types/${relativePath}`;
            })
        )
        .pipe(gulp.dest('./dist'));
};

gulp.task('copy-from-module-source', copyFromModuleSource);
