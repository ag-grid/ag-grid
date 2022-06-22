const cp = require('child_process');
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const execa = require("execa");
const chokidar = require("chokidar");

const flattenArray = array => [].concat.apply([], array);

const buildDependencies = async (dependencies, command = 'build-css', arguments = '') => {
    console.log("------------------------------------------------------------------------------------------");
    console.log(`Running ${command} on the following packages: ${dependencies.join(' ')}`);
    console.log("------------------------------------------------------------------------------------------");

    const scopedDependencies = dependencies.map(dependency => `--scope ${dependency}`).join(' ');
    const lernaArgs = `run ${command} ${scopedDependencies} ${arguments}`.trim().split(" ");
    try {
        return await execa("./node_modules/.bin/lerna", lernaArgs, {stdio: "inherit", cwd: '../../'});
    } catch(e) {
        console.log(`An error occurred while running lerna: ${e}`);
    }
};

const buildDependencyChain = async (packageName, buildChains, command = "build-css") => {
    const buildChain = buildChains[packageName];

    const buildBands = Object.values(buildChain);
    for (let index = 0; index < buildBands.length; index++) {
        await buildDependencies(buildBands[index], command);
    }
};

const spawnCssWatcher = ({paths, buildChains}) => {
    if (process.env.AG_NO_CSS) {
        console.log("Disabling CSS watching - manually launch sass-native-watch.sh instead");
        return;
    }

    console.log(`Watching the following css paths:\n-> ${paths.join('\n-> ')}`);

    // Initialize the watcher
    let watcher = chokidar.watch(paths, {
        ignored: [
            /(^|[\/\\])\../,        // ignore dotfiles
            /\*___jb_tmp___/       // ignore jetbrains IDE temp files
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true // Helps minimising thrashing of watch events
    });

    const buildOperation = (path, operation) => {
        console.log(`File ${path} has been ${operation}`);
        // noinspection JSIgnoredPromiseFromCall
        buildDependencyChain("@ag-grid-community/core", buildChains);
    };

    // Add event listeners
    return watcher
        .on("add", path => buildOperation(path, 'added'))
        .on("change", path => buildOperation(path, 'changed'))
        .on("unlink", path => buildOperation(path, 'removed'));
};

const filterAgGridOnly = dependencyTree => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree);
    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-")) : [];
    });
    return prunedDependencyTree;
};

const buildBuildTree = (startingPackage, dependencyTree, dependenciesOrdered) => {
    let index = 0;
    let buildChain = {
        [index++]: [startingPackage]
    };
    delete dependencyTree[startingPackage];

    dependenciesOrdered.forEach(dependency => {
        buildChain[index] = [];

        const remainingPackages = Object.keys(dependencyTree);
        remainingPackages.forEach(remainingPackage => {
            dependencyTree[remainingPackage] = dependencyTree[remainingPackage].filter(packageDependency => packageDependency !== dependency);

            if (dependencyTree[remainingPackage].length === 0) {
                buildChain[index].push(remainingPackage);
                delete dependencyTree[remainingPackage];
            }
        });

        if (buildChain[index].length !== 0) {
            index++;
        }
    });

    delete buildChain[index];

    return buildChain;
};

const exclude = [
    'ag-grid-dev'
];

const excludePackage = (packageName, includeExamples, skipPackageExamples) => {
    if (includeExamples) {
        if (packageName === 'ag-grid-docs' || packageName === 'ag-grid-documentation') {
            return false
        }
        if (skipPackageExamples && packageName.includes('-package-example')) {
            return false;
        }
    } else if (packageName === 'ag-grid-docs' || packageName === 'ag-grid-documentation') {
        return true;
    }

    return !exclude.includes(packageName) &&
        (!packageName.includes("-example") || (packageName.includes("-example") && includeExamples)) &&
        !packageName.includes("seans");
}

const filterExcludedRoots = (dependencyTree, includeExamples, skipPackageExamples) => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree).filter(packageName => excludePackage(packageName, includeExamples, skipPackageExamples));

    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-") || dependency.includes("ag-charts-community")) : [];
    });

    return prunedDependencyTree;
};

const getOrderedDependencies = async (packageName, includeExamples = false, skipPackageExamples = true) => {
    const lernaArgs = `ls --all --sort --toposort --json --scope ${packageName} --include-dependents`.split(" ");
    const {stdout} = await execa("./node_modules/.bin/lerna", lernaArgs, {cwd: '../../'});
    let dependenciesOrdered = JSON.parse(stdout);
    dependenciesOrdered = dependenciesOrdered.filter(dependency => excludePackage(dependency.name, includeExamples, skipPackageExamples));

    const paths = dependenciesOrdered.map(dependency => dependency.location);
    const orderedPackageNames = dependenciesOrdered.map(dependency => dependency.name);

    return {
        paths,
        orderedPackageNames
    };
};

