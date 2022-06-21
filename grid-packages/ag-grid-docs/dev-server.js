const os = require('os');
const fs = require('fs-extra');
const cp = require('child_process');
const glob = require('glob');
const resolve = require('path').resolve;
const https = require('https');
const express = require('express');
const realWebpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const chokidar = require('chokidar');
const tcpPortUsed = require('tcp-port-used');
const {generateDocumentationExamples} = require('./example-generator-documentation');
const {watchValidateExampleTypes} = require('./example-validator');
const {updateBetweenStrings, getAllModules, processStdio} = require('./utils');
const {getFlattenedBuildChainInfo, buildPackages, buildCss, watchCss} = require('./lernaOperations');
const {EOL} = os;

const key = fs.readFileSync(process.env.AG_DOCS_KEY || './selfsigned.key', 'utf8');
const cert = fs.readFileSync(process.env.AG_DOCS_CRT || './selfsigned.crt', 'utf8');
const credentials = {
    key: key,
    cert: cert
};

const flattenArray = array => [].concat.apply([], array);

const lnk = require('lnk').sync;

const EXPRESS_HTTPS_PORT = 8080;

function reporter(middlewareOptions, options) {
    const {log, state, stats} = options;

    if (state) {
        const displayStats = middlewareOptions.stats !== false;
        const statsString = stats.toString(middlewareOptions.stats);

        // displayStats only logged
        if (displayStats && statsString.trim().length) {
            if (stats.hasErrors()) {
                log.error(statsString);
            } else if (stats.hasWarnings()) {
                log.warn(statsString);
            } else {
                log.info(statsString);
            }
        }

        let message = `${middlewareOptions.name} compiled successfully.`;

        if (stats.hasErrors()) {
            message = `Failed to compile ${middlewareOptions.name}.`;
        } else if (stats.hasWarnings()) {
            message = `Compiled ${middlewareOptions.name} with warnings.`;
        }
        log.info(message);
    } else {
        log.info(`Compiling ${middlewareOptions.name}...`);
    }
}

function addWebpackMiddlewareForConfig(app, configFile, prefix, bundleDescriptor) {
    const webpackConfig = require(resolve(`./webpack-config/${configFile}`));

    const compiler = realWebpack(webpackConfig);
    const instance = webpackMiddleware(compiler, {
        name: bundleDescriptor,
        noInfo: true,
        quiet: true,
        stats: 'errors-only',
        publicPath: '/',
        reporter
    });

    app.use(
        prefix,
        instance
    );
}

function launchGatsby() {
    console.log("Launching Gatsby");
    const npm = 'npm';
    const gatsby = cp.spawn(npm, ['start'], {
        cwd: 'documentation',
        stdio: [process.stdin, process.stdout, process.stderr]
    });

    process.on('exit', () => {
        gatsby.kill();
    });

    process.on('SIGINT', () => {
        gatsby.kill();
    });
}

function servePackage(app, framework) {
    console.log(`Serving ${framework}`);
    app.use(`/dev/${framework}`, express.static(`./_dev/${framework}`));
}

function serveCoreModules(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules) {
    console.log("Serving modules");
    gridCommunityModules.concat(gridEnterpriseModules).concat(chartCommunityModules).forEach(module => {
        console.log(`Serving modules ${module.publishedName} from ./_dev/${module.publishedName} - available at /dev/${module.publishedName}`);
        app.use(`/dev/${module.publishedName}`, express.static(`./_dev/${module.publishedName}`));
    });

    console.log(`Serving modules @ag-grid-community/styles from /_dev/@ag-grid-community/styles - available at /dev/@ag-grid-community/styles`);
    app.use(`/dev/@ag-grid-community/styles`, express.static(`./_dev/@ag-grid-community/styles`));

}

function getTscPath() {
    return 'node_modules/.bin/tsc';
}

