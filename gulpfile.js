var gulp = require('gulp');
var header = require('gulp-header');
var pkg = require('./package.json');

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', function() {
    gulp.src('./dist/*')
    .pipe(header(headerTemplate, { pkg : pkg }))
    .pipe(gulp.dest('./dist/'));
});