const generateBuildChain = async (packageName, allPackagesOrdered, includeExamples = false, skipPackageExamples = true) => {
    let lernaArgs = `ls --all --toposort --graph --scope ${packageName} --include-dependents`.split(" ");
    let {stdout} = await execa("./node_modules/.bin/lerna", lernaArgs, {cwd: '../../'});
    let dependencyTree = JSON.parse(stdout);

    dependencyTree = filterAgGridOnly(dependencyTree);
    dependencyTree = filterExcludedRoots(dependencyTree, includeExamples, skipPackageExamples);

    return buildBuildTree(packageName, dependencyTree, allPackagesOrdered);
};

const extractCssBuildChain = (buildChainInfo) => {
    return {
        paths: buildChainInfo.paths
            .filter(path => path.includes('community-modules/core') || path.includes('community-modules\\core'))
            .map(path => `${path}/src/styles`),
        buildChains: {
            "@ag-grid-community/core": {
                "0": [
                    "@ag-grid-community/core"
                ],
                "1": [
                    "@ag-grid-community/all-modules"
                ],
                "2": [
                    "@ag-grid-enterprise/all-modules"
                ]
            }
        }
    };
};

const getCacheFilePath = () => {
    return path.resolve(__dirname, '../../.lernaBuildChain.cache.json');
};

const watchCss = () => {
    console.log("Watching css...");
    const cacheFilePath = getCacheFilePath();
    if (!fs.existsSync(cacheFilePath)) {
        const {paths, orderedPackageNames} = getOrderedDependencies("@ag-grid-community/core");

        const buildChains = {};
        for (let packageName of orderedPackageNames) {
            buildChains[packageName] = generateBuildChain(packageName, orderedPackageNames);
        }

        buildChainInfo = {
            paths,
            buildChains
        };

        fs.writeFileSync(cacheFilePath, JSON.stringify(buildChainInfo), 'UTF-8');
    } else {
        buildChainInfo = JSON.parse(fs.readFileSync(cacheFilePath, 'UTF-8'));
    }
    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    spawnCssWatcher(cssBuildChain);
};

const getBuildChainInfo = async () => {
    const cacheFilePath = getCacheFilePath();
    if (!fs.existsSync(cacheFilePath)) {
        const {
            paths: gridPaths,
            orderedPackageNames: orderedGridPackageNames
        } = await getOrderedDependencies("@ag-grid-community/core", true, false);
        const {paths: chartPaths, orderedPackageNames: orderedChartPackageNames} = await getOrderedDependencies("ag-charts-community", false, true);

        const buildChains = {};
        for (let packageName of orderedGridPackageNames.concat(orderedChartPackageNames)) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedGridPackageNames, true, false);
        }

        buildChainInfo = {
            paths: gridPaths.concat(chartPaths),
            buildChains
        };

        fs.writeFileSync(cacheFilePath, JSON.stringify(buildChainInfo), 'UTF-8');
    } else {
        buildChainInfo = JSON.parse(fs.readFileSync(cacheFilePath, 'UTF-8'));
    }
    return buildChainInfo;
};

const getFlattenedBuildChainInfo = async (includeExamples, skipPackageExamples, skipDocs) => {
    const buildChainInfo = await getBuildChainInfo(includeExamples, skipPackageExamples);

    const flattenedBuildChainInfo = {};
    const packageNames = Object.keys(buildChainInfo.buildChains);

    const filterExclusions = packageName => {
        if (skipDocs && (packageName === "ag-grid-docs" || packageName === "ag-grid-documentation")) {
            return false;
        }
        if (includeExamples) {
            if (skipPackageExamples && packageName.includes("-package-example")) {
                return false;
            }
        } else if (packageName.includes("-example")) {
            return false;
        }
        return true;
    };

    packageNames.filter(filterExclusions)
        .forEach(packageName => {
            flattenedBuildChainInfo[packageName] = flattenArray(
                Object.values(buildChainInfo.buildChains[packageName])
            ).filter(filterExclusions);
        });
    return flattenedBuildChainInfo;
};

const buildCss = async () => {
    const buildChainInfo = await getBuildChainInfo();
    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    await buildDependencyChain("@ag-grid-community/core", cssBuildChain.buildChains);
};

