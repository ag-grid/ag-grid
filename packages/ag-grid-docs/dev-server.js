const os = require('os');
const fs = require('fs');
const cp = require('child_process');
const glob = require('glob');
const path = require('path');
const rimraf = require('rimraf');
const express = require('express');
const realWebpack = require('webpack');
const proxy = require('express-http-proxy');
const webpackMiddleware = require('webpack-dev-middleware');
const chokidar = require('chokidar');
const generateExamples = require('./example-generator');
const buildPackagedExamples = require('./packaged-example-builder');
const {updateBetweenStrings, getAllModules} = require("./utils");

const lnk = require('lnk').sync;
const mkdirp = require('mkdir-p').sync;

const EXPRESS_PORT = 8080;
const PHP_PORT = 8888;
const HOST = '127.0.0.1';
const WINDOWS = /^win/.test(os.platform());

if (!process.env.AG_EXAMPLE_THEME_OVERRIDE) {
    process.env.AG_EXAMPLE_THEME_OVERRIDE = 'alpine';
}

function addWebpackMiddleware(app, configFile, prefix, bundleDescriptor) {
    const webpackConfig = require(path.resolve(`./webpack-config/${configFile}`));

    const compiler = realWebpack(webpackConfig);
    const instance = webpackMiddleware(compiler, {
        noInfo: true,
        quiet: true,
        stats: 'errors-only',
        // stats: {
        //     colors: true,
        //     hash: false,
        //     version: false,
        //     timings: false,
        //     assets: false,
        //     chunks: false,
        //     modules: false,
        //     reasons: false,
        //     children: false,
        //     source: false,
        //     errors: false,
        //     errorDetails: false,
        //     warnings: false,
        //     publicPath: false
        // },
        // logLevel: 'trace',
        publicPath: '/'
    });
    instance.waitUntilValid(() => {
        console.log(`${bundleDescriptor} is now ready`);
    });

    app.use(
        prefix,
        instance
    );
}

function launchPhpCP(app) {
    const php = cp.spawn('php', ['-S', `${HOST}:${PHP_PORT}`, '-t', 'src'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        env: {AG_DEV: 'true'}
    });

    app.use(
        '/',
        proxy(`${HOST}:${PHP_PORT}`, {
            proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
                proxyReqOpts.headers['X-PROXY-HTTP-HOST'] = srcReq.headers.host;
                return proxyReqOpts;
            }
        })
    );

    process.on('exit', () => {
        php.kill();
    });
}

function serveFramework(app, framework) {
    console.log(`serving ${framework}`);
    app.use(`/dev/${framework}`, express.static(`./_dev/${framework}`));
}

function serveModules(app, communityModules, enterpriseModules) {
    console.log("serving modules");
    communityModules.concat(enterpriseModules).forEach(module => {
        console.log(`serving modules ${module.publishedName} from ./_dev/${module.publishedName} - available at /dev/${module.publishedName}`);
        app.use(`/dev/${module.publishedName}`, express.static(`./_dev/${module.publishedName}`));
    });
}

function launchTSCCheck() {
    const tscPath = WINDOWS ? 'node_modules\\.bin\\tsc.cmd' : 'node_modules/.bin/tsc';

    const tsChecker = cp.spawn(tscPath, ['--watch', '--noEmit']);

    tsChecker.stdout.on('data', data => {
        data
            .toString()
            .trim()
            .split('\n')
            .filter(line => line.indexOf('Watching for') === -1 && line.indexOf('File change') === -1)
            .filter(line => line.indexOf('__tests__') === -1 && line.indexOf('.test.') === -1 && line.indexOf('setupTests.ts') === -1)
            .filter(line => line.indexOf('Experimental') === -1)
            .forEach(line => console.log(line.replace('_dev', '..').replace('/dist/lib/', '/src/ts/')));
    });
}

