const path = require("path");
const fs = require("fs");
const execa = require("execa");
const chokidar = require("chokidar");

const flattenArray = array => [].concat.apply([], array);

const buildDependencies = async (dependencies, command = 'build-css') => {
    console.log("------------------------------------------------------------------------------------------");
    console.log(`Building ${dependencies.join(' ')}`);
    console.log("------------------------------------------------------------------------------------------");

    const scopedDependencies = dependencies.map(dependency => `--scope ${dependency}`).join(' ');
    const lernaArgs = `run ${command} ${scopedDependencies}`.split(" ");
    await execa("./node_modules/.bin/lerna", lernaArgs, {stdio: "inherit", cwd: '../../'});
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

const buildPackages = async (packageNames) => {
    await buildDependencies(packageNames, 'build')
}

exports.buildPackages = buildPackages;
exports.getFlattenedBuildChainInfo = getFlattenedBuildChainInfo;
exports.buildCss = buildCss;
exports.watchCss = watchCss;