const buildPackages = async (packageNames, command = 'build', arguments) => {
    return await buildDependencies(packageNames, command, arguments);
};

const getAgBuildChain = async (includeExamples, skipPackageExamples, skipDocs) => {
    const lernaBuildChainInfo = await getFlattenedBuildChainInfo(includeExamples, skipPackageExamples, skipDocs);

    Object.keys(lernaBuildChainInfo).forEach(packageName => {
        // exclude any non ag dependencies
        lernaBuildChainInfo[packageName] = lernaBuildChainInfo[packageName]
            .filter(dependent => dependent.startsWith('@ag-') || dependent.startsWith('ag-'));
    });

    return lernaBuildChainInfo;
};


function moduleChanged(moduleRoot) {
    let changed = true;

    // Windows... convert c:\\xxx to /c/xxx - can only work in git bash
    const resolvedPath = path.resolve(moduleRoot).replace(/\\/g, '/').replace("C:", "/c");
    const checkResult = cp.spawnSync('../../scripts/hashChanged.sh', [resolvedPath], {
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    if (checkResult && checkResult.status !== 1) {
        changed = checkResult.output[1].trim() === '1';
    }

    return changed;
}

const readModulesState = (buildChain) => {
    const agPackages = Object.keys(buildChain);

    const moduleRootNames = ['grid-packages', 'community-modules', 'enterprise-modules', 'charts-packages', 'examples-grid', 'grid-packages/ag-grid-docs'];
    const exclusions = ['ag-grid-dev', 'prettier-no-op'];

    const modulesState = {};

    moduleRootNames.forEach(moduleRootName => {
        const moduleRootDirectory = `../../${moduleRootName}/`;
        fs.readdirSync(moduleRootDirectory, {
            withFileTypes: true
        })
            .filter(d => d.isDirectory())
            .filter(d => !exclusions.includes(d.name) && !d.name.startsWith(".") && !d.name.startsWith("_") && !d.name.includes("node_modules"))
            .map(d => `../../${moduleRootName}/${d.name}`)
            .map(d => {
                if (fs.existsSync(`${d}/package.json`)) {
                    const packageName = require(`${d}/package.json`).name;
                    if (agPackages.includes(packageName)) {
                        modulesState[packageName] = {moduleChanged: moduleChanged(d)};
                    }
                }
            });
    });

    return modulesState;
};

const getLastBuild = function () {
    const lastBuild = fsExtra.readJsonSync('./.last.build.json', {throws: false});
    if (lastBuild) {
        return JSON.parse(lastBuild);
    }
    return null;
};

const rebuildPackagesBasedOnChangeState = async (runUnitTests = true,
                                                 includeExamples = false,
                                                 skipPackageExamples = true,
                                                 runPackage = false,
                                                 runE2ETests = false,
                                                 cumulativeBuild = false,
                                                 skipDocs = false,
                                                 prodBuild = true) => {
    const buildChain = await getAgBuildChain(includeExamples, skipPackageExamples, skipDocs);
    const modulesState = readModulesState(buildChain);

    const changedPackages = flattenArray(Object.keys(modulesState)
        .filter(key => modulesState[key].moduleChanged)
        .map(changedPackage => buildChain[changedPackage] ? buildChain[changedPackage] : changedPackage));

    // remove duplicates
    const lernaPackagesToRebuild = new Set();
    changedPackages.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);

    if (cumulativeBuild) {
        console.log("Performing a cumulative build");
        let cumulativeBuilds = fsExtra.readJsonSync('./.cumulative.builds.json', {throws: false});
        if (cumulativeBuilds) {
            fs.unlinkSync('./.cumulative.builds.json');

            cumulativeBuilds = JSON.parse(cumulativeBuilds);
            cumulativeBuilds.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);
        } else {
            console.log("No cumulative build file found");
        }
    } else {
        const lastBuild = getLastBuild();
        if (lastBuild) {
            fs.unlinkSync('./.last.build.json');

            lastBuild.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);
        }
    }

    if (lernaPackagesToRebuild.size > 0) {
        console.log("Rebuilding changed packages...");
        console.log(lernaPackagesToRebuild);

        let buildFailed = false;
        const packagesToRun = Array.from(lernaPackagesToRebuild);
        try {
            console.log("Running 'build' on changed modules");
            let result = prodBuild ? await buildPackages(packagesToRun, "build-prod") : await buildPackages(packagesToRun);
            buildFailed = result.exitCode !== 0 || result.failed === 1;

            if (runPackage && !buildFailed) {

                // ag-grid-community & enterprise depend on community/all-modules and enterprise/all-modules so must be build AFTER these have run
                // everything else can be run in parallel so do a build in two phases
                const includesCommunity = packagesToRun.includes('ag-grid-community');
                const includesEnterprise = packagesToRun.includes('ag-grid-enterprise');

                const secondPhase = [];
                includesCommunity ? secondPhase.push(packagesToRun.splice(packagesToRun.indexOf('ag-grid-community'), 1)) : null;
                includesEnterprise ? secondPhase.push(packagesToRun.splice(packagesToRun.indexOf('ag-grid-enterprise'), 1)) : null;

                // if we're doing community or enterprise and package examples then we need to defer these too
                const filterPackages = [...packagesToRun];
                filterPackages.forEach(packageToRun => {
                    if (packageToRun.includes('-package-example') && (includesCommunity || includesEnterprise)) {
                        secondPhase.push(packagesToRun.splice(packagesToRun.indexOf(packageToRun), 1))
                    }
                })

                if (packagesToRun.length > 0) {
                    console.log("Running 'package' on changed modules in parallel");
                    result = await buildPackages(packagesToRun, 'package', '--parallel');
                    buildFailed = result.exitCode !== 0 || result.failed === 1 || buildFailed;
                }

                if (secondPhase.length > 0 && !buildFailed) {
                    console.log("Running second pass 'package' on changed modules in parallel");
                    result = await buildPackages(secondPhase, 'package', '--parallel');
                    buildFailed = result.exitCode !== 0 || result.failed === 1 || buildFailed;
                }
            }

            if (runUnitTests && !buildFailed) {
                console.log("Running 'test' on changed modules");
                result = await buildPackages(packagesToRun, 'test');
                buildFailed = result.exitCode !== 0 || result.failed === 1 || buildFailed;
            }

            if (runE2ETests && !buildFailed) {
                console.log("Running 'test:e2e' on changed modules");
                result = await buildPackages(packagesToRun, 'test:e2e');
                buildFailed = result.exitCode !== 0 || result.failed === 1 || buildFailed;
            }
        } catch (e) {
            buildFailed = true;
        }

        if (buildFailed) {
            if (cumulativeBuild) {
                fsExtra.writeJsonSync('./.cumulative.builds.json', `[${packagesToRun.map(packageName => `"${packageName}"`)}]`);
            } else {
                fsExtra.writeJsonSync('./.last.build.json', `[${packagesToRun.map(packageName => `"${packageName}"`)}]`);
            }
            process.exit(buildFailed ? 0 : 1);
        } else if (!cumulativeBuild) {
            let cumulativeBuilds = fsExtra.readJsonSync('./.cumulative.builds.json', {throws: false});
            if (cumulativeBuilds) {
                cumulativeBuilds = JSON.parse(cumulativeBuilds);
            } else {
                cumulativeBuilds = [];
            }
            cumulativeBuilds = Array.from(new Set(packagesToRun.concat(cumulativeBuilds)));
            fsExtra.writeJsonSync('./.cumulative.builds.json', `[${cumulativeBuilds.map(packageName => `"${packageName}"`)}]`);
        }
    } else {
        console.log("No changed packages to process!");
    }
};

