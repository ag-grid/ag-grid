const path = require("path");
const fs = require("fs");
const commandLineOptions = require("commander");
const execa = require("execa");
const chokidar = require("chokidar");

commandLineOptions
    .option(
        "-w, --watch",
        "Watcher dependents of the current working directory."
    )
    .option(
        "-t, --test"
    )
    .parse(process.argv);

const manifest = (dir = undefined) =>
    JSON.parse(
        fs.readFileSync(`${dir ? dir : process.cwd()}/package.json`, {
            encoding: "utf8"
        })
    );

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

const prunePackageTree = tree => tree.slice(1, tree.length); // removes the the tree root

const findChildPackages = async name => {
    const lernaArgs = `ls --all --toposort --json --scope ${name} --include-filtered-dependents`.split(
        " "
    );
    const {stdout} = await execa("lerna", lernaArgs);
    return JSON.parse(stdout).filter(dependency => exclude.indexOf(dependency.name) === -1 && dependency.name.indexOf('-example') === -1);
};

const buildDependency = async name => {
    console.log(`Building ${name}`);
    // const lernaArgs = `run build --scope ${name}`.split(" ");
    // await execa("lerna", lernaArgs);
    // await execa("lerna", lernaArgs, { stdio: "inherit" });
};

const findIndexAfterPackage = (packageName, buildChain) => {
    let packageIndex = null;

    const indices = Object.keys(buildChain);
    indices.forEach(index => {
        if (!packageIndex && buildChain[index].includes(packageName)) {
            packageIndex = index;
        }
    });
    return String(parseInt(packageIndex) + 1);
};

const buildDependencyChain = async (path, buildChains) => {
    const packageName = manifest(path).name;

    const buildChain = buildChains[packageName];

    const startingIndex = findIndexAfterPackage(packageName, buildChain);
    const maxIndex = Object.keys(buildChain).length;

    console.log([packageName]);
    for (let i = startingIndex; i < maxIndex; i++) {
        console.log(buildChain[i]);
    }

    // const buildOperations = buildEligibleChildren.map(dependency =>
    //     buildDependency(dependency.name)
    // );
    // await Promise.all(buildOperations);
};

const spawnWatcher = async (paths, buildChains) => {
    await console.log(`Watching the following paths: ${paths.join('\n')}`);
    const log = console.log.bind(console);

    // Initialize the watcher
    let watcher = chokidar.watch(paths, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /node_modules/, // ignore node_modules
            /lib|dist/, // ignore build output files
            /\*___jb_tmp___/ // ignore jetbrains IDE temp files
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true // Helps minimising thrashing of watch events
    });

    // Add event listeners
    return watcher
        .on("add", path => {
            log(`File ${path} has been added`);
            buildDependencyChain(path, buildChains);
        })
        .on("change", path => {
            log(`File ${path} has been changed`);
            buildDependencyChain(path, buildChains);
        })
        .on("unlink", path => {
            log(`File ${path} has been removed`);
            buildDependencyChain(path, buildChains);
        });
};

const filterAgGridOnly = dependencyTree => {
    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree);
    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-")) : []
    });
    return prunedDependencyTree;
};

const buildBuildTree = (dependencyTree, dependenciesOrdered) => {
    const rootPackage = dependenciesOrdered[0];

    let index = 0;
    let buildChain = {
        [index++]: [rootPackage]
    };
    delete dependencyTree[rootPackage];

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
    'ag-grid-community',
    'ag-grid-enterprise'
];
const excludePackage = packageName => !exclude.includes(packageName) && !packageName.includes("-example")
// && !packageName.includes("-enterprise") && !packageName.includes("-angular") && !packageName.includes("-vue") && !packageName.includes("-react");

const filterExcludedRoots = dependencyTree => {
    const exclude = [
        'ag-grid-dev',
        'ag-grid-docs',
        'ag-grid-community',
        'ag-grid-enterprise'
    ];

    const prunedDependencyTree = {};
    const agRoots = Object.keys(dependencyTree).filter(excludePackage);
    agRoots.forEach(root => {
        prunedDependencyTree[root] = dependencyTree[root] ? dependencyTree[root].filter(dependency => dependency.includes("@ag-")) : []
    });
    return prunedDependencyTree;
};

const getOrderedDependencies = async packageName => {
    const lernaArgs = `ls --all --sort --toposort --json --scope ${packageName} --include-dependents`.split(" ");
    const {stdout, stderr} = await execa("lerna", lernaArgs);
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
    let {stdout} = await execa("lerna", lernaArgs);
    let dependencyTree = JSON.parse(stdout);
    dependencyTree = filterAgGridOnly(dependencyTree);
    dependencyTree = filterExcludedRoots(dependencyTree);

    return buildBuildTree(dependencyTree, allPackagesOrdered);
};

const test = async () => {
    let buildChains = {};

    const cacheFilePath = path.resolve(__dirname, '../../.lernaBuildChain.cache');
    if(!fs.existsSync(cacheFilePath)) {
        const {paths, orderedPackageNames} = await getOrderedDependencies("@ag-community/grid-core");

        for (let packageName of orderedPackageNames) {
            buildChains[packageName] = await generateBuildChain(packageName, orderedPackageNames);
        }
        fs.writeFileSync(cacheFilePath, JSON.stringify(buildChains), 'UTF-8');
    } else {
        buildChains = JSON.parse(fs.readFileSync(cacheFilePath, 'UTF-8'));
    }

    // buildDependencyChain('/Users/seanlandsman/IdeaProjects/ag/ag-grid/ag-grid/community-modules/csv-export', buildChains)
    // spawnWatcher(paths, buildChains);
};

if (commandLineOptions.watch) watch();
if (commandLineOptions.test) test();

