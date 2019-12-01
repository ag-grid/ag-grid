const gulp = require('gulp');
const {series, parallel} = gulp;
const ts = require('gulp-typescript');

const tsEs6Project = ts.createProject('tsconfig.es6.json');
const tsEs5Project = ts.createProject('tsconfig.es5.json');
const tsDocsProject = ts.createProject('tsconfig.docs.json');

const buildEs6 = () => {
    const tsResult = tsEs6Project.src()
        .pipe(tsEs6Project());

    return tsResult.js.pipe(gulp.dest('dist/es6'));
};

const buildEs5 = () => {
    const tsResult = tsEs5Project.src()
        .pipe(tsEs5Project());

    return tsResult.js.pipe(gulp.dest('dist/cjs'));
};

const buildDocs = () => {
    const tsResult = tsDocsProject.src()
        .pipe(tsDocsProject());

    return tsResult.js.pipe(gulp.dest('dist/cjs'));
};

gulp.task('buildEs5', buildEs5);
gulp.task('buildEs6', buildEs6);
gulp.task('buildDocs', buildDocs);
gulp.task('build', parallel('buildEs5', 'buildEs6'));
gulp.task('default', series('build'));
