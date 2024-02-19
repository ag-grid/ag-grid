const os = require('os');
const fs = require('fs-extra');
const cp = require('child_process');
const resolve = require('path').resolve;
const https = require('https');
const express = require('express');
const realWebpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const chokidar = require('chokidar');
const tcpPortUsed = require('tcp-port-used');
const {generateDocumentationExamples} = require('./example-generator-documentation');
const {updateBetweenStrings, getAllModules, processStdio} = require('./utils');
const {watchValidateExampleTypes} = require('./example-validator');
const {EOL} = os;

const key = fs.readFileSync(process.env.AG_DOCS_KEY || './selfsigned.key', 'utf8');
const cert = fs.readFileSync(process.env.AG_DOCS_CRT || './selfsigned.crt', 'utf8');
const credentials = {
    key: key,
    cert: cert
};

const lnk = require('lnk').sync;

const EXPRESS_HTTPS_PORT = 8080;

function debounce(cb, timeout = 500) {
    return debounceByPath(cb, 0, 0, timeout);
}

/** Correct depth to pickup docs section. */
const DEFAULT_GROUP_DEPTH = 3;
/** Correct depth to pickup specific example directory. */
const DEFAULT_PATH_DEPTH = 5;

function debounceByPath(cb, groupDepth = DEFAULT_GROUP_DEPTH, pathDepth = DEFAULT_PATH_DEPTH, timeout = 500) {
    let timeouts = {};

    const pathFn = (path, depth) => {
        const pathParts = path.split('/');
        let key = pathParts.slice(0, depth).join('/');
        if (pathParts.length > depth) {
            key += '/';
        }

        return key;
    };

    const groupFn = (path) => pathFn(path, groupDepth);
    const keyFn = (path) => pathFn(path, pathDepth);

    return (file) => {
        const group = groupFn(file);
        const key = keyFn(file);

        if (timeouts[group]?.timeoutRef) {
            clearTimeout(timeouts[group].timeoutRef);
        }

        const timeoutRef = setTimeout(() => {
            const paths = [];
            const keys = Object.keys(timeouts[group].keys);
            if (keys.length < 5) {
                // If only a few example changed, use the more specific path(s).
                paths.push(...keys);
            } else {
                // More than a few examples changed, trigger rebuild for all examples in a section.
                paths.push(group);
            }

            delete timeouts[group];
            for (const path of paths) {
                cb(path);
            }
        }, timeout);

        timeouts[group] ??= {keys: {}};
        timeouts[group].timeoutRef = timeoutRef;
        timeouts[group].keys[key] = true;
    };
}

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

function serveCoreModules(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules) {
    console.log("Serving modules");
    gridCommunityModules.concat(gridEnterpriseModules).concat(chartCommunityModules).concat(chartEnterpriseModules).forEach(module => {
        console.log(`Serving modules ${module.publishedName} from ./_dev/${module.publishedName} - available at /dev/${module.publishedName}`);
        app.use(`/dev/${module.publishedName}`, express.static(`./_dev/${module.publishedName}`));
    });

    console.log(`Serving modules @ag-grid-community/styles from /_dev/@ag-grid-community/styles - available at /dev/@ag-grid-community/styles`);
    app.use(`/dev/@ag-grid-community/styles`, express.static(`./_dev/@ag-grid-community/styles`));

}

function getTscPath() {
    return 'node_modules/.bin/tsc';
}

