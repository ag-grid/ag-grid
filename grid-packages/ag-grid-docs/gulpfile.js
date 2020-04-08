const fs = require('fs');
const path = require('path');
const glob = require('glob');
const gulp = require('gulp');
const { series, parallel } = require('gulp');
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
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const { updateBetweenStrings, getAllModules } = require("./utils");
// const debug = require('gulp-debug'); // don't remove this Gil

const generateGridPackageExamples = require('./example-generator').generateGridPackageExamples;
const generateGridModuleExamples = require('./example-generator').generateGridModuleExamples;
const generateChartExamples = require('./example-generator').generateChartExamples;

const SKIP_INLINE = true;
const DEV_DIR = "dev";

const { gridCommunityModules, gridEnterpriseModules, chartCommunityModules } = getAllModules();

// copy core project libs (community, enterprise, angular etc) to dist/dev folder
const populateDevFolder = () => {
    console.log("Populating dev folder with modules...");
    const copyTasks = [];
    gridCommunityModules
        .concat(gridEnterpriseModules)
        .concat(chartCommunityModules)
        .forEach(module => {
            copyTasks.push(
                gulp.src([`${module.rootDir}/**/*.*`, '!node_modules/**/*', '!src/**/*'], { cwd: `${module.rootDir}/` })
                    .pipe(gulp.dest(`dist/${DEV_DIR}/${module.publishedName}`)));
        });

    const react = gulp.src(['../../community-modules/react/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../community-modules/react/' }).pipe(gulp.dest(`dist/${DEV_DIR}/@ag-grid-community/react`));
    const angular = gulp.src(['../../community-modules/angular/dist/ag-grid-angular/**/*.*', '!node_modules/**/*', '!src/**/*'], { cwd: '../../community-modules/angular/' }).pipe(gulp.dest(`dist/${DEV_DIR}/@ag-grid-community/angular`));
    const vue = gulp.src(['../../community-modules/vue/**/*.*', '!node_modules/**/*', '!src/**/*'], { cwd: '../../community-modules/vue/' }).pipe(gulp.dest(`dist/${DEV_DIR}/@ag-grid-community/vue`));

    const chartReact = gulp.src(['../../charts-packages/ag-charts-react/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../charts-packages/ag-charts-react/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-charts-react`));
    const chartAngular = gulp.src(['../../charts-packages/ag-charts-angular/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../charts-packages/ag-charts-angular/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-charts-angular`));
    const chartVue = gulp.src(['../../charts-packages/ag-charts-vue/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../charts-packages/ag-charts-vue/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-charts-vue`));

    const packageCommunity = gulp.src(['../../grid-packages/ag-grid-community/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../grid-packages/ag-grid-community/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-community`));
    const packageEnterprise = gulp.src(['../../grid-packages/ag-grid-enterprise/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../grid-packages/ag-grid-enterprise/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-enterprise`));
    const packageAngular = gulp.src(['../../grid-packages/ag-grid-angular/dist/ag-grid-angular/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../grid-packages/ag-grid-angular/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-angular`));
    const packageReact = gulp.src(['../../grid-packages/ag-grid-react/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../grid-packages/ag-grid-react/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-react`));
    const packageVue = gulp.src(['../../grid-packages/ag-grid-vue/**/*.*', '!node_modules/**/*', '!src/**/*', '!cypress/**/*'], { cwd: '../../grid-packages/ag-grid-vue/' }).pipe(gulp.dest(`dist/${DEV_DIR}/ag-grid-vue`));

    return merge(
        ...copyTasks,
        react, angular, vue,
        chartReact, chartAngular, chartVue,
        packageCommunity, packageEnterprise, packageAngular, packageReact, packageVue
    );
};

updateFrameworkBoilerplateSystemJsEntry = (done) => {
    console.log("updating fw systemjs boilerplate config...");

    const boilerPlateLocation = [
        './dist/example-runner/grid-angular-boilerplate/',
        './dist/example-runner/grid-vue-boilerplate/',
        './dist/example-runner/grid-react-boilerplate/',
        './dist/example-runner/chart-angular-boilerplate/',
        './dist/example-runner/chart-vue-boilerplate/',
        './dist/example-runner/chart-react-boilerplate/',
        './dist/react-runner/app-boilerplate/',
    ];

    boilerPlateLocation.forEach(boilerPlateLocation => {
        fs.renameSync(`${boilerPlateLocation}/systemjs.prod.config.js`, `${boilerPlateLocation}/systemjs.config.js`);
    });

    const utilFileContent = fs.readFileSync('./dist/example-runner/example-mappings.php', 'UTF-8');
    let updatedUtilFileContent = updateBetweenStrings(utilFileContent,
        '/* START OF GRID MODULES DEV - DO NOT DELETE */',
        '/* END OF GRID MODULES DEV - DO NOT DELETE */',
        [],
        [],
        () => {
        },
        () => {
        });

    updatedUtilFileContent = updateBetweenStrings(updatedUtilFileContent,
        '/* START OF CHART MODULES DEV - DO NOT DELETE */',
        '/* END OF CHART MODULES DEV - DO NOT DELETE */',
        [],
        [],
        () => {
        },
        () => {
        });

    fs.writeFileSync('./dist/example-runner/example-mappings.php', updatedUtilFileContent, 'UTF-8');

    done();
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
            .src(['./src/**/*',
                '!./src/dist/ag-grid-community/',
                '!./src/dist/ag-grid-enterprise/',
                '!./src/dist/@ag-grid-community/',
                '!./src/dist/@ag-grid-enterprise/',
                `!${DEV_DIR}`])
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

const bundleSite = (production) => {
    const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
    const webpackConfig = require('./webpack-config/webpack.site.config.js');

    // css deduplication - we do this for both archive & release (to enable testing)
    const CSS_SRC_PATHS = {
        src: path.join(__dirname, '/src')
    };
    const cssWhitelist = () => {
        // ie: ['whitelisted']
        return [];
    };
    const cssWhitelistPatterns = () => {
        // ie: [/^whitelisted-/]
        return [
            /runner-item.*/,
            /level-*/,
            /algolia.*/,
            /aa-.*/
        ];
    };
    webpackConfig.plugins.push(
        new PurgecssPlugin({
            paths: glob.sync(`${CSS_SRC_PATHS.src}/**/*.{php,js,ts,html}`, { nodir: true }),
            whitelist: cssWhitelist,
            whitelistPatterns: cssWhitelistPatterns
        })
    );

    if (production) {
        webpackConfig.plugins.push(new UglifyJSPlugin({ sourceMap: true }));
        webpackConfig.devtool = false;
        webpackConfig.mode = 'production';
        webpackConfig.optimization = {
            minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
        };
    }

    return gulp
        .src('./src/_assets/homepage/homepage.ts')
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('dist/dist'));
};

const copyFromDistFolder = () => {
    return merge(
        gulp.src(['../../community-modules/all-modules/dist/ag-grid-community.js']).pipe(gulp.dest('./dist/@ag-grid-community/all-modules/dist/')),
        gulp
            .src(['../../enterprise-modules/all-modules/dist/ag-grid-enterprise.js', '../../enterprise-modules/all-modules/dist/ag-grid-enterprise.min.js'])
            .pipe(gulp.dest('./dist/@ag-grid-enterprise/all-modules/dist/'))
    );
};

const serveDist = (done) => {
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
    const gridVersion = require('../../community-modules/core/package.json').version;
    const chartsVersion = require('../../charts-packages/ag-charts-community/package.json').version;

    return gulp
        .src('./dist/config.php')
        .pipe(replace('$$GRID_VERSION$$', gridVersion))
        .pipe(replace('$$CHARTS_VERSION$$', chartsVersion))
        .pipe(gulp.dest('./dist'));
};

gulp.task('generate-grid-package-examples', (done) => {
    generateGridPackageExamples.bind(null, '*', null, done)();
});

gulp.task('generate-grid-module-examples', (done) => {
    generateGridModuleExamples.bind(null, '*', null, done)();
});

gulp.task('generate-chart-examples', (done) => {
    generateChartExamples.bind(null, '*', null, done)();
});

gulp.task('populate-dev-folder', populateDevFolder);
gulp.task('update-dist-systemjs-files', updateFrameworkBoilerplateSystemJsEntry);
gulp.task('process-src', processSource);
gulp.task('bundle-site-archive', bundleSite.bind(null, false));
gulp.task('bundle-site-release', bundleSite.bind(null, true));
gulp.task('copy-from-dist', copyFromDistFolder);
gulp.task('replace-references-with-cdn', replaceAgReferencesWithCdnLinks);
gulp.task('generate-examples', parallel('generate-grid-package-examples', 'generate-grid-module-examples', 'generate-chart-examples'));
gulp.task('release-archive', series('generate-examples', 'process-src', 'bundle-site-archive', 'copy-from-dist', 'populate-dev-folder', 'update-dist-systemjs-files'));
gulp.task('release', series('generate-examples', 'process-src', 'bundle-site-release', 'copy-from-dist', 'update-dist-systemjs-files', 'replace-references-with-cdn'));
gulp.task('default', series('release'));
gulp.task('serve-dist', serveDist);

// buildSourceModuleOnly = false, legacy = false, alreadyRunningCheck = false
gulp.task('serve-legacy', require('./dev-server').bind(null, false, true, false));
gulp.task('serve-source-mod-only', require('./dev-server').bind(null, true, true, false));
gulp.task('serve', require('./dev-server').bind(null, true, false, false));
gulp.task('serve-speedy', require('./dev-server').bind(null, true, false, false, true));
gulp.task('serve-check', require('./dev-server').bind(null, false, true, true));
