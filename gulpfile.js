var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');

var htmlmin = require('gulp-htmlmin');
var uncss  = require('gulp-uncss');
const debug = require('gulp-debug');

const cp = require('child_process');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const webpackConfig = require('./webpack.config.js');
const path = require('path');

const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const replace = require('gulp-replace');

gulp.task('process-src', processSrc);
gulp.task('release', ['process-src', 'bundle-site' ]);
gulp.task('default', ['release']);

/* for ci */
gulp.task('copy-ag-dependencies-to-dist', ['copy-ag-grid-to-dist', 'copy-ag-grid-enterprise-to-dist']);
gulp.task('copy-ag-grid-to-dist', copyAgGridToDist);
gulp.task('copy-ag-grid-enterprise-to-dist', copyAgGridEnterpriseToDist);

gulp.task('bundle-site', () => {
    // remove entry, we will pipe the site file
    // the rest of the files will come from CDN
    delete webpackConfig.entry; // = [ './src/_assets/ts/site.ts'  ];

    // delete webpackConfig.output.path;

    return gulp.src('./src/_assets/ts/site.ts' )
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/dist'));
});

const SKIP_INLINE=true;

// the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
function processSrc() {

    const version = require('../ag-grid/package.json').version;

    const phpFilter = filter( '**/*.php', { restore: true } );
    const bootstrapFilter = filter('src/dist/bootstrap/css/bootstrap.css', { restore: true })

    const hardCodedScriptFilter = filter( ['**/*.html', 'src/index.php'], { restore: true } );

    const uncssPipe = uncss({ html: ['src/**/*.php','src/**/*.html'],
        ignore: [
            '.nav-pills > li.active > a',
            '.nav-pills > li.active > a:hover',
            '.nav-pills > li.active > a:focus',
        ]
    });

    return gulp.src(['./src/**/*','!./src/dist/ag-grid/','!./src/dist/ag-grid-enterprise/'])

        // inline the PHP part
        .pipe(phpFilter)
        .pipe(replace('$$VERSION$$', version))
        // .pipe(debug())
        .pipe(gulpIf(!SKIP_INLINE, inlinesource()))
        .pipe(phpFilter.restore)


        // replace the hard-coded scripts with unpkg

        .pipe(hardCodedScriptFilter)
        .pipe(replace('../dist/ag-grid/ag-grid.js', `https://unpkg.com/ag-grid@${version}/dist/ag-grid.min.js`))
        .pipe(replace('../dist/ag-grid-enterprise/ag-grid-enterprise.js', `https://unpkg.com/ag-grid-enterprise@${version}/dist/ag-grid-enterprise.min.js`))
        .pipe(hardCodedScriptFilter.restore)

        // do uncss
        .pipe(bootstrapFilter)
        // .pipe(debug())
        .pipe(gulpIf(!SKIP_INLINE, uncssPipe))
        .pipe(bootstrapFilter.restore)
    
        .pipe(gulp.dest('./dist'));
}

function copyAgGridToDist() {
    return gulp.src(['./node_modules/ag-grid/dist/ag-grid.js'])
        .pipe(gulp.dest('./src/dist/ag-grid/'));
}

function copyAgGridEnterpriseToDist() {
    return gulp.src(['./node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.js'])
        .pipe(gulp.dest('./src/dist/ag-grid-enterprise/'));
}

gulp.task('serve', cb => {
    const php = cp.spawn('php', ['-S', '0.0.0.0:8888', '-t', 'src'], { stdio: 'inherit', env: { 'AG_DEV': 'true' } });
    const gulp = cp.spawn('./node_modules/.bin/webpack-dev-server' , { stdio: 'inherit' } );

    process.on('exit', () => {
        php.kill();
        gulp.kill();
    })
});

gulp.task('serve-release', cb => {
    const php = cp.spawn('php', ['-S', '0.0.0.0:8080', '-t', 'dist'], { stdio: 'inherit' });

    process.on('exit', () => {
        php.kill();
    })
});