function symlinkModules(gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules) {
    // we delete the _dev folder each time we run now as we're constantly adding new modules etc
    // this saves us having to manually delete _dev each time
    if (fs.existsSync('_dev')) {
        fs.removeSync('_dev');
    }

    fs.ensureDirSync('_dev/');
    fs.ensureDirSync('_dev/@ag-grid-community/');
    fs.ensureDirSync('_dev/@ag-grid-enterprise/');

    let linkType = 'symbolic';

    lnk('../../grid-community-modules/vue/', '_dev/@ag-grid-community', {force: true, type: linkType, rename: 'vue'});
    lnk('../../grid-community-modules/vue3/', '_dev/@ag-grid-community', {force: true, type: linkType, rename: 'vue3'});
    lnk('../../grid-community-modules/angular/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'angular'
    });
    lnk('../../grid-community-modules/react/', '_dev/@ag-grid-community', {
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

    lnk('../../grid-community-modules/styles/', '_dev/@ag-grid-community', {
        force: true,
        type: linkType,
        rename: 'styles'
    });


    lnk('./node_modules/ag-charts-community/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-community'
    });
    lnk('./node_modules/ag-charts-enterprise/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-enterprise'
    });
    lnk('./node_modules/ag-charts-react/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-react'
    });
    lnk('./node_modules/ag-charts-angular/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-angular'
    });
    lnk('./node_modules/ag-charts-vue/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-charts-vue'
    });
    lnk('./node_modules/ag-charts-vue3/', '_dev/', {
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
    lnk('../../grid-packages/ag-grid-charts-enterprise/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-charts-enterprise'
    });
    lnk('../../grid-packages/ag-grid-angular/', '_dev/', {
        force: true,
        type: linkType,
        rename: 'ag-grid-angular'
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
    await generateDocumentationExamples();

    const npm = 'npm';
    cp.spawnSync(npm, ['run', 'hash']);

    chokidar
        .watch([`./documentation/doc-pages/**/examples/**/*.{html,css,js,jsx,ts}`], {ignored: ['**/_gen/**/*']})
        .on('change', debounceByPath((path) => regenerateDocumentationExamplesForFileChange(path)));

    chokidar
        .watch([`./documentation/doc-pages/**/*.md`], {ignoreInitial: true})
        .on('add', debounceByPath((path) => regenerateDocumentationExamplesForFileChange(path)));
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
        .filter(module => !module.moduleDirName.includes('charts'))
        .map(module => `const ${module.moduleName} = require("../../../${module.fullJsPath.replace('.ts', '')}").${module.moduleName};`);

    const enterpriseRegisterModuleLines = gridEnterpriseModules
        .filter(module => module.moduleDirName !== 'core')
        .filter(module => module.moduleDirName !== 'all-modules')
        .filter(module => !module.moduleDirName.includes('charts'))
        .map(module => `ModuleRegistry.register(${module.moduleName});`);
    const moduleIsUmdLine = `ModuleRegistry.__setIsBundled();`

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

    const newEnterpriseBundleContent = newEnterpriseBundleLines
        .concat(enterpriseModulesEntries)
        .concat('const GridChartsModule = require("../../../../../grid-enterprise-modules/charts/dist/cjs/es5/gridChartsModule").GridChartsModule;')
        .concat(communityModulesEntries);
    fs.writeFileSync(enterpriseBundleFilename, newEnterpriseBundleContent
        .concat(enterpriseRegisterModuleLines)
        .concat('ModuleRegistry.register(GridChartsModule);')
        .concat(communityRegisterModuleLines)
        .concat(moduleIsUmdLine)
        .join(EOL), 'UTF-8');

    const newGridChartsEnterpriseBundleContent = newEnterpriseBundleLines
        .concat(enterpriseModulesEntries)
        .concat('const GridChartsModule = require("../../../../../grid-enterprise-modules/charts-enterprise/dist/cjs/es5/gridChartsModule").GridChartsModule;')
        .concat(communityModulesEntries);

    fs.writeFileSync('./src/_assets/ts/enterprise-grid-charts-all-modules-umd-beta.js', newGridChartsEnterpriseBundleContent
        .concat(enterpriseRegisterModuleLines)
        .concat('ModuleRegistry.register(GridChartsModule);')
        .concat(communityRegisterModuleLines)
        .concat(moduleIsUmdLine)
        .join(EOL), 'UTF-8');

    const existingCommunityLines = fs.readFileSync(communityFilename).toString().split(EOL);
    modulesLineFound = false;
    const newCommunityLines = [];
    existingCommunityLines.forEach(line => {
        if (!modulesLineFound) {
            modulesLineFound = line.indexOf("/* MODULES - Don't delete this line */") !== -1;
            newCommunityLines.push(line);
        }
    });
    fs.writeFileSync(communityFilename, newCommunityLines.concat(communityModulesEntries).concat(communityRegisterModuleLines).concat(moduleIsUmdLine).join(EOL), 'UTF-8');
};

function updateWebpackConfigWithBundles(gridCommunityModules, gridEnterpriseModules) {
    console.log("Updating webpack config with modules...");
    updateWebpackSourceFiles(gridCommunityModules, gridEnterpriseModules);
}

function updateUtilsSystemJsMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules) {
    console.log("Updating SystemJS mapping with modules...");

    const utilityFilename = 'documentation/src/components/example-runner/SystemJs.jsx';
    const utilFileContents = fs.readFileSync(utilityFilename, 'UTF-8');

    let updatedUtilFileContents = updateBetweenStrings(utilFileContents,
        '            /* START OF GRID MODULES DEV - DO NOT DELETE */',
        '            /* END OF GRID MODULES DEV - DO NOT DELETE */',
        gridCommunityModules.concat(chartCommunityModules),
        gridEnterpriseModules.concat(chartEnterpriseModules),
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
        module => `        "${module.publishedName}": \`https://cdn.jsdelivr.net/npm/${module.minVersionedCjs}\`,`,
        () => {
        });

    updatedUtilFileContents = updateBetweenStrings(updatedUtilFileContents,
        '        /* START OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        '        /* END OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */',
        gridCommunityModules.filter(module => module.moduleDirName !== 'all-modules'),
        gridEnterpriseModules.filter(module => module.moduleDirName !== 'all-modules'),
        module => `        "${module.publishedName}": \`https://cdn.jsdelivr.net/npm/${module.minVersionedCjs}\`,`,
        module => `        "${module.publishedName}": \`https://cdn.jsdelivr.net/npm/${module.minVersionedCjs}\`,`);

    fs.writeFileSync(utilityFilename, updatedUtilFileContents, 'UTF-8');
}

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
            if (!skipFrameworks) {
                cp.spawnSync('npx', ['nx', 'run-many', "--target=build-docs", (process.env.AG_SERVE_FRAMEWORK ? `--projects=@ag-grid-community/${process.env.AG_SERVE_FRAMEWORK}` : '')], {
                    cwd: '../../',
                    stdio: 'inherit',
                    encoding: 'buffer'
                });
            }
            console.log("************************************************************");
            console.log("*********************** Docs Updated ***********************");
            console.log("************************************************************");
        }
    }));

    // the modules default to esm so the typings do too - we run this to keep them in sync
    const tsEsmWatch = cp.spawn(tsc, ["--build", "--preserveWatchOutput", '--watch', "tsconfig-esm.json"], {
        cwd: '../../',
        stdio: 'inherit',
        encoding: 'buffer'
    });

    process.on('exit', () => {
        tsWatch.kill();
        tsEsmWatch.kill();
    });
    process.on('SIGINT', () => {
        tsWatch.kill();
        tsEsmWatch.kill();
    });
};

