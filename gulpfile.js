var gulp = require('gulp');
var rename = require("gulp-rename");
var buffer = require('vinyl-buffer');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', tscTask);

function tscTask() {
    var tsResult = gulp
        .src('src/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            module: 'commonjs',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            declarationFiles: true,
            target: 'es5',
            noImplicitAny: true
        }));

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib'))
    ])
}