// exports.rebuildPackagesBasedOnChangeState =     rebuildPackagesBasedOnChangeState;
// exports.rebuildBasedOnState =                   rebuildPackagesBasedOnChangeState.bind(null, false, false, false, false, false, true);
// exports.rebuildPackageBasedOnState =            rebuildPackagesBasedOnChangeState.bind(null, false, false, true,  false, false, true);

//                                                                  runUnitTests, includeExamples, skipPackageExamples, runPackage, runE2ETests, cumulativeBuild, skipDocs

// build (including examples & docs) and unit tests only - CI Build
exports.rebuildAndUnitTestBasedOnState = rebuildPackagesBasedOnChangeState.bind(null, true, true, true, false, false, false, false);

// build, package and retest everything - Hourly CI Build
exports.rebuildAndTestsEverythingBasedOnState = rebuildPackagesBasedOnChangeState.bind(null, true, true, false, true, true, true, false);

// build & package everything, excluding examples & docs  - CI Archive Deployments
exports.rebuildPackageSkipDocsBasedOnState = rebuildPackagesBasedOnChangeState.bind(null, false, false, true, true, false, false, true);

// used in doc builds - dev-server.js
exports.buildPackages = buildPackages;
exports.getFlattenedBuildChainInfo = getFlattenedBuildChainInfo;
exports.buildCss = buildCss;
exports.watchCss = watchCss;
