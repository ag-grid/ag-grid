const fs = require('fs-extra');
const gulp = require('gulp');
const { series } = require('gulp');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const inlinesource = require('gulp-inline-source');
const cp = require('child_process');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const replace = require('gulp-replace');
const merge = require('merge-stream');
const { getAllModules } = require("./utils");
// const debug = require('gulp-debug'); // don't remove this Gil

const { generateGridExamples } = require('./example-generator-documentation');

const SKIP_INLINE = true;
const DEV_DIR = 'dev';
const distFolder = './dist';

const { gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules } = getAllModules();

// copy core project libs (community, enterprise, angular etc) to dist/dev folder
const populateDevFolder = () => {
    console.log("Populating dev folder with modules...");

    const createCopyTask = (source, cwd, destination) => {
        return gulp
            .src([source, '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd })
            .pipe(gulp.dest(`${distFolder}/${DEV_DIR}/${destination}`));
    }

    const createChartsCopyTask = (source, cwd, destination) => {
        return gulp
            .src([source, '!src/**/*', '!cypress/**/*'], { base: cwd })
            .pipe(gulp.dest(`${distFolder}/${DEV_DIR}/${destination}`));
    }

    const moduleCopyTasks = gridCommunityModules
        .concat(gridEnterpriseModules)
        .map(module => createCopyTask(`${module.rootDir}/**/*.*`, `${module.rootDir}/`, module.publishedName));

    const chartsCommunity = createChartsCopyTask('./node_modules/ag-charts-community/**/*.*', './node_modules/ag-charts-community', 'ag-charts-community');
    const chartsReact = createChartsCopyTask('./node_modules/ag-charts-react/**/*.*', './node_modules/ag-charts-react/', 'ag-charts-react');
    const chartsAngular = createChartsCopyTask('./node_modules/ag-charts-angular/**/*.*', './node_modules/ag-charts-angular/', 'ag-charts-angular');
    const chartsVue = createChartsCopyTask('./node_modules/ag-charts-vue/**/*.*', './node_modules/ag-charts-vue/', 'ag-charts-vue');
    const chartsVue3 = createChartsCopyTask('./node_modules/ag-charts-vue3/**/*.*', './node_modules/ag-charts-vue3/', 'ag-charts-vue3');
    const chartsEnterprise = createChartsCopyTask('./node_modules/ag-charts-enterprise/**/*.*', './node_modules/ag-charts-enterprise/', 'ag-charts-enterprise');

    const react = createCopyTask('../../grid-community-modules/react/**/*.*', '../../grid-community-modules/react/', '@ag-grid-community/react');
    const angular = createCopyTask('../../grid-community-modules/angular/dist/ag-grid-angular/**/*.*', '../../grid-community-modules/angular/', '@ag-grid-community/angular');
    const vue = createCopyTask('../../grid-community-modules/vue/**/*.*', '../../grid-community-modules/vue/', '@ag-grid-community/vue');
    const vue3 = createCopyTask('../../grid-community-modules/vue3/**/*.*', '../../grid-community-modules/vue3/', '@ag-grid-community/vue3');

    const styles = createCopyTask('../../grid-community-modules/styles/**/*.*', '../../grid-community-modules/styles/', '@ag-grid-community/styles');

    const packageCommunity = createCopyTask('../../grid-packages/ag-grid-community/**/*.*', '../../grid-packages/ag-grid-community/', 'ag-grid-community');
    const packageEnterprise = createCopyTask('../../grid-packages/ag-grid-enterprise/**/*.*', '../../grid-packages/ag-grid-enterprise/', 'ag-grid-enterprise');
    const packageGridChartsEnterprise = createCopyTask('../../grid-packages/ag-grid-charts-enterprise/**/*.*', '../../grid-packages/ag-grid-charts-enterprise/', 'ag-grid-charts-enterprise');
    const packageAngular = createCopyTask('../../grid-packages/ag-grid-angular/dist/ag-grid-angular/**/*.*', '../../grid-packages/ag-grid-angular/', 'ag-grid-angular');
    const packageReact = createCopyTask('../../grid-packages/ag-grid-react/**/*.*', '../../grid-packages/ag-grid-react/', 'ag-grid-react');
    const packageVue = createCopyTask('../../grid-packages/ag-grid-vue/**/*.*', '../../grid-packages/ag-grid-vue/', 'ag-grid-vue');
    const packageVue3 = createCopyTask('../../grid-packages/ag-grid-vue3/**/*.*', '../../grid-packages/ag-grid-vue3/', 'ag-grid-vue3');

    return merge(
        ...moduleCopyTasks,
        react, angular, vue, vue3,
        styles,
        chartsCommunity, chartsEnterprise, chartsReact, chartsAngular, chartsVue, chartsVue3,
        packageCommunity, packageEnterprise, packageGridChartsEnterprise, packageAngular, packageReact, packageVue, packageVue3
    );
};

const processSource = () => {
    // the below caused errors if we tried to copy in from ag-grid and ag-grid-enterprise linked folders
    const phpFilter = filter('**/*.php', { restore: true });
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
            .src([
                './src/**/*',
                '!./src/dist/ag-grid-community/',
                '!./src/dist/ag-grid-enterprise/',
                '!./src/dist/ag-grid-charts-enterprise/',
                '!./src/dist/@ag-grid-community/',
                '!./src/dist/@ag-grid-enterprise/',
                `!${DEV_DIR}`
            ])
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
            .pipe(gulp.dest(distFolder))
    );
};

const copyFromDistFolder = () => merge(
    gulp.src(['../../grid-community-modules/all-modules/dist/ag-grid-community.js']).pipe(gulp.dest(`${distFolder}/@ag-grid-community/all-modules/dist/`)),
    gulp
        .src(['../../grid-enterprise-modules/all-modules/dist/ag-grid-enterprise.js', '../../grid-enterprise-modules/all-modules/dist/ag-grid-enterprise.min.js'])
        .pipe(gulp.dest(`${distFolder}/@ag-grid-enterprise/all-modules/dist/`))
);

const copyProdWebServerFilesToDist = () => gulp.src([
    './.htaccess',
    './src/_assets/favicons/favicon-196.png',
    './src/_assets/favicons/favicon-192.png',
    './src/_assets/favicons/favicon-180.png',
    './src/_assets/favicons/favicon-167.png',
    './src/_assets/favicons/favicon-152.png',
    './src/_assets/favicons/favicon-128.png',
    './src/_assets/favicons/favicon-32.png'
]).pipe(gulp.dest(distFolder));

const copyDocumentationWebsite = () => gulp.src(['./documentation/public/**/*']).pipe(gulp.dest(distFolder));

const serveDist = (done) => {
    const php = cp.spawn('php', ['-S', '127.0.0.1:9999', '-t', distFolder], {
        stdio: 'inherit'
    });

    process.on('exit', () => php.kill());

    done();
};

gulp.task('generate-grid-examples', generateGridExamples.bind(null, '*', null));

gulp.task('clean-dist', () => fs.remove(distFolder));
gulp.task('populate-dev-folder', populateDevFolder);
gulp.task('process-src', processSource);
gulp.task('copy-from-dist', copyFromDistFolder);
gulp.task('copy-prod-webserver-files', copyProdWebServerFilesToDist);
gulp.task('copy-documentation-website', copyDocumentationWebsite);
gulp.task('generate-all-examples', series('generate-grid-examples'));
gulp.task('release-archive', series('clean-dist', 'process-src', 'copy-from-dist', 'copy-documentation-website', 'populate-dev-folder'));
gulp.task('release', series('clean-dist', 'process-src', 'copy-from-dist', 'copy-documentation-website', 'copy-prod-webserver-files'));
gulp.task('default', series('release'));
gulp.task('serve-dist', serveDist);

//                                                                      skipFrameworks, skipExampleFormatting, skipExampleGeneration, skipAutoDocGeneration,
// gulp.task('serve',                  require('./dev-server').bind(null, false,           true,                  false,                false));
// gulp.task('serve-core-only',        require('./dev-server').bind(null, true,            true,                  false,                true));
// gulp.task('serve-with-formatting',  require('./dev-server').bind(null, false,           false,                 false,                false));
// gulp.task('serve-website-only',     require('./dev-server').bind(null, false,           true,                  true,                 false));
// gulp.task('serve-framework-only',   require('./dev-server').bind(null, false,           true,                  true,                 true));

gulp.task('serve-new',                  require('./new-dev-server').bind(null, false,           true,             false,                false));
gulp.task('serve-core-only-new',        require('./new-dev-server').bind(null, true,            true,             false,                false));
gulp.task('serve-website-only-new',     require('./new-dev-server').bind(null, false,           true,             true,                 false));
gulp.task('serve-framework-only-new',   require('./new-dev-server').bind(null, false,           true,             true,                 true));