function symlinkModules(gridCommunityModules, gridEnterpriseModules, chartCommunityModules) {
    // we delete the _dev folder each time we run now as we're constantly adding new modules etc
    // this saves us having to manually delete _dev each time
    if (fs.existsSync('_dev')) {
        fs.removeSync('_dev');
    }

    fs.ensureDirSync('_dev/');
    fs.ensureDirSync('_dev/@ag-grid-community/');
    fs.ensureDirSync('_dev/@ag-grid-enterprise/');

    let linkType = 'symbolic';

    lnk('../../community-modules/vue/', '_dev/@ag-grid-community', {force: true, type: linkType, rename: 'vue'});
    lnk('../../community-modules/vue3/', '_dev/@ag-grid-community', {force: true, type: linkType, rename: 'vue3'});
    lnk('../../community-modules/angular/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'angular'
    });
    lnk('../../community-modules/angular-legacy/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'angular-legacy'
    });
    lnk('../../community-modules/react/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'react'
    });

    gridCommunityModules
        .forEach(module => {
            lnk(module.rootDir, '_dev/@ag-grid-community', {
                force: true,
                type: linkType,
                rename: module.moduleDirName
            });
        });

    gridEnterpriseModules
        .forEach(module => {
            lnk(module.rootDir, '_dev/@ag-grid-enterprise', {
                force: true,
                type: linkType,
                rename: module.moduleDirName
            });
        });

    chartCommunityModules
        .forEach(module => {
            lnk(module.rootDir, '_dev/', {
                force: true,
                type: linkType,
                rename: module.publishedName
            });
        });

    lnk('../../community-modules/styles/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'styles'
    });


    lnk('../../charts-packages/ag-charts-react/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-react'
    });
    lnk('../../charts-packages/ag-charts-angular/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-angular'
    });
    lnk('../../charts-packages/ag-charts-angular-legacy/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-angular-legacy'
    });
    lnk('../../charts-packages/ag-charts-vue/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-vue'
    });
    lnk('../../charts-packages/ag-charts-vue3/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-vue3'
    });

    // old style packages
    lnk('../../grid-packages/ag-grid-community/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-community'
    });
    lnk('../../grid-packages/ag-grid-enterprise/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-enterprise'
    });
    lnk('../../grid-packages/ag-grid-angular/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-angular'
    });
    lnk('../../grid-packages/ag-grid-angular-legacy/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-angular-legacy'
    });
    lnk('../../grid-packages/ag-grid-react/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-react'
    });
    lnk('../../grid-packages/ag-grid-vue/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-vue'
    });
    lnk('../../grid-packages/ag-grid-vue3/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-vue3'
    });
}

const exampleDirMatch = new RegExp('src/([\-\\w]+)/');

