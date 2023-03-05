const gulp = require('gulp');

const copyLicenseFiles = () => {
    return gulp.src(['../../grid-enterprise-modules/core/src/license/shared/*'])
        .pipe(gulp.dest('./src/license/'));
};

// copy from core/all modules tasks
gulp.task('copy-license-files', copyLicenseFiles);
