const gulp = require('gulp');
const {series, parallel} = require('gulp');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const inlinesource = require('gulp-inline-source');
const cp = require('child_process');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const replace = require('gulp-replace');
const merge = require('merge-stream');
// const debug = require('gulp-debug'); // don't remove this Gil

const generateExamples = require('./example-generator');
const buildPackagedExamples = require('./packaged-example-builder');


const SKIP_INLINE = true;
const DEV_DIR = "dev";

// copy core project libs (community, enterprise, angular etc) to dist/dev folder
const populateDevFolder = () => {
    const standard = gulp.src('../ag-grid-community/**/*.*', {base: '../ag-grid-community/'}).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-community`));
    const enterprise = gulp.src('../ag-grid-enterprise/**/*.*', {base: '../ag-grid-enterprise/'}).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-enterprise`));
    const enterpriseBundle = gulp.src('../ag-grid-enterprise/dist/ag-grid-enterprise.js').pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-enterprise-bundle/`));
    const react = gulp.src('../ag-grid-react/**/*.*', {base: '../ag-grid-react/'}).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-react`));
    const angular = gulp.src('../ag-grid-angular/**/*.*', {base: '../ag-grid-angular/'}).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-angular`));
    const vue = gulp.src('../ag-grid-vue/**/*.*', {base: '../ag-grid-vue/'}).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-vue`));

    return merge(standard, enterprise, enterpriseBundle, react, angular, vue);
};

const processSource = () => {
    // the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
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
            .src(['./src/**/*', '!./src/dist/ag-grid-community/', '!./src/dist/ag-grid-enterprise/', `!${DEV_DIR}`])
            // inline the PHP part
            .pipe(phpFilter)
            // .pipe(debug())
            .pipe(inlinesource())
            // .pipe(debug())
            .pipe(phpFilter.restore)
            // do uncss
            .pipe(bootstrapFilter)
            // .pipe(debug())
            .pipe(gulpIf(!SKIP_INLINE, postcss(uncssPipe)))
            .pipe(bootstrapFilter.restore)
            .pipe(gulp.dest('./dist'))
    );
};

const bundleSite = () => {
    const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
    const webpackConfig = require('./webpack-config/site.js');
    webpackConfig.plugins.push(new UglifyJSPlugin({sourceMap: true}));
    webpackConfig.devtool = false;

    return gulp
        .src('./src/_assets/homepage/main.ts')
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/dist'));
};

const copyFromDistFolder = () => {
    return merge(
        gulp.src(['../ag-grid-community/dist/ag-grid-community.js']).pipe(gulp.dest('./dist/dist/ag-grid-community/')),
        gulp
            .src(['../ag-grid-enterprise/dist/ag-grid-enterprise.js', '../ag-grid-enterprise/dist/ag-grid-enterprise.min.js'])
            .pipe(gulp.dest('./dist/dist/ag-grid-enterprise'))
    );
};

const servePreview = (done) => {
    const php = cp.spawn('php', ['-S', '127.0.0.1:9999', '-t', 'dist'], {
        stdio: 'inherit'
    });

    process.on('exit', () => {
        php.kill();
    });

    done();
};

// if local we serve from /dist, but once this is run entries will point to corresponding cdn entries instead
const replaceAgReferencesWithCdnLinks = () => {
    const version = require('../ag-grid-community/package.json').version;

    return gulp
        .src('./dist/config.php')
        .pipe(replace('$$LOCAL$$', version))
        .pipe(gulp.dest('./dist'));
};

gulp.task('generate-examples-release', (done) => {
    generateExamples.bind(
        null,
        () => {
            console.log('generation done.');
            done();
        },
        undefined,
        false
    )();
});
gulp.task('generate-examples-dev', (done) => {
    generateExamples.bind(
        null,
        () => {
            console.log('generation done.');
            done();
        },
        undefined,
        true
    )();
});
gulp.task('build-packaged-examples', (done) => buildPackagedExamples(() => {
    console.log("Packaged Examples Built");
    done();
}));
gulp.task('populate-dev-folder', populateDevFolder);
gulp.task('process-src', processSource);
gulp.task('bundle-site', bundleSite);
gulp.task('copy-from-dist', copyFromDistFolder);
gulp.task('release-archive', series(parallel('generate-examples-release', 'build-packaged-examples'), 'process-src', 'bundle-site', 'copy-from-dist', 'populate-dev-folder'));
gulp.task('release', series(parallel('generate-examples-release', 'build-packaged-examples'), 'process-src', 'bundle-site', 'copy-from-dist'));
gulp.task('default', series('release'));
gulp.task('serve-preview', servePreview);
gulp.task('replace-references-with-cdn', replaceAgReferencesWithCdnLinks);
gulp.task('generate-examples', series('generate-examples-dev'));
gulp.task('serve', require('./dev-server'));