async function regenerateDocumentationExamplesForFileChange(file) {
    let scope;

    try {
        scope = file.replace(/\\/g, '/').match(/documentation\/doc-pages\/([^\/]+)\//)[1];
    } catch (e) {
        throw new Error(`'${exampleDirMatch}' could not extract the example dir from '${file}'. Fix the regexp in dev-server.js`);
    }

    if (scope) {
        await generateDocumentationExamples(scope, file);
    }
}

async function watchAndGenerateExamples() {
    if (moduleChanged('.')) {
        await generateDocumentationExamples();

        const npm = 'npm';
        cp.spawnSync(npm, ['run', 'hash']);
    } else {
        console.log("Docs contents haven't changed - skipping example generation");
    }

    chokidar
        .watch([`./documentation/doc-pages/**/examples/**/*.{html,css,js,jsx,ts}`], {ignored: ['**/_gen/**/*']})
        .on('change', regenerateDocumentationExamplesForFileChange);

    chokidar
        .watch([`./documentation/doc-pages/**/*.md`], {ignoreInitial: true})
        .on('add', regenerateDocumentationExamplesForFileChange);
}

const updateWebpackSourceFiles = (gridCommunityModules, gridEnterpriseModules) => {
    const communityModulesEntries = gridCommunityModules
        .filter(module => module.moduleDirName !== 'core')
        .filter(module => module.moduleDirName !== 'all-modules')
        .map(module => `const ${module.moduleName} = require("../../../${module.fullJsPath.replace('.ts', '')}").${module.moduleName};`);

    const communityRegisterModuleLines = gridCommunityModules
        .filter(module => module.moduleDirName !== 'core')
        .filter(module => module.moduleDirName !== 'all-modules')
        .map(module => `ModuleRegistry.register(${module.moduleName});`);

    const enterpriseModulesEntries = gridEnterpriseModules
        .filter(module => module.moduleDirName !== 'core')
        .filter(module => module.moduleDirName !== 'all-modules')
        .map(module => `const ${module.moduleName} = require("../../../${module.fullJsPath.replace('.ts', '')}").${module.moduleName};`);

    const enterpriseRegisterModuleLines = gridEnterpriseModules
        .filter(module => module.moduleDirName !== 'core')
        .filter(module => module.moduleDirName !== 'all-modules')
        .map(module => `ModuleRegistry.register(${module.moduleName});`);

    const enterpriseBundleFilename = './src/_assets/ts/enterprise-grid-all-modules-umd-beta.js';
    const communityFilename = 'src/_assets/ts/community-grid-all-modules-umd-beta.js';

    const existingEnterpriseBundleLines = fs.readFileSync(enterpriseBundleFilename, 'UTF-8').split(EOL);
    let modulesLineFound = false;
    const newEnterpriseBundleLines = [];
    existingEnterpriseBundleLines.forEach(line => {
        if (!modulesLineFound) {
            modulesLineFound = line.indexOf("/* MODULES - Don't delete this line */") !== -1;
            newEnterpriseBundleLines.push(line);
        }
    });
    const newEnterpriseBundleContent = newEnterpriseBundleLines.concat(enterpriseModulesEntries).concat(communityModulesEntries);
    fs.writeFileSync(enterpriseBundleFilename, newEnterpriseBundleContent.concat(enterpriseRegisterModuleLines).concat(communityRegisterModuleLines).join(EOL), 'UTF-8');

    const existingCommunityLines = fs.readFileSync(communityFilename).toString().split(EOL);
    modulesLineFound = false;
    const newCommunityLines = [];
    existingCommunityLines.forEach(line => {
        if (!modulesLineFound) {
            modulesLineFound = line.indexOf("/* MODULES - Don't delete this line */") !== -1;
            newCommunityLines.push(line);
        }
    });
    fs.writeFileSync(communityFilename, newCommunityLines.concat(communityModulesEntries).concat(communityRegisterModuleLines).join(EOL), 'UTF-8');
};

function updateWebpackConfigWithBundles(gridCommunityModules, gridEnterpriseModules) {
    console.log("Updating webpack config with modules...");
    updateWebpackSourceFiles(gridCommunityModules, gridEnterpriseModules);
}

function updateUtilsSystemJsMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules) {
    console.log("Updating SystemJS mapping with modules...");

    const utilityFilename = 'documentation/src/components/example-runner/SystemJs.jsx';
    const utilFileContents = fs.readFileSync(utilityFilename, 'UTF-8');

    let updatedUtilFileContents = updateBetweenStrings(utilFileContents,
        '            /* START OF GRID MODULES DEV - DO NOT DELETE */',
        '            /* END OF GRID MODULES DEV - DO NOT DELETE */',
        gridCommunityModules.concat(chartCommunityModules),
        gridEnterpriseModules,
        module => `            "${module.publishedName}": \`\${localPrefix}/${module.publishedName}\`,`,
        module => `            "${module.publishedName}": \`\${localPrefix}/${module.publishedName}\`,`);

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '        /* START OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */',
        '        /* END OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */',
        gridCommunityModules.filter(module => module.moduleDirName !== 'all-modules'),
        [],
        module => `        "${module.publishedName}": \`\${localPrefix}/${module.cjsFilename}\`,`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '        /* START OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */',
        '        /* END OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */',
        gridCommunityModules.filter(module => module.moduleDirName !== 'all-modules'),
        gridEnterpriseModules.filter(module => module.moduleDirName !== 'all-modules'),
        module => `        "${module.publishedName}": \`\${localPrefix}/${module.cjsFilename}\`,`,
        module => `        "${module.publishedName}": \`\${localPrefix}/${module.cjsFilename}\`,`);


    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '        /* START OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */',
        '        /* END OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */',
        gridCommunityModules.filter(module => module.moduleDirName !== 'all-modules'),
        [],
        module => `        "${module.publishedName}": \`https://unpkg.com/${module.minVersionedCjs}\`,`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '        /* START OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        '        /* END OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        gridCommunityModules.filter(module => module.moduleDirName !== 'all-modules'),
        gridEnterpriseModules.filter(module => module.moduleDirName !== 'all-modules'),
        module => `        "${module.publishedName}": \`https://unpkg.com/${module.minVersionedCjs}\`,`,
        module => `        "${module.publishedName}": \`https://unpkg.com/${module.minVersionedCjs}\`,`);

    fs.writeFileSync(utilityFilename, updatedUtilFileContents, 'UTF-8');
}

const getLernaChainBuildInfo = async (skipFrameworks) => {
    const lernaBuildChainInfo = await getFlattenedBuildChainInfo(false, true, true);

    const frameworks = ['angular', 'angular-legacy', 'react', 'vue', 'vue3'];

    const filterBuildChain = filter => {
        Object.keys(lernaBuildChainInfo).forEach(packageName => {
            lernaBuildChainInfo[packageName] = lernaBuildChainInfo[packageName].filter(filter);
        });
    };

    if (skipFrameworks) {
        // if we're skipping frameworks then only return "legacy" packages (ie ag-grid-community), or the charts package
        const excludeFrameworksFilter = dependent => dependent === 'ag-grid-community' || dependent === 'ag-grid-enterprise' || dependent === 'ag-charts-community';
        filterBuildChain(excludeFrameworksFilter);
    } else {
        // we filter out all "core" modules as they'll be dealt with by TSC itself
        // we also filter out ag-charts-community as it'll also be dealt with by TSC compilation
        // this will leave us with frameworks and "legacy" packages like ag-grid-community
        const includeFrameworksFilter = dependent => (
            (dependent.startsWith('@ag-') && frameworks.some(inclusion => dependent.includes(inclusion))) ||
            (dependent.startsWith('ag-') && dependent !== 'ag-charts-community')
        );
        filterBuildChain(includeFrameworksFilter);
    }

    return lernaBuildChainInfo;
};

const rebuildPackagesBasedOnChangeState = async (skipSelf = true, skipFrameworks = false) => {
    const lernaBuildChainInfo = await getLernaChainBuildInfo(skipFrameworks);
    const modulesState = readModulesState();

    const changedPackages = flattenArray(Object.keys(modulesState)
        .filter(key => modulesState[key].moduleChanged)
        .filter(changedPackage => {
            if (!lernaBuildChainInfo[changedPackage]) {
                console.log('****************************************************************');
                console.log(`${changedPackage} changed but not in build chain - skipping`);
                console.log('****************************************************************');
                return false;
            }
            return true;
        })
        .map(changedPackage => skipSelf && lernaBuildChainInfo[changedPackage][0] === changedPackage ? lernaBuildChainInfo[changedPackage].slice(1) : lernaBuildChainInfo[changedPackage]));


    if (modulesState["@ag-grid-community/core"].moduleChanged ||
        modulesState["@ag-grid-community/styles"].moduleChanged) {
        console.log("Core / Styles have changed - rebuilding CSS");
        await buildCss();
    }

    const lernaPackagesToRebuild = new Set();
    changedPackages.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);

    if (lernaPackagesToRebuild.size > 0) {
        console.log("Rebuilding changed packages...");
        // await buildPackages(Array.from(lernaPackagesToRebuild));
    } else {
        console.log("No non-core packages are out of date - skipping");
    }
};

const watchCoreModules = async (skipFrameworks) => {
    console.log("Watching TS files only...");
    const tsc = getTscPath();
    const tsWatch = cp.spawn(tsc, ["--build", "--preserveWatchOutput", '--watch'], {
        cwd: '../../',
        stdio: 'pipe',
        encoding: 'buffer'
    });

    tsWatch.stdout.on('data', await processStdio(async (output) => {
        console.log("Core Typescript: " + output);
        if (output.includes("Found 0 errors. Watching for file changes.")) {
            await rebuildPackagesBasedOnChangeState(false, skipFrameworks);

            // because we use TSC to build the core modules (and not npm) we need to manually update the changed
            // hashes on build
            updateCoreModuleHashes();
        }
    }));

    tsWatch.stderr.on('data', await processStdio(async (output) => {
        console.error("Core Typescript: " + output);
    }));

    process.on('exit', () => {
        tsWatch.kill();
    });
    process.on('SIGINT', () => {
        tsWatch.kill();
    });
};

const updateCoreModuleHashes = () => {
    const coreModuleRootNames = ['community-modules', 'enterprise-modules', 'charts-packages'];
    const exclusions = ['react', 'angular', 'angular-legacy', 'vue', 'vue3', 'polymer'];

    coreModuleRootNames.forEach(moduleRootName => {
        const moduleRootDirectory = `../../${moduleRootName}/`;
        const moduleRootSubDirNames = fs.readdirSync(moduleRootDirectory, {
            withFileTypes: true
        })
            .filter(d => d.isDirectory())
            .filter(d => !exclusions.includes(d.name))
            .map(d => `../../${moduleRootName}/${d.name}`);

        moduleRootSubDirNames.forEach(moduleRoot => updateModuleChangedHash(moduleRoot));
    });
};

const buildCoreModules = async (exitOnError) => {
    console.log("Building Core Modules...");
    const tsc = getTscPath();
    const result = cp.spawnSync(tsc, ['--build'], {
        stdio: 'inherit',
        cwd: '../../'
    });

    if (result && result.status !== 0) {
        console.log('ERROR Building Modules');

        if (exitOnError) {
            process.exit(result.status);
        }

        return;
    }
    console.log("Core Modules Built");

    console.log("Rebuilding Packages Based on Change State");
    await rebuildPackagesBasedOnChangeState(false, false);
    console.log("Changed Packages Rebuilt");

    // because we use TSC to build the core modules (and not npm) we need to manually update the changed
    // hashes on build
    console.log("Updating Core Module Hashes");
    updateCoreModuleHashes();
    console.log("Core Module Hashes Updated");
};

function moduleChanged(moduleRoot) {
    let changed = true;

    const resolvedPath = resolve(moduleRoot);

    const checkResult = cp.spawnSync('sh', ['../../scripts/hashChanged.sh', resolvedPath], {
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    if (checkResult && checkResult.status !== 1) {
        changed = checkResult.output[1].trim() === '1';
    }

    return changed;
}

function updateModuleChangedHash(moduleRoot) {
    const npm = 'npm';
    const resolvedPath = resolve(moduleRoot);

    cp.spawnSync(npm, ['run', 'hash'], {cwd: resolvedPath});
}

function updateSystemJsBoilerplateMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartsCommunityModules) {
    console.log("Updating framework SystemJS boilerplate config with modules...");

    const systemJsFiles = [
        './documentation/static/example-runner/grid-typescript-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-angular-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-react-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-vue-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-vue3-boilerplate/systemjs.config.dev.js'];

    const getModuleConfig = module => [
        `            '${module.publishedName}': {`,
        `                main: './dist/cjs/es5/main.js',`,
        `                defaultExtension: 'js'`,
        `            },`
    ].join(EOL);

    systemJsFiles.forEach(systemJsFile => {
        const fileLines = fs.readFileSync(systemJsFile, 'UTF-8');

        let updateFileLines = updateBetweenStrings(fileLines,
            '            /* START OF MODULES - DO NOT DELETE */',
            '            /* END OF MODULES - DO NOT DELETE */',
            gridCommunityModules.concat(chartsCommunityModules),
            gridEnterpriseModules,
            getModuleConfig,
            getModuleConfig,
        );

        fs.writeFileSync(systemJsFile, updateFileLines, 'UTF-8');
    });
}

