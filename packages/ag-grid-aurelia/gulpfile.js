var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');

var headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

gulp.task('default', tscTask);

function tscTask() {
    var tsResult = gulp
        .src([
            // this solves the 'cannot resolve Promise' issue
            'node_modules/@types/core-js/index.d.ts',
            'src/**/*.ts'
        ])
        .pipe(gulpTypescript({
            typescript: typescript,
            module: 'commonjs',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            declarationFiles: true,
            target: 'es5',
            noImplicitAny: true,
            noEmitOnError: false,
            lib: ["dom","es2015"]
        }));

    return merge([
        tsResult.dts
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib')),
        tsResult.js
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('lib'))
    ]);
}
