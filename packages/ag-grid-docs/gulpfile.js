var gulp = require('gulp');
var postcss = require('gulp-postcss');
var uncss = require('postcss-uncss');
var inlinesource = require('gulp-inline-source');


const cp = require('child_process');

const webpack = require('webpack-stream');
const named = require('vinyl-named');

const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const replace = require('gulp-replace');

const merge = require('merge-stream');

const SKIP_INLINE = true;

gulp.task('release', ['generate-examples', 'process-src', 'bundle-site', 'copy-from-dist', 'populate-dev']);
gulp.task('default', ['release']);

gulp.task('bundle-site', () => {
    const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
    const webpackConfig = require('./webpack-config/site.js');
    webpackConfig.plugins.push( new UglifyJSPlugin({ sourceMap: true }) );
    webpackConfig.devtool = false;

    return gulp
        .src('./src/_assets/homepage/main.ts')
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/dist'));
});

const PACKAGES_DIR = "dev";

// the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
gulp.task('process-src', () => {
    const phpFilter = filter('**/*.php', {restore: true});
    const bootstrapFilter = filter('src/dist/bootstrap/css/bootstrap.css', {
        restore: true
    });

    const uncssPipe = [
        uncss({
            html: ['src/**/*.php', 'src/**/*.html'],
            ignore: ['.nav-pills > li.active > a', '.nav-pills > li.active > a:hover', '.nav-pills > li.active > a:focus']
        })
    ];

    return (
        gulp
            .src(['./src/**/*', '!./src/dist/ag-grid-community/', '!./src/dist/ag-grid-enterprise/', `!${PACKAGES_DIR}`])
            // inline the PHP part
            .pipe(phpFilter)
            // .pipe(debug())
            .pipe(gulpIf(!SKIP_INLINE, inlinesource()))
            .pipe(phpFilter.restore)
            // do uncss
            .pipe(bootstrapFilter)
            // .pipe(debug())
            .pipe(gulpIf(!SKIP_INLINE, postcss(uncssPipe)))
            .pipe(bootstrapFilter.restore)
            .pipe(gulp.dest('./dist'))
    );
});

gulp.task('populate-dev', () => {
    const standard = gulp.src('../ag-grid-community/**/*.*', {base: '../ag-grid-community/'}).pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-community`));

    const enterprise = gulp.src('../ag-grid-enterprise/**/*.*', {base: '../ag-grid-enterprise/'}).pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-enterprise`));

    const enterpriseBundle = gulp.src('../ag-grid-enterprise/dist/ag-grid-enterprise.js').pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-enterprise-bundle/`));

    const react = gulp.src('../ag-grid-react/**/*.*', {base: '../ag-grid-react/'}).pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-react`));

    const angular = gulp.src('../ag-grid-angular/**/*.*', {base: '../ag-grid-angular/'}).pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-angular`));

    const vue = gulp.src('../ag-grid-vue/**/*.*', {base: '../ag-grid-vue/'}).pipe(gulp.dest(`dist/${PACKAGES_DIR}/ag-grid-vue`));

    return merge(standard, enterprise, enterpriseBundle, react, angular, vue);
});

gulp.task('replace-to-cdn', () => {
    const version = require('../ag-grid-community/package.json').version;

    return gulp
        .src('./dist/config.php')
        .pipe(replace('$$LOCAL$$', version))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-from-dist', () => {
    return merge(
        gulp.src(['../ag-grid-community/dist/ag-grid-community.js']).pipe(gulp.dest('./dist/dist/ag-grid-community/')),
        gulp
            .src(['../ag-grid-enterprise/dist/ag-grid-enterprise.js', '../ag-grid-enterprise/dist/ag-grid-enterprise.min.js'])
            .pipe(gulp.dest('./dist/dist/ag-grid-enterprise'))
    );
});


const generateExamples = require('./example-generator');
gulp.task('serve', require('./dev-server'));
gulp.task('generate-examples', generateExamples);

gulp.task('serve-preview', () => {
    const php = cp.spawn('php', ['-S', '127.0.0.1:9999', '-t', 'dist'], {
        stdio: 'inherit'
    });

    process.on('exit', () => {
        php.kill();
    });
});