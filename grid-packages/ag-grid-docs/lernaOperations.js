const cp = require('child_process');
const os = require('os');
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const execa = require("execa");
const chokidar = require("chokidar");

const WINDOWS = /^win/.test(os.platform());

const flattenArray = array => [].concat.apply([], array);

const buildDependencies = async (dependencies, command = 'build-css', arguments='') => {
    console.log("------------------------------------------------------------------------------------------");
    console.log(`Running ${command} on the following packages: ${dependencies.join(' ')}`);
    console.log("------------------------------------------------------------------------------------------");

    const scopedDependencies = dependencies.map(dependency => `--scope ${dependency}`).join(' ');
    const lernaArgs = `run ${command} ${scopedDependencies} ${arguments}`.trim().split(" ");
    return await execa("./node_modules/.bin/lerna", lernaArgs, {stdio: "inherit", cwd: '../../'});
};

const buildDependencyChain = async (packageName, buildChains, command = "build-css") => {
    const buildChain = buildChains[packageName];

    const buildBands = Object.values(buildChain);
    for (let index = 0; index < buildBands.length; index++) {
        await buildDependencies(buildBands[index], command)
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
        .on("unlink", path => buildOperation(path, 'removed'))
};

const filterAgGridOnly = dependencyTree => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree);
    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-")) : []
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
    'ag-grid-dev',
    'ag-grid-docs'
];

const excludePackage = packageName => !exclude.includes(packageName) && !packageName.includes("-example") && !packageName.includes("seans");

const filterExcludedRoots = dependencyTree => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree).filter(excludePackage);

    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-") || dependency.includes("ag-charts-community")) : []
    });

    return prunedDependencyTree;
};

const getOrderedDependencies = async packageName => {
    const lernaArgs = `ls --all --sort --toposort --json --scope ${packageName} --include-dependents`.split(" ");
    const {stdout} = await execa("./node_modules/.bin/lerna", lernaArgs, {cwd: '../../'});
    let dependenciesOrdered = JSON.parse(stdout);
    dependenciesOrdered = dependenciesOrdered.filter(dependency => excludePackage(dependency.name));

    const paths = dependenciesOrdered.map(dependency => dependency.location);
    const orderedPackageNames = dependenciesOrdered.map(dependency => dependency.name);

    return {
        paths,
        orderedPackageNames
    }
};

const generateBuildChain = async (packageName, allPackagesOrdered) => {
    let lernaArgs = `ls --all --toposort --graph --scope ${packageName} --include-dependents`.split(" ");
    let {stdout} = await execa("./node_modules/.bin/lerna", lernaArgs, {cwd: '../../'});
    let dependencyTree = JSON.parse(stdout);

    dependencyTree = filterAgGridOnly(dependencyTree);
    dependencyTree = filterExcludedRoots(dependencyTree);

    return buildBuildTree(packageName, dependencyTree, allPackagesOrdered);
};

