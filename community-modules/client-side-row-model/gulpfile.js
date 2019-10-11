const gulp = require('gulp');
const {parallel} = gulp;
const ts = require('gulp-typescript');

const tsEs6Project = ts.createProject('tsconfig.es6.json');
const tsProject = ts.createProject('tsconfig.json');

const buildEs6 = () => {
    const tsResult = tsEs6Project.src()
        .pipe(tsEs6Project());

    return tsResult.js.pipe(gulp.dest('dist/es6'));
};

const buildEs5 = () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist/es5'));
};

const watch = () => {
    gulp.watch([
            './node_modules/ag-grid-community/dist/**/*.js',
            './src/**/*.ts'
        ],
        parallel('buildEs5', 'buildEs6'));
};

gulp.task('buildEs5', buildEs5);
gulp.task('buildEs6', buildEs6);
gulp.task('watch', watch);
gulp.task('default', 'watch');
