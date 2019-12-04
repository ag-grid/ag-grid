const gulp = require('gulp');
const {series} = gulp;
const ngc = require('gulp-ngc');
const rename = require("gulp-rename");
const gridToNg = require('./updateGridAndColumnProperties');
const del = require('del');

const compileMain = (callback) => {
    return gulp
        .src('./exports.ts')
        .pipe(ngc('./tsconfig-main.json', callback));
};

const cleanPostBuildArtifacts = (callback) => {
    return del(['./aot', 'exports.js*', 'exports.d.ts', 'exports.metadata.json', './src/*.js*', './src/*.d.ts', './src/*.metadata.*'], callback)
};

const mainPostCompileRename = () => {
    // this is here to facilitate the case where ag-grid-angular is symlinked into another project
    // if we have main.ts and leave it as that the the project that depends on ag-grid-angular (again, only if symlinked)
    // will complain about node_modules/ag-grid-angular/main.ts not being part of the source files
    gulp.src("./exports.js")
        .pipe(rename(('main.js')))
        .pipe(gulp.dest("./"));
    gulp.src("./exports.d.ts")
        .pipe(rename(('main.d.ts')))
        .pipe(gulp.dest("./"));
    return gulp.src("./exports.metadata.json")
        .pipe(rename(('main.metadata.json')))
        .pipe(gulp.dest("./"))
};

const updateProperties = (callback) => {
    gridToNg.updatePropertiesSrc(callback);
};

const compileSource = (callback) => {
    return ngc('./tsconfig-src.json', callback);
};

const watch = () => {
    gulp.watch([
            './node_modules/@ag-grid-community/core/src/ts/propertyKeys.ts',
            './node_modules/@ag-grid-community/core/ts/components/colDefUtil.ts'
        ],
        series('update-properties'));
};

gulp.task('compile-main', compileMain);
gulp.task('clean-post-build-artifacts', cleanPostBuildArtifacts);
gulp.task('main-post-compile-rename', mainPostCompileRename);
gulp.task('update-properties', updateProperties);
gulp.task('compile-source', compileSource);
gulp.task('update-properties-and-compile-source', compileSource);
gulp.task('watch', series('update-properties-and-compile-source', watch));
gulp.task('default', series('update-properties', 'compile-main', 'compile-source', 'main-post-compile-rename','clean-post-build-artifacts'));