const buildCoreModules = async (exitOnError, skipFrameworks) => {
    console.log("Building Core Modules...");
    const tsc = getTscPath();
    let result = cp.spawnSync(tsc, ['--build'], {
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

    // the modules default to esm so the typings do too - we run this to keep them in sync
    cp.spawnSync(tsc, ["--build", "tsconfig-esm.json", ], {
        cwd: '../../',
        stdio: 'pipe',
        encoding: 'buffer'
    });


    // temp addition for AG-7340
    // future commits will make this more generic/flexible
    cp.spawnSync('./node_modules/.bin/tsc', ['-p', 'tsconfig.typings.json'], {
        stdio: 'inherit',
        cwd: '../../grid-community-modules/csv-export'
    });
    cp.spawnSync('./node_modules/.bin/tsc', ['-p', 'tsconfig.typings.json'], {
        stdio: 'inherit',
        cwd: '../../grid-enterprise-modules/set-filter'
    });
    cp.spawnSync('./node_modules/.bin/tsc', ['-p', 'tsconfig.typings.json'], {
        stdio: 'inherit',
        cwd: '../../grid-enterprise-modules/excel-export'
    });
    console.log("Core Modules Built");

    if (!skipFrameworks) {
        result = cp.spawnSync('npx', ['nx', 'run-many', "--target=build-docs", (process.env.AG_SERVE_FRAMEWORK ? `--projects=@ag-grid-community/${process.env.AG_SERVE_FRAMEWORK}` : '')], {
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
        result = cp.spawnSync('npx', ['nx', 'run-many', "--target=build-docs-initial", (process.env.AG_SERVE_FRAMEWORK ? `--projects=@ag-grid-community/${process.env.AG_SERVE_FRAMEWORK}` : '')], {
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

        console.log("Changed Packages Rebuilt");
    }
};

function updateSystemJsBoilerplateMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartsCommunityModules, chartEnterpriseModules) {
    console.log("Updating framework SystemJS boilerplate config with modules...");

    const systemJsFiles = [
        './documentation/static/example-runner/grid-typescript-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-angular-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-react-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-react-ts-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-vue-boilerplate/systemjs.config.dev.js',
        './documentation/static/example-runner/grid-vue3-boilerplate/systemjs.config.dev.js'
    ];

    const getModuleConfig = module => [
        `            '${module.publishedName}': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'${module.publishedName === 'ag-charts-community' ? ",\n                format: 'cjs'" : ""}
            },`].join(EOL);

    systemJsFiles.forEach(systemJsFile => {
        const fileLines = fs.readFileSync(systemJsFile, 'UTF-8');

        let updateFileLines = updateBetweenStrings(fileLines,
            '            /* START OF MODULES - DO NOT DELETE */',
            '            /* END OF MODULES - DO NOT DELETE */',
            gridCommunityModules.concat(chartsCommunityModules),
            gridEnterpriseModules.concat(chartEnterpriseModules),
            getModuleConfig,
            getModuleConfig,
        );

        fs.writeFileSync(systemJsFile, updateFileLines, 'UTF-8');
    });
}

const performInitialBuild = async (skipFrameworks) => {
    // if we encounter a build failure on startup we exit
    // prevents the need to have to CTRL+C several times for certain types of error
    await buildCoreModules(true, skipFrameworks);
};

const addWebpackMiddleware = (app) => {
    console.log("Adding webpack middleware");
    // for js examples that just require community functionality (landing pages, vanilla community examples etc (not main demo))
    // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-community/all-modules/dist/ag-grid-community.js
    addWebpackMiddlewareForConfig(app, 'webpack.community-grid-all-umd.beta.config.js', '/dev/@ag-grid-community/all-modules/dist', 'ag-grid-community.js');

    // for js examples that just require enterprise functionality (landing pages, vanilla enterprise examples etc (not main demo))
    // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js
    addWebpackMiddlewareForConfig(app, 'webpack.enterprise-grid-all-umd.beta.config.js', '/dev/@ag-grid-enterprise/all-modules/dist', 'ag-grid-enterprise.js');

    // for js examples that just require grid & charts enterprise functionality (vanilla integrated charts examples etc (not main demo))
    // webpack.community-grid-all.config.js -> AG_GRID_SCRIPT_PATH -> //localhost:8080/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js
    addWebpackMiddlewareForConfig(app, 'webpack.grid-charts-enterprise-grid-all-umd.beta.config.js', '/dev/@ag-grid-enterprise/all-modules/dist', 'ag-grid-charts-enterprise.js');
};

const watchCoreModulesAndCss = async (skipFrameworks) => {
    const buildCss = () => {
        const result = cp.spawnSync('npx', ['nx', 'run-many', "--target=build-css"], {
            cwd: '../../',
            stdio: 'inherit',
            encoding: 'buffer'
        });

        if (result && result.status === 0) {
            console.log("**********************************************");
            console.log("**************** CSS Updated *****************");
            console.log("**********************************************");
        }
    }

    chokidar.watch(resolve("../../grid-community-modules/styles"), {
        ignored: [
            /(^|[\/\\])\../,        // ignore dotfiles
            /\*___jb_tmp___/       // ignore jetbrains IDE temp files
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true // Helps minimising thrashing of watch events
    }).on("add", path => buildCss(path, 'added'))
        .on("change", path => buildCss(path, 'changed'))
        .on("unlink", path => buildCss(path, 'removed'))


    await watchCoreModules(skipFrameworks);
};

const watchFrameworkModules = async () => {
    console.log("Watching Framework Modules");

    const defaultIgnoreFolders = [
        '**/node_modules/**/*',
        '**/dist/**/*',
        '**/bundles/**/*',
        '.hash',
        '.AUTO.json',
    ];

    const moduleFrameworks = process.env.AG_SERVE_FRAMEWORK ? [process.env.AG_SERVE_FRAMEWORK] : ['angular', 'vue', 'vue3', 'react'];
    const moduleRootDirectory = `../../grid-community-modules/`;
    moduleFrameworks.forEach(moduleFramework => {
        const frameworkDirectory = resolve(`${moduleRootDirectory}${moduleFramework}`);

        const ignoredFolders = [...defaultIgnoreFolders];
        if (moduleFramework !== 'angular') {
            ignoredFolders.push('**/lib/**/*');
        }

        chokidar.watch([`${frameworkDirectory}/**/*`], {
            ignored: ignoredFolders,
            cwd: frameworkDirectory,
            persistent: true
        }).on('change', debounce(() => {
            const result = cp.spawnSync('npx', ['nx', 'run-many', "--target=build-docs", (process.env.AG_SERVE_FRAMEWORK ? `--projects=@ag-grid-community/${process.env.AG_SERVE_FRAMEWORK}` : '')], {
                stdio: 'inherit',
                cwd: '../../'
            });

            if (result && result.status !== 0) {
                 console.error('********* ERROR Building Frameworks');
            } else {
                console.log("************************************************************");
                console.log("******************** Frameworks Updated ********************");
                console.log("************************************************************");
            }
        }));
    });
};

const watchAutoDocFiles = async () => {
    const defaultIgnoreFolders = [
        '**/node_modules/**/*',
        '**/dist/**/*',
        '**/bundles/**/*',
        '**/lib/**/*',
        '.hash',
        '.AUTO.json',
    ];

    // Matches the paths used in grid-community-modules/all-modules/generate-code-reference-files.js
    const INTERFACE_GLOBS = [
        '../../grid-community-modules/core/src/ts/**/*.ts',
        '../../grid-enterprise-modules/set-filter/src/**/*.ts',
        '../../grid-enterprise-modules/filter-tool-panel/src/**/*.ts',
        '../../grid-enterprise-modules/multi-filter/src/**/*.ts',
        '../../grid-community-modules/angular/projects/ag-grid-angular/src/lib/**/*.ts',
        '../../grid-community-modules/react/src/shared/**/*.ts'
    ];

    const ignoredFolders = [...defaultIgnoreFolders];

    chokidar.watch(INTERFACE_GLOBS, {
        ignored: ignoredFolders,
        persistent: true
    }).on('change', debounce(() => {
        cp.spawn('npx', ['nx', 'run-many', "--target=generate-doc-files"], {
            cwd: '../../',
            stdio: 'inherit',
            encoding: 'buffer'
        });
    }));
};

const serveModuleAndPackages = (app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules) => {
    serveCoreModules(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules);

    servePackage(app, '@ag-grid-community/angular');
    servePackage(app, '@ag-grid-community/vue');
    servePackage(app, '@ag-grid-community/vue3');
    servePackage(app, '@ag-grid-community/react');
    servePackage(app, 'ag-charts-community');
    servePackage(app, 'ag-charts-enterprise');
    servePackage(app, 'ag-charts-react');
    servePackage(app, 'ag-charts-angular');
    servePackage(app, 'ag-charts-vue');
    servePackage(app, 'ag-charts-vue3');
    servePackage(app, 'ag-grid-community');
    servePackage(app, 'ag-grid-enterprise');
    servePackage(app, 'ag-grid-charts-enterprise');
    servePackage(app, 'ag-grid-angular');
    servePackage(app, 'ag-grid-vue');
    servePackage(app, 'ag-grid-vue3');
    servePackage(app, 'ag-grid-react');
};

module.exports = async (skipFrameworks, skipExampleFormatting, skipExampleGeneration, skipAutoDocGeneration, done) => {
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

            console.log("Config", {
                skipFrameworks,
                skipExampleFormatting,
                skipExampleGeneration,
                skipAutoDocGeneration,
                AG_SERVE_FRAMEWORK: process.env.AG_SERVE_FRAMEWORK,
                AG_FW_EXAMPLES_TO_GENERATE: process.env.AG_FW_EXAMPLES_TO_GENERATE,
                AG_SKIP_PACKAGE_EXAMPLES: process.env.AG_SKIP_PACKAGE_EXAMPLES
            });

            // Formatting code when generating examples takes ages, so disable it for local development.
            if (skipExampleFormatting) {
                console.log("Skipping example formatting");
                process.env.AG_EXAMPLE_DISABLE_FORMATTING = 'true';
            }

            const {
                gridCommunityModules,
                gridEnterpriseModules,
                chartCommunityModules,
                chartEnterpriseModules
            } = getAllModules();

            const app = express();

            const updateCorsHeaders = (req, res) => {
                // necessary for plunkers and localhost
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                res.setHeader('Access-Control-Allow-Private-Network', 'true');
            }

            app.options("/*", function (req, res, next) {
                updateCorsHeaders(req, res);
                res.sendStatus(200);
            });
            app.use(function (req, res, next) {
                updateCorsHeaders(req, res);
                return next();
            });

            updateWebpackConfigWithBundles(gridCommunityModules, gridEnterpriseModules);

            console.log("Performing Initial Build");
            await performInitialBuild(skipFrameworks);

            console.log("Watch Core Modules & CSS");
            await watchCoreModulesAndCss(skipFrameworks);

            if (!skipAutoDocGeneration) {
                console.log("Watching Auto Doc Files");
                await watchAutoDocFiles();
            }

            if (!skipFrameworks) {
                console.log("Watch Framework Modules");
                await watchFrameworkModules();
            }

            addWebpackMiddleware(app);
            symlinkModules(gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules);

            updateUtilsSystemJsMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules);
            updateSystemJsBoilerplateMappingsForFrameworks(gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules);

            serveModuleAndPackages(app, gridCommunityModules, gridEnterpriseModules, chartCommunityModules, chartEnterpriseModules);

            if (skipExampleGeneration) {
                console.log("Skipping Example Generation");
            } else {
                console.time("Generating examples");

                // regenerate examples and then watch them
                console.log("Watch and Generate Examples");
                await watchAndGenerateExamples();
                console.log("Examples Generated");

                console.log("Watch Typescript examples...");
                await watchValidateExampleTypes();

                console.timeEnd("Generating examples");
            }

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
//     node new-dev-server.js generate-examples [src directory]
// eg: node new-dev-server.js generate-examples javascript-grid-accessing-data
const [cmd, script, execFunc, exampleDir, watch] = process.argv;

if (process.argv.length >= 3 && execFunc === 'generate-examples') {
    generateDocumentationExamples(exampleDir);
}
