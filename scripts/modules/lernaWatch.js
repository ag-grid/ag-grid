const path = require("path");
const cp = require('child_process');
const os = require('os');
const fs = require("fs");
const commandLineOptions = require("commander");
const execa = require("execa");
const chokidar = require("chokidar");

commandLineOptions
    .option(
        "-w, --watch",
    )
    .option(
        "-s, --single",
    )
    .option(
        "-b, --build"
    )
    .option(
        "--buildBeta"
    )
    .option(
        "--watchBeta"
    )
    .parse(process.argv);

const manifest = (dir = undefined) =>
    JSON.parse(
        fs.readFileSync(`${dir ? dir : process.cwd()}/package.json`, {
            encoding: "utf8"
        })
    );

const buildDependencies = async (dependencies, command = 'build-cjs') => {
    console.log("------------------------------------------------------------------------------------------");
    console.log(`Building ${dependencies.map(dependency => `--scope ${dependency}`).join(' ')}`);
    console.log("------------------------------------------------------------------------------------------");

    const scopedDependencies = dependencies.map(dependency => `--scope ${dependency}`).join(' ');
    const lernaArgs = `run ${command} ${scopedDependencies}`.split(" ");
    await execa("./node_modules/.bin/lerna", lernaArgs, { stdio: "inherit" });
};

const findParentPackageManifest = changedFile => {
    const startingPath = path.dirname(changedFile);

    const up = node => {
        let file = path.join(node, "package.json");

        if (fs.existsSync(file)) {
            return path.dirname(file);
        }

        file = path.resolve(node, "..");

        return up(file);
    };

    return up(startingPath);
};

const buildDependencyChain = async (packageName, buildChains, singleModule = false, command = "build-cjs") => {
    const buildChain = buildChains[packageName];

    if (singleModule) {
        await buildDependencies(buildChain["0"], command);
    } else {
        const buildBands = Object.values(buildChain);
        for (let index = 0; index < buildBands.length; index++) {
            await buildDependencies(buildBands[index], command);
        }
    }
};

const spawnWatcher = async ({ paths, buildChains }, singleModule) => {
    console.log(`Watching the following paths:\n-> ${paths.join('\n-> ')}`);

    // Initialize the watcher
    let watcher = chokidar.watch(paths, {
        ignored: [
            /(^|[\/\\])\../,        // ignore dotfiles
            /node_modules/,         // ignore node_modules
            /lib|dist/,             // ignore build output files
            /\*___jb_tmp___/,       // ignore jetbrains IDE temp files
            /styles/,              // ignore scss/css files - these are handled separately
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true // Helps minimising thrashing of watch events
    });

    const packageName = changeFile => manifest(findParentPackageManifest(changeFile)).name;

    // Add event listeners
    return watcher
        .on("add", path => {
            console.log(`File ${path} has been added`);
            buildDependencyChain(packageName(path), buildChains, singleModule);
        })
        .on("change", path => {
            console.log(`File ${path} has been changed`);
            buildDependencyChain(packageName(path), buildChains, singleModule);
        })
        .on("unlink", path => {
            console.log(`File ${path} has been removed`);
            buildDependencyChain(packageName(path), buildChains, singleModule);
        });
};

const spawnCssWatcher = async ({ paths, buildChains }) => {
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

    // Add event listeners
    return watcher
        .on("add", path => {
            console.log(`File ${path} has been added`);
            buildDependencyChain("@ag-grid-community/core", buildChains, false, 'build-css');
        })
        .on("change", path => {
            console.log(`File ${path} has been changed`);
            buildDependencyChain("@ag-grid-community/core", buildChains, false, 'build-css');
        })
        .on("unlink", path => {
            console.log(`File ${path} has been removed`);
            buildDependencyChain("@ag-grid-community/core", buildChains, false, 'build-css');
        });
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
    'ag-grid-dev',
    'ag-grid-docs',
    'ag-grid-documentation',
    'ag-grid-community',
    'ag-grid-enterprise'
];

const excludePackage = packageName => !exclude.includes(packageName) && !packageName.includes("-example");

const filterExcludedRoots = dependencyTree => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree).filter(excludePackage);

    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-")) : [];
    });

    return prunedDependencyTree;
};

