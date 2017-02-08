var gulp = require('gulp');
var del = require('del');

gulp.task('clean-nm-ag-grid-enterprise', cleanNmAgGridEnterprise);

function cleanNmAgGridEnterprise() {
    del(['node_modules/ag-grid-enterprise', '!node_modules']);
}