const extractCssBuildChain = (buildChainInfo) => {
    return {
        paths: buildChainInfo.paths
            .filter(path => path.includes('community-modules/core'))
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
        const {paths: gridPaths, orderedPackageNames: orderedGridPackageNames} = await getOrderedDependencies("@ag-grid-community/core");
        const {paths: chartPaths, orderedPackageNames: orderedChartPackageNames} = await getOrderedDependencies("ag-charts-community");

        const buildChains = {};
        for (let packageName of orderedGridPackageNames.concat(orderedChartPackageNames)) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedGridPackageNames);
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

const getFlattenedBuildChainInfo = async () => {
    const buildChainInfo = await getBuildChainInfo();

    const flattenedBuildChainInfo = {};
    const packageNames = Object.keys(buildChainInfo.buildChains);
    packageNames.forEach(packageName => {
        flattenedBuildChainInfo[packageName] = flattenArray(Object.values(buildChainInfo.buildChains[packageName]));
    })
    return flattenedBuildChainInfo;
}

const buildCss = async () => {
    const buildChainInfo = await getBuildChainInfo();
    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    await buildDependencyChain("@ag-grid-community/core", cssBuildChain.buildChains);
};

const buildPackages = async (packageNames, command='build', arguments) => {
    return await buildDependencies(packageNames, command, arguments)
}

/* To be extracted/refactored */
const getAgBuildChain = async () => {
    const lernaBuildChainInfo = await getFlattenedBuildChainInfo();

    Object.keys(lernaBuildChainInfo).forEach(packageName => {
        lernaBuildChainInfo[packageName] = lernaBuildChainInfo[packageName]
            .filter(dependent => dependent.startsWith('@ag-') || dependent.startsWith('ag-'));
    })

    return lernaBuildChainInfo;
}


function moduleChanged(moduleRoot) {
    let changed = true;

    // Windows... convert c:\\xxx to /c/xxx - can only work in git bash
    const resolvedPath = path.resolve(moduleRoot).replace(/\\/g, '/').replace("C:", "/c");

    const checkResult = cp.spawnSync('sh', ['../../scripts/hashChanged.sh', resolvedPath], {
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    if (checkResult && checkResult.status !== 1) {
        changed = checkResult.output[1].trim() === '1';
    }
    return changed;
}

const readModulesState = () => {
    const moduleRootNames = ['grid-packages', 'community-modules', 'enterprise-modules', 'charts-packages', 'examples-grid'];
    const exclusions = ['ag-grid-dev', 'polymer', 'ag-grid-polymer', 'ag-grid-charts-example'];

    const modulesState = {};

    moduleRootNames.forEach(moduleRootName => {
        const moduleRootDirectory = WINDOWS ? `..\\..\\${moduleRootName}\\` : `../../${moduleRootName}/`;
        fs.readdirSync(moduleRootDirectory, {
            withFileTypes: true
        })
            .filter(d => d.isDirectory())
            .filter(d => !exclusions.includes(d.name))
            .map(d => WINDOWS ? `..\\..\\${moduleRootName}\\${d.name}` : `../../${moduleRootName}/${d.name}`)
            .map(d => {
                const packageName = require(WINDOWS ? `${d}\\package.json` : `${d}/package.json`).name;
                modulesState[packageName] = {moduleChanged: moduleChanged(d)}
            })
    });

    return modulesState;
}

let getLastBuild = function () {
    const lastBuild = fsExtra.readJsonSync('./.last.build.json', {throws: false});
    if(lastBuild) {
        return JSON.parse(lastBuild);
    }
    return null;
};

const rebuildPackagesBasedOnChangeState = async () => {
    const buildChain = await getAgBuildChain();
    const modulesState = readModulesState();

    const changedPackages = flattenArray(Object.keys(modulesState)
        .filter(key => modulesState[key].moduleChanged)
        .map(changedPackage => buildChain[changedPackage] ? buildChain[changedPackage] : changedPackage));

    const lernaPackagesToRebuild = new Set();
    changedPackages.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);

    const lastBuild = getLastBuild();
    if(lastBuild) {
        fs.unlinkSync('./.last.build.json');

        lastBuild.forEach(lernaPackagesToRebuild.add, lernaPackagesToRebuild);
    }

    if (lernaPackagesToRebuild.size > 0) {
        console.log("Rebuilding changed packages...");
        console.log(lernaPackagesToRebuild);

        const packagesToRun = Array.from(lernaPackagesToRebuild);
        // await buildPackages(packagesToRun)
        // await buildPackages(packagesToRun, 'package', '--parallel')
        let testsFailed = false;
        try {
            let result = await buildPackages(packagesToRun, 'test')
            testsFailed = result.exitCode !== 0 || result.failed === 1;

            result = await buildPackages(packagesToRun, 'test:e2e')
            testsFailed = result.exitCode !== 0 || result.failed === 1 || testsFailed;
        } catch (e) {
            testsFailed = true;
        }

        if(testsFailed) {
            fsExtra.writeJsonSync('./.last.build.json', `[${packagesToRun.map(packageName => `"${packageName}"`)}]`)
        }
    } else {
        console.log("No changed packages to process!");
    }
}
/* To be extracted/refactored */

exports.rebuildPackagesBasedOnChangeState = rebuildPackagesBasedOnChangeState;
exports.buildPackages = buildPackages;
exports.getFlattenedBuildChainInfo = getFlattenedBuildChainInfo;
exports.buildCss = buildCss;
exports.watchCss = watchCss;