function symlinkModules(communityModules, enterpriseModules) {
    // we delete the _dev folder each time we run now as we're constantly adding new modules etc
    // this saves us having to manually delete _dev each time
    if (fs.existsSync('_dev')) {
        rimraf.sync("_dev");
    }

    mkdirp('_dev/');
    mkdirp('_dev/@ag-grid-community/');
    mkdirp('_dev/@ag-grid-enterprise/');

    let linkType = 'symbolic';
    if (WINDOWS) {
        console.log('creating window links...');
        linkType = 'junction';
    }

    lnk('../../community-modules/grid-vue/', '_dev/@ag-grid-community', {force: true, type: linkType, rename: 'vue'});
    lnk('../../community-modules/grid-angular/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'angular'
    });
    lnk('../../community-modules/grid-react/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'react'
    });

    communityModules
        .forEach(module => {
            lnk(module.rootDir, '_dev/@ag-grid-community', {
                force: true,
                type: linkType,
                rename: module.moduleDirName.replace('grid-', '')
            });
        });

    enterpriseModules
        .forEach(module => {
            lnk(module.rootDir, '_dev/@ag-grid-enterprise', {
                force: true,
                type: linkType,
                rename: module.moduleDirName.replace('grid-', '')
            });
        });
}

const exampleDirMatch = new RegExp('src/([-\\w]+)/');

function watchAndGenerateExamples(communityModules, enterpriseModules) {
    const callback = file => {
        let dir;
        if (file) {
            console.log(`${file} changed, regenerating`);
            try {
                dir = file.replace(/\\/g, '/').match(exampleDirMatch)[1];
            } catch (e) {
                throw new Error(`'${exampleDirMatch}' did not extract the example dir from '${file}'. Fix the regexp in dev-server.js`);
            }
        }
        console.log('regenerating examples...');
        // generateExamples(() => console.log('generation done.'), 'javascript-grid-column-header', true, communityModules, enterpriseModules);
        generateExamples(() => console.log('generation done.'), dir, true, communityModules, enterpriseModules);
    };

    callback();

    chokidar.watch('./src/*/*.php').on('change', callback);
    chokidar.watch('./src/*/*/*.{html,css,js}').on('change', callback);
}

function updateWebpackConfigWithBundles(communityModules, enterpriseModules) {
    console.log("updating webpack config with modules...");

    const communityModulesEntries = communityModules
        .filter(module => module.moduleDirName !== 'grid-core')
        .filter(module => module.moduleDirName !== 'grid-all-modules')
        .map(module => `require("../../../${module.fullJsPath.replace('.ts', '')}");
const ${module.moduleName} = require("../../../${module.fullJsPath.replace('.ts', '')}").${module.moduleName};
        `);

    const communityRegisterModuleLines = communityModules
        .filter(module => module.moduleDirName !== 'grid-core')
        .filter(module => module.moduleDirName !== 'grid-all-modules')
        .map(module => `ModuleRegistry.ModuleRegistry.register(${module.moduleName});`);

    const enterpriseModulesEntries = enterpriseModules
        .filter(module => module.moduleDirName !== 'grid-core')
        .filter(module => module.moduleDirName !== 'grid-all-modules')
        .map(module => `require("../../../${module.fullJsPath.replace('.ts', '')}");
const ${module.moduleName} = require("../../../${module.fullJsPath.replace('.ts', '')}").${module.moduleName};
        `);

    const enterpriseRegisterModuleLines = enterpriseModules
        .filter(module => module.moduleDirName !== 'grid-core')
        .filter(module => module.moduleDirName !== 'grid-all-modules')
        .map(module => `ModuleRegistry.ModuleRegistry.register(${module.moduleName});`);

    const enterpriseBundleFilename = './src/_assets/ts/enterprise-grid-all-modules-umd.js';
    const communityFilename = 'src/_assets/ts/community-grid-all-modules-umd.js';

    const existingEnterpriseBundleLines = fs.readFileSync(enterpriseBundleFilename, 'UTF-8').split('\n');
    let modulesLineFound = false;
    const newEnterpriseBundleLines = [];
    existingEnterpriseBundleLines.forEach(line => {
        if (!modulesLineFound) {
            modulesLineFound = line.indexOf("/* MODULES - Don't delete this line */") !== -1;
            newEnterpriseBundleLines.push(line);
        }
    });
    const newEnterpriseBundleContent = newEnterpriseBundleLines.concat(enterpriseModulesEntries).concat(communityModulesEntries);
    fs.writeFileSync(enterpriseBundleFilename, newEnterpriseBundleContent.concat(enterpriseRegisterModuleLines).concat(communityRegisterModuleLines).join('\n'), 'UTF-8');

    const existingCommunityLines = fs.readFileSync(communityFilename).toString().split('\n');
    modulesLineFound = false;
    const newCommunityLines = [];
    existingCommunityLines.forEach(line => {
        if (!modulesLineFound) {
            modulesLineFound = line.indexOf("/* MODULES - Don't delete this line */") !== -1;
            newCommunityLines.push(line);
        }
    });
    fs.writeFileSync(communityFilename, newCommunityLines.concat(communityModulesEntries).concat(communityRegisterModuleLines).join('\n'), 'UTF-8');
}