const performInitialBuild = async () => {
    // if we encounter a build failure on startup we exit
    // prevents the need to have to CTRL+C several times for certain types of error
    await buildCoreModules(true);
};

const addWebpackMiddleware = (app) => {
    // for js examples that just require community functionality (landing pages, vanilla community examples etc)
    // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-community/all-modules/dist/ag-grid-community.js
    addWebpackMiddlewareForConfig(app, 'webpack.community-grid-all-umd.beta.config.js', '/dev/@ag-grid-community/all-modules/dist', 'ag-grid-community.js');

    // for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc)
    // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js
    addWebpackMiddlewareForConfig(app, 'webpack.enterprise-grid-all-umd.beta.config.js', '/dev/@ag-grid-enterprise/all-modules/dist', 'ag-grid-enterprise.js');

    // for js examples that just require charts community functionality (landing pages, vanilla charts examples etc)
    // webpack.charts-community-umd.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/ag-charts-community/dist/ag-charts-community.js
    addWebpackMiddlewareForConfig(app, 'webpack.charts-community-umd.config.js', '/dev/ag-charts-community/dist', 'ag-charts-community.js');
};

const watchCoreModulesAndCss = async (skipFrameworks) => {
    await watchCss();
    await watchCoreModules(skipFrameworks);
};

