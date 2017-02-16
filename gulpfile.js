var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin');
var uncss  = require('gulp-uncss');

gulp.task('copy-from-docs', copyFromDocs);
gulp.task('copy-from-ag-grid', copyFromAgGrid);
gulp.task('copy-from-ag-grid-enterprise', copyFromAgGridEnterprise);
gulp.task('uncss', ['copy-from-docs','copy-from-ag-grid','copy-from-ag-grid-enterprise'], uncssTask);
gulp.task('inline-into-php', ['uncss'], inlineIntoPhp);

gulp.task('default', ['inline-into-php']);
gulp.task('release', ['inline-into-php']);

function uncssTask() {
    return gulp.src('./dist/dist/bootstrap/css/bootstrap.css')
        .pipe(uncss({
            html: ['src/**/*.php','src/**/*.html']
        }))
        .pipe(gulp.dest('./dist/dist/bootstrap/css'));
}

// the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
function copyFromDocs() {
    return gulp.src(['./src/**/*','!./src/dist/ag-grid/','!./src/dist/ag-grid-enterprise/'])
        .pipe(gulp.dest('./dist'));
}

function copyFromAgGrid() {
    return gulp.src(['../ag-grid/dist/ag-grid.js'])
        .pipe(gulp.dest('./dist/dist/ag-grid/'));
}

function copyFromAgGridEnterprise() {
    return gulp.src(['../ag-grid-enterprise/dist/ag-grid-enterprise/ag-grid-enterprise.js'])
        .pipe(gulp.dest('./dist/dist'));
}

function inlineIntoPhp() {
    return gulp.src(['./dist/**/*.php'])
        .pipe(inlinesource())
        // this plugin couldn't handle javascript examples in the documentation, and also messed up the
        // layout of the index.html features list (the diamond separated list)
        //.pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist'));
}

/*
gulp.task('copy-bootstrap', function() {
    return gulp.src([
        './node_modules/bootstrap/dist/js/bootstrap.js',
        './node_modules/bootstrap/dist/css/bootstrap.css',
        './node_modules/bootstrap/dist/css/bootstrap-theme.css'
    ])
        .pipe(gulp.dest('./dist/dist'));
});

gulp.task('copy-font-awesome', function() {
    return gulp.src([
            './node_modules/font-awesome/css/font-awesome.css',
            './node_modules/font-awesome/fonts/!*'
        ]
        , {base: './node_modules/font-awesome'}
    )
        .pipe(gulp.dest('./dist/dist/font-awesome'));
});
*/
