const gulp = require('gulp');
const replace = require('gulp-replace');

const copyFromModuleSource = () => {
    return (
        gulp
            .src(['**/*', '!**/__tests__*/**/*', '!**/*Test*'], { cwd: '../../community-modules/react/src' })
            // for react 17 compatibility :-(
            // .pipe(replace('react-dom/server', 'react-dom/server.js'))
            .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
            .pipe(gulp.dest('./src'), { cwd: '.' })
    );
};

gulp.task('copy-from-module-source', copyFromModuleSource);
