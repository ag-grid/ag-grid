const fs = require('fs-extra');
const gulp = require('gulp');
const { series } = require('gulp');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const inlinesource = require('gulp-inline-source');
const cp = require('child_process');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const replace = require('gulp-replace');
const merge = require('merge-stream');
const { getAllModules } = require("./utils");
// const debug = require('gulp-debug'); // don't remove this Gil

const { generateGridExamples, generateChartExamples } = require('./example-generator-documentation');

const SKIP_INLINE = true;
const DEV_DIR = 'dev';
const distFolder = './dist';

const { gridCommunityModules, gridEnterpriseModules, chartCommunityModules } = getAllModules();

// copy core project libs (community, enterprise, angular etc) to dist/dev folder
const populateDevFolder = () => {
    console.log("Populating dev folder with modules...");

    const createCopyTask = (source, cwd, destination) => gulp
        .src([source, '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd })
        .pipe(gulp.dest(`${distFolder}/${DEV_DIR}/${destination}`));

    const moduleCopyTasks = gridCommunityModules
        .concat(gridEnterpriseModules)
        .concat(chartCommunityModules)
        .map(module => createCopyTask(`${module.rootDir}/**/*.*`, `${module.rootDir}/`, module.publishedName));

    const react = createCopyTask('../../community-modules/react/**/*.*', '../../community-modules/react/', '@ag-grid-community/react');
    const angular = createCopyTask('../../community-modules/angular/dist/ag-grid-angular/**/*.*', '../../community-modules/angular/', '@ag-grid-community/angular');
    const angularLegacy = createCopyTask('../../community-modules/angular-legacy/dist/ag-grid-angular-legacy/**/*.*', '../../community-modules/angular-legacy/', '@ag-grid-community/angular-legacy');
    const vue = createCopyTask('../../community-modules/vue/**/*.*', '../../community-modules/vue/', '@ag-grid-community/vue');
    const vue3 = createCopyTask('../../community-modules/vue3/**/*.*', '../../community-modules/vue3/', '@ag-grid-community/vue3');

    const chartReact = createCopyTask('../../charts-packages/ag-charts-react/**/*.*', '../../charts-packages/ag-charts-react/', 'ag-charts-react');
    const chartAngular = createCopyTask('../../charts-packages/ag-charts-angular/dist/ag-charts-angular/**/*.*', '../../charts-packages/ag-charts-angular/', 'ag-charts-angular');
    const chartAngularLegacy = createCopyTask('../../charts-packages/ag-charts-angular-legacy/dist/ag-charts-angular-legacy/**/*.*', '../../charts-packages/ag-charts-angular-legacy/', 'ag-charts-angular-legacy');
    const chartVue = createCopyTask('../../charts-packages/ag-charts-vue/**/*.*', '../../charts-packages/ag-charts-vue/', 'ag-charts-vue');
    const chartVue3 = createCopyTask('../../charts-packages/ag-charts-vue3/**/*.*', '../../charts-packages/ag-charts-vue3/', 'ag-charts-vue3');

    const packageCommunity = createCopyTask('../../grid-packages/ag-grid-community/**/*.*', '../../grid-packages/ag-grid-community/', 'ag-grid-community');
    const packageEnterprise = createCopyTask('../../grid-packages/ag-grid-enterprise/**/*.*', '../../grid-packages/ag-grid-enterprise/', 'ag-grid-enterprise');
    const packageAngular = createCopyTask('../../grid-packages/ag-grid-angular/dist/ag-grid-angular/**/*.*', '../../grid-packages/ag-grid-angular/', 'ag-grid-angular');
    const packageAngularLegacy = createCopyTask('../../grid-packages/ag-grid-angular-legacy/dist/ag-grid-angular-legacy/**/*.*', '../../grid-packages/ag-grid-angular-legacy/', 'ag-grid-angular-legacy');
    const packageReact = createCopyTask('../../grid-packages/ag-grid-react/**/*.*', '../../grid-packages/ag-grid-react/', 'ag-grid-react');
    const packageVue = createCopyTask('../../grid-packages/ag-grid-vue/**/*.*', '../../grid-packages/ag-grid-vue/', 'ag-grid-vue');
    const packageVue3 = createCopyTask('../../grid-packages/ag-grid-vue3/**/*.*', '../../grid-packages/ag-grid-vue3/', 'ag-grid-vue3');

    return merge(
        ...moduleCopyTasks,
        react, angular, angularLegacy, vue, vue3,
        chartReact, chartAngular, chartAngularLegacy, chartVue, chartVue3,
        packageCommunity, packageEnterprise, packageAngular, packageAngularLegacy, packageReact, packageVue, packageVue3
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
    gulp.src(['../../community-modules/all-modules/dist/ag-grid-community.js']).pipe(gulp.dest(`${distFolder}/@ag-grid-community/all-modules/dist/`)),
    gulp
        .src(['../../enterprise-modules/all-modules/dist/ag-grid-enterprise.js', '../../enterprise-modules/all-modules/dist/ag-grid-enterprise.min.js'])
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
gulp.task('generate-chart-examples', generateChartExamples.bind(null, '*', null));

gulp.task('clean-dist', () => fs.remove(distFolder));
gulp.task('populate-dev-folder', populateDevFolder);
gulp.task('process-src', processSource);
gulp.task('copy-from-dist', copyFromDistFolder);
gulp.task('copy-prod-webserver-files', copyProdWebServerFilesToDist);
gulp.task('copy-documentation-website', copyDocumentationWebsite);
gulp.task('generate-all-examples', series('generate-grid-examples', 'generate-chart-examples'));
gulp.task('release-archive', series('clean-dist', 'process-src', 'copy-from-dist', 'copy-documentation-website', 'populate-dev-folder'));
gulp.task('release', series('clean-dist', 'process-src', 'copy-from-dist', 'copy-documentation-website', 'copy-prod-webserver-files'));
gulp.task('default', series('release'));
gulp.task('serve-dist', serveDist);

//                                                               this, skipFrameworks,  skipExampleFormatting
gulp.task('serve',                  require('./dev-server').bind(null, false,           true));
gulp.task('serve-core-only',        require('./dev-server').bind(null, true,            true));
gulp.task('serve-with-formatting',  require('./dev-server').bind(null, false,           false));
