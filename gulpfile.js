var gulp = require('gulp');
var path = require('path');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
var stylus = require('gulp-stylus');
var buffer = require('vinyl-buffer');
var nib = require('nib');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var tsd = require('gulp-tsd');

//var headerTemplate = '// Angular Grid\n// Written by Niall Crosby\n// www.angulargrid.com\n\n// Version 1.10.1\n\n';
var headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

gulp.task('default', ['stylus', 'tsd', 'debug-build', 'watch']);
gulp.task('release', ['stylus', 'tsd', 'ts-release']);

// Build
gulp.task('debug-build', ['stylus', 'ts-debug']);
gulp.task('stylus', stylusTask);
gulp.task('ts-debug', tsDebugTask);
gulp.task('ts-release', tsReleaseTask);

// Watch
gulp.task('watch', watchTask);

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

gulp.task('es6', function (callback) {
    var tsResult = gulp
        .src('src/es6/**/*.ts')
        .pipe(sourcemaps.init()) // for sourcemaps only
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            target: 'es5',
            module: 'commonjs'
        }));

    return tsResult.js
        .pipe(sourcemaps.write()) // for sourcemaps only
        .pipe(gulp.dest('./docs/dist'));
});

// does TS compiling, sourcemaps = yes, minification = no, distFolder = no
function tsDebugTask() {

    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(sourcemaps.init()) // for sourcemaps only
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            //experimentalDecorators: true,
            //emitDecoratorMetadata: true,
            target: 'es5',
            //module: 'commonjs',
            out: 'angular-grid.js'
        }));

    return tsResult.js
        .pipe(sourcemaps.write()) // for sourcemaps only
        .pipe(rename('angular-grid.js'))
        .pipe(gulp.dest('./docs/dist'));

}

// does TS compiling, sourcemaps = no, minification = yes, distFolder = yes
function tsReleaseTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            //experimentalDecorators: true,
            //emitDecoratorMetadata: true,
            target: 'es5',
            //module: 'commonjs',
            declarationFiles: true,
            out: 'angular-grid.js'
        }));

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(rename('angular-grid.js'))
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(rename('angular-grid.min.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
    ]);
}

function stylusTask() {

    // Uncompressed
    gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false
                }))
                .pipe(gulp.dest('./docs/dist/'))
                .pipe(gulp.dest('./dist/'));
        }));

    // Compressed
    return gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: true
                }))
                .pipe(rename((function() {
                    var name = path.basename(file.path);
                    var dot = name.indexOf('.');
                    name = name.substring(0, dot) + '.min.css';
                    return name;
                })()))
                .pipe(gulp.dest('./dist/'))
                .pipe(gulp.dest('./docs/dist/'));
        }));
}

function watchTask() {
    gulp.watch('./src/ts/**/*', ['ts-debug']);
    gulp.watch('./src/styles/**/*', ['stylus']);
}