const watchFrameworkModules = async () => {
    console.log("Watching Framework Modules");

    const defaultIgnoreFolders = [
        '**/node_modules/**/*',
        '**/dist/**/*',
        '**/bundles/**/*',
        '**/lib/**/*',
        '.hash',
    ];

    const moduleFrameworks = ['angular', 'angular-legacy', 'vue', 'vue3', 'react'];
    const moduleRootDirectory = `../../community-modules/`;
    moduleFrameworks.forEach(moduleFramework => {
        const frameworkDirectory = resolve(`${moduleRootDirectory}${moduleFramework}`);

        const ignoredFolders = [...defaultIgnoreFolders];
        if (moduleFramework !== 'angular' && moduleFramework !== 'angular-legacy') {
            ignoredFolders.push('**/lib/**/*');
        }

        chokidar.watch([`${frameworkDirectory}/**/*`], {
            ignored: ignoredFolders,
            cwd: frameworkDirectory,
            persistent: true
        }).on('change', async (data) => {
            await rebuildPackagesBasedOnChangeState(false, false);
        });
    });
};

const serveModuleAndPackages = (app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules) => {
    serveCoreModules(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules);

    servePackage(app, '@ag-grid-community/angular');
    servePackage(app, '@ag-grid-community/angular-legacy');
    servePackage(app, '@ag-grid-community/vue');
    servePackage(app, '@ag-grid-community/vue3');
    servePackage(app, '@ag-grid-community/react');
    servePackage(app, 'ag-charts-react');
    servePackage(app, 'ag-charts-angular');
    servePackage(app, 'ag-charts-angular-legacy');
    servePackage(app, 'ag-charts-vue');
    servePackage(app, 'ag-charts-vue3');
    servePackage(app, 'ag-grid-community');
    servePackage(app, 'ag-grid-enterprise');
    servePackage(app, 'ag-grid-angular');
    servePackage(app, 'ag-grid-angular-legacy');
    servePackage(app, 'ag-grid-vue');
    servePackage(app, 'ag-grid-vue3');
    servePackage(app, 'ag-grid-react');
};