function updateUtilsSystemJsMappingsForFrameworks(communityModules, enterpriseModules) {
    console.log("updating util.php -> systemjs mapping with modules...");

    const utilityFilename = 'src/example-runner/utils.php';
    const utilFileContents = fs.readFileSync(utilityFilename, 'UTF-8');

    const cssFiles = glob.sync(`../../community-modules/grid-all-modules/dist/styles/*.css`)
        .filter(css => !css.includes(".min."))
        .filter(css => !css.includes("Font"))
        .map(css => css.replace('../../community-modules/grid-all-modules/dist/styles/', ''));

    let updatedUtilFileContents = updateBetweenStrings(utilFileContents,
        '/* START OF MODULES DEV - DO NOT DELETE */',
        '/* END OF MODULES DEV - DO NOT DELETE */',
        communityModules,
        enterpriseModules,
        module => `        "${module.publishedName}" => "$prefix/${module.publishedName}",`,
        module => `        "${module.publishedName}" => "$prefix/${module.publishedName}",`);

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF COMMUNITY MODULES PATHS DEV - DO NOT DELETE */',
        '/* END OF COMMUNITY MODULES PATHS DEV - DO NOT DELETE */',
        communityModules,
        [],
        module => `        "${module.publishedName}" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */',
        '/* END OF ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */',
        communityModules,
        enterpriseModules,
        module => `        "${module.publishedName}" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",`,
        module => `        "${module.publishedName}" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",`);

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF CSS DEV - DO NOT DELETE */',
        '/* END OF CSS DEV - DO NOT DELETE */',
        cssFiles,
        [],
        cssFile => `        "@ag-grid-community/all-modules/dist/styles/${cssFile}" => "$prefix/@ag-grid-community/all-modules/dist/styles/${cssFile}",`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF COMMUNITY MODULES PATHS PROD - DO NOT DELETE */',
        '/* END OF COMMUNITY MODULES PATHS PROD - DO NOT DELETE */',
        communityModules,
        [],
        module => `        "${module.publishedName}" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        '/* END OF ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        communityModules,
        enterpriseModules,
        module => `        "${module.publishedName}" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",`,
        module => `        "${module.publishedName}" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",`);

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '/* START OF CSS PROD - DO NOT DELETE */',
        '/* END OF CSS PROD - DO NOT DELETE */',
        cssFiles,
        [],
        cssFile => `        "@ag-grid-community/all-modules/dist/styles/${cssFile}" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/${cssFile}",`,
        () => {
        });

    fs.writeFileSync(utilityFilename, updatedUtilFileContents, 'UTF-8');
}