const getOrderedDependencies = async packageName => {
    const lernaArgs = `ls --all --sort --toposort --json --scope ${packageName} --include-dependents`.split(" ");
    const { stdout } = await execa("./node_modules/.bin/lerna", lernaArgs);
    let dependenciesOrdered = JSON.parse(stdout);
    dependenciesOrdered = dependenciesOrdered.filter(dependency => excludePackage(dependency.name));

    const paths = dependenciesOrdered.map(dependency => dependency.location);
    const orderedPackageNames = dependenciesOrdered.map(dependency => dependency.name);

    return {
        paths,
        orderedPackageNames
    };
};

const generateBuildChain = async (packageName, allPackagesOrdered) => {
    let lernaArgs = `ls --all --toposort --graph --scope ${packageName} --include-dependents`.split(" ");
    let { stdout } = await execa("./node_modules/.bin/lerna", lernaArgs);
    let dependencyTree = JSON.parse(stdout);

    dependencyTree = filterAgGridOnly(dependencyTree);
    dependencyTree = filterExcludedRoots(dependencyTree);

    return buildBuildTree(packageName, dependencyTree, allPackagesOrdered);
};

const extractCssBuildChain = (buildChainInfo) => {
    return {
        paths: buildChainInfo.paths
            .filter(path => path.includes('grid-community-modules/core'))
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

const watch = async (singleModule = false) => {
    const cacheFilePath = path.resolve(__dirname, '../../.lernaBuildChain.cache.json');
    if (!fs.existsSync(cacheFilePath)) {
        const { paths, orderedPackageNames } = await getOrderedDependencies("@ag-grid-community/core");

        const buildChains = {};
        for (let packageName of orderedPackageNames) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedPackageNames);
        }

        buildChainInfo = {
            paths,
            buildChains
        };

        fs.writeFileSync(cacheFilePath, JSON.stringify(buildChainInfo), 'UTF-8');
    } else {
        buildChainInfo = JSON.parse(fs.readFileSync(cacheFilePath, 'UTF-8'));
    }

    spawnWatcher(buildChainInfo, singleModule);

    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    spawnCssWatcher(cssBuildChain);
};

const watchBeta = async () => {
    console.log("Watching css...");
    const cacheFilePath = path.resolve(__dirname, '../../.lernaBuildChain.cache.json');
    if (!fs.existsSync(cacheFilePath)) {
        const { paths, orderedPackageNames } = await getOrderedDependencies("@ag-grid-community/core");

        const buildChains = {};
        for (let packageName of orderedPackageNames) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedPackageNames);
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
    const cacheFilePath = path.resolve(__dirname, '../../.lernaBuildChain.cache.json');
    if (!fs.existsSync(cacheFilePath)) {
        const { paths, orderedPackageNames } = await getOrderedDependencies("@ag-grid-community/core");

        const buildChains = {};
        for (let packageName of orderedPackageNames) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedPackageNames);
        }

        buildChainInfo = {
            paths,
            buildChains
        };

        fs.writeFileSync(cacheFilePath, JSON.stringify(buildChainInfo), 'UTF-8');
    } else {
        buildChainInfo = JSON.parse(fs.readFileSync(cacheFilePath, 'UTF-8'));
    }
    return buildChainInfo;
};
const build = async () => {
    const buildChainInfo = await getBuildChainInfo();

    const packagePath = path.resolve(__dirname, '../../grid-community-modules/core/src/gridCoreModule.ts');
    const packageName = manifest(findParentPackageManifest(packagePath)).name;

    await buildDependencyChain(packageName, buildChainInfo.buildChains);

    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    await buildDependencyChain(packageName, cssBuildChain.buildChains, false, 'build-css');
};

const buildCssBeta = async () => {
    const buildChainInfo = await getBuildChainInfo();
    const cssBuildChain = extractCssBuildChain(buildChainInfo);
    await buildDependencyChain("@ag-grid-community/core", cssBuildChain.buildChains, false, 'build-css');
};

if (commandLineOptions.watch) watch(false);
if (commandLineOptions.single) watch(true);
if (commandLineOptions.build) build();
if (commandLineOptions.buildBeta) buildCssBeta();
if (commandLineOptions.watchBeta) watchBeta();