const readModulesState = () => {
    const moduleRootNames = ['grid-packages', 'community-modules', 'enterprise-modules', 'charts-packages'];
    const exclusions = ['ag-grid-dev', 'ag-grid-docs', 'ag-grid-documentation'];
    const modulesState = {};

    moduleRootNames.forEach(moduleRootName => {
        const moduleRootDirectory = `../../${moduleRootName}/`;

        fs.readdirSync(moduleRootDirectory, {withFileTypes: true})
            .filter(d => d.isDirectory())
            .filter(d => !exclusions.includes(d.name))
            .map(d => `../../${moduleRootName}/${d.name}`)
            .map(d => {
                const packageName = require(`${d}/package.json`).name;
                modulesState[packageName] = {moduleChanged: moduleChanged(d)};
            });
    });

    return modulesState;
};

module.exports = async (skipFrameworks, skipExampleFormatting, done) => {
    tcpPortUsed.check(EXPRESS_HTTPS_PORT)
        .then(async (inUse) => {
            if (inUse) {
                console.log(`Port ${EXPRESS_HTTPS_PORT} is already in use - please ensure previous instances of docs has shutdown/completed.`);
                console.log(`If you run using npm run docs-xxx and kill it the gulp process will continue until it's finished.`);
                console.log(`Wait a few seconds for a message that will let you know you can retry.`);
                console.log(`Alternatively you can try kill all node & gulp processes (ensure you're happy with what will be killed!:`);
                console.log(`ps -ef | grep 'node' | grep -v grep | awk '{print $2}' | xargs -r kill -9`);
                console.log(`ps -ef | grep 'gulp' | grep -v grep | awk '{print $2}' | xargs -r kill -9`);
                done();
                return;
            }

            process.on('SIGINT', () => {
                console.log("Docs process killed. Safe to restart.");
                process.exit(0);
            });

            // Formatting code when generating examples takes ages, so disable it for local development.
            if (skipExampleFormatting) {
                console.log("Skipping example formatting");
                process.env.AG_EXAMPLE_DISABLE_FORMATTING = 'true';
            }

            const {gridCommunityModules, gridEnterpriseModules, chartCommunityModules} = getAllModules();

            const app = express();

            // necessary for plunkers
            app.use(function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                return next();
            });

            updateWebpackConfigWithBundles(gridCommunityModules, gridEnterpriseModules);

            console.log("Performing Initial Build");
            await performInitialBuild();

            console.log("Watch Core Modules & CSS");
            await watchCoreModulesAndCss(skipFrameworks);

            if (!skipFrameworks) {
                console.log("Watch Framework Modules");
                watchFrameworkModules();
            }

            addWebpackMiddleware(app);
            symlinkModules(gridCommunityModules, gridEnterpriseModules, chartCommunityModules);

            updateUtilsSystemJsMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules);
            updateSystemJsBoilerplateMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules);

            serveModuleAndPackages(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules);

            // regenerate examples and then watch them
            console.log("Watch and Generate Examples");
            await watchAndGenerateExamples();
            console.log("Examples Generated");

            console.log("Watch Typescript examples...");
            await watchValidateExampleTypes();

            // todo - iterate everything under src and serve it
            // ...or use app.get('/' and handle it that way
            app.use(`/example-rich-grid`, express.static(`./src/example-rich-grid`));
            app.use(`/live-stream-updates`, express.static(`./src/live-stream-updates`));
            app.use(`/integrated-charting`, express.static(`./src/integrated-charting`));
            app.use(`/example.js`, express.static(`./src/example.js`));

            function createServer(name, serverCreation) {
                const server = serverCreation();

                const sockets = {};
                let nextSocketId = 0;
                server.on('connection', function (socket) {
                    // Add a newly connected socket
                    const socketId = nextSocketId++;
                    sockets[socketId] = socket;

                    // Remove the socket when it closes
                    socket.once('close', function () {
                        delete sockets[socketId];
                    });

                });

                const cleanup = () => {
                    // Close the server
                    server.close(() => console.log(`${name} Server closed!`));
                    // Destroy all open sockets
                    for (let socketId in sockets) {
                        sockets[socketId].destroy();
                    }
                }

                process.on('exit', cleanup);
                process.on('SIGINT', cleanup);

                return server;
            }

            // https server
            createServer('https', () => https.createServer(credentials, app).listen(EXPRESS_HTTPS_PORT));

            launchGatsby();

            done();
        });
};

// *** Don't remove these unused vars! ***
//     node dev-server.js generate-examples [src directory]
// eg: node dev-server.js generate-examples javascript-grid-accessing-data
const [cmd, script, execFunc, exampleDir, watch] = process.argv;

if (process.argv.length >= 3 && execFunc === 'generate-examples') {
    generateDocumentationExamples(exampleDir);
}