function watchModules(buildSourceModuleOnly) {
    console.log("Watching modules...");
    const lernaScript = WINDOWS ? '.\\scripts\\modules\\lernaWatch.js' : './scripts/modules/lernaWatch.js';
    const node = 'node';
    const watchMode = buildSourceModuleOnly ? '-s' : '-w';
    const lernaWatch = cp.spawn(node, [lernaScript, watchMode], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    process.on('exit', () => {
        lernaWatch.kill();
    });
}

function watchCssModulesBeta() {
    console.log("Watching CSS only...");
    const cssScript = WINDOWS ? '.\\scripts\\modules\\lernaWatch.js' : './scripts/modules/lernaWatch.js';
    const node = 'node';
    const cssWatch = cp.spawn(node, [cssScript, " --watchBeta"], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    process.on('exit', () => {
        cssWatch.kill();
    });
}

function watchModulesBeta() {
    console.log("Watching TS files only...");
    const tsc = WINDOWS ? '.\\node_modules\\.bin\\tsc' : './node_modules/.bin/tsc';
    const node = 'node';
    const tsWatch = cp.spawn(node, [tsc, "--build", "--preserveWatchOutput", '--watch'], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    process.on('exit', () => {
        tsWatch.kill();
    });
}

function buildModules() {
    console.log("Building Modules...");
    const tsc = WINDOWS ? 'node_modules\\.bin\\tsc.cmd' : './node_modules/.bin/tsc';
    const result = cp.spawnSync(tsc, ['--build'], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    if(result && result.status !== 0) {
        console.log('ERROR Building Modules');
        return result.status;
    }
    return 0;
}

function buildCssBeta() {
    console.log("Building all modules [BETA]...");
    const lernaScript = WINDOWS ? `node .\\scripts\\modules\\lernaWatch.js --buildBeta` : `node ./scripts/modules/lernaWatch.js --buildBeta`;
    require('child_process').execSync(lernaScript, {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });
}

function updateSystemJsBoilerplateMappingsForFrameworks(communityModules, enterpriseModules) {
    console.log("updating fw systemjs boilerplate config with modules...");

    // spl module
    const systemJsFiles = [
        './src/example-runner/angular-boilerplate/systemjs.config.js',
        './src/example-runner/react-boilerplate/systemjs.config.js',
        './src/example-runner/vue-boilerplate/systemjs.config.js'];

    systemJsFiles.forEach(systemJsFile => {
        const fileLines = fs.readFileSync(systemJsFile, 'UTF-8');

        let updateFileLines = updateBetweenStrings(fileLines,
            '/* START OF MODULES - DO NOT DELETE */',
            '/* END OF MODULES - DO NOT DELETE */',
            communityModules,
            enterpriseModules,
            module => `           '${module.publishedName}': {
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },`,
            module => `           '${module.publishedName}': {
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },`);

        fs.writeFileSync(systemJsFile, updateFileLines, 'UTF-8');
    })
}

const MultiInstanceLock = {
    lockFile: __dirname + '/../../docs_are_running',
    add: function () {
        if (fs.existsSync(this.lockFile)) {
            console.error('One `gulp serve` task is already running.');
            return false;
        }
        fs.writeFileSync(this.lockFile);
        return true;
    },
    remove: function () {
        if (fs.existsSync(this.lockFile)) {
            fs.unlinkSync(this.lockFile);
        }
    }
};

module.exports = (buildSourceModuleOnly = false, beta = false, done) => {
    if (!MultiInstanceLock.add()) {
        return;
    }
    process.on('exit', () => {
        MultiInstanceLock.remove();
    });
    process.on('SIGINT', () => {
        MultiInstanceLock.remove();
    });

    const {communityModules, enterpriseModules} = getAllModules();

    const app = express();

    // necessary for plunkers
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return next();
    });

    updateWebpackConfigWithBundles(communityModules, enterpriseModules);

    // if we encounter a build failure on startup (in beta) we exit
    // prevents the need to have to CTRL+C several times for certain types of error
    const exitCode = buildModules(beta, done);
    if(beta && exitCode === 1) {
        done();
        return;
    }

    buildCssBeta();

    if (beta) {
        watchCssModulesBeta();
        watchModulesBeta();

        // serve community, enterprise and react

        // for js examples that just require community functionality (landing pages, vanilla community examples etc)
        // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-community/all-modules/dist/ag-grid-community.js
        addWebpackMiddleware(app, 'webpack.community-grid-all-umd.beta.config.js', '/dev/@ag-grid-community/all-modules/dist', 'ag-grid-community.js');

        // for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)
        // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js
        addWebpackMiddleware(app, 'webpack.enterprise-grid-all-umd.beta.config.js', '/dev/@ag-grid-enterprise/all-modules/dist', 'ag-grid-enterprise.js');

    } else {
        watchModules(buildSourceModuleOnly);

        // serve community, enterprise and react

        // for js examples that just require community functionality (landing pages, vanilla community examples etc)
        // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-community/all-modules/dist/ag-grid-community.js
        addWebpackMiddleware(app, 'webpack.community-grid-all-umd.config.js', '/dev/@ag-grid-community/all-modules/dist', 'ag-grid-community.js');

        // for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)
        // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js
        addWebpackMiddleware(app, 'webpack.enterprise-grid-all-umd.config.js', '/dev/@ag-grid-enterprise/all-modules/dist', 'ag-grid-enterprise.js');
    }

    // for the actual site - php, css etc
    addWebpackMiddleware(app, 'webpack.site.config.js', '/dist', 'site bundle');

    // add community & enterprise modules to express (for importing in the fw examples)
    symlinkModules(communityModules, enterpriseModules);

    updateUtilsSystemJsMappingsForFrameworks(communityModules, enterpriseModules);
    updateSystemJsBoilerplateMappingsForFrameworks(communityModules, enterpriseModules);
    serveModules(app, communityModules, enterpriseModules);

    serveFramework(app, '@ag-grid-community/angular');
    serveFramework(app, '@ag-grid-community/vue');
    serveFramework(app, '@ag-grid-community/react');

    // build "packaged" landing page examples (for performance reasons)
    // these aren't watched and regenerated like the other examples
    // commented out by default - add if you want to test as part of the dev build (or run separately - see at the end of the file)
    // buildPackagedExamples(() => console.log("Packaged Examples Built")); // scope - for eg react-grid

    // regenerate examples
    watchAndGenerateExamples(communityModules, enterpriseModules);

    // PHP
    launchPhpCP(app);

    // Watch TS for errors. No actual transpiling happens here, just error reporting
    if (!beta) {
        launchTSCCheck(communityModules, enterpriseModules);
    }

    app.listen(EXPRESS_PORT, function () {
        console.log(`ag-Grid dev server available on http://${HOST}:${EXPRESS_PORT}`);
    });
};

//     node dev-server.js generate-examples [src directory]
// eg: node dev-server.js generate-examples javascript-grid-accessing-data
const genExamples = (exampleDir) => {
    return () => {
        console.log('regenerating examples...');
        const {communityModules, enterpriseModules} = getAllModules();
        generateExamples(() => console.log('generation done.'), exampleDir, true, communityModules, enterpriseModules);
    };
};

// dont remove these unused vars
const [cmd, script, execFunc, exampleDir, watch] = process.argv;
if (process.argv.length >= 3) {
    if (execFunc === 'generate-examples') {
        if (exampleDir && watch) {
            const examplePath = path.resolve('./src/', exampleDir);
            chokidar.watch(`${examplePath}/**/*`, {ignored: ['**/_gen/**/*']}).on('change', genExamples(exampleDir));
        } else {
            console.log('regenerating examples...');
            const {communityModules, enterpriseModules} = getAllModules();
            generateExamples(() => console.log('generation done.'), exampleDir, true, communityModules, enterpriseModules);
        }
    } else if (execFunc === 'prebuild-examples') {
        buildPackagedExamples(() => console.log("Packaged Examples Built"), exampleDir || undefined);
    }
}

