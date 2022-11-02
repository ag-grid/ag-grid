// Note: Assumes working directory is the root of the mono-repo
const fs = require('fs');

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const LERNA_JSON = 'lerna.json';

if (process.argv.length < 5) {
    console.log("Usage: node scripts/release/versionModules.js [New Version] [Dependency Version] [package directories] [charts version]");
    console.log("For example: node scripts/release/versionModules.js 19.1.0 ^19.1.0 '[\"charts-packages\", \"examples-charts\"]' 1.0.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, gridNewVersion, dependencyVersion, packageDirsRaw, modulesToVersion, chartsDependencyVersion] = process.argv;

const resolvedModulesToVersion = modulesToVersion === "all" ? modulesToVersion : modulesToVersion.split(',')

const packageDirs = JSON.parse(packageDirsRaw);

function main() {
    updatePackageBowserJsonFiles();
    updateLernaJson();
}

function updateAngularProject(CWD, packageDirectory, directory) {
    let angularJson = require(`${CWD}/${packageDirectory}/${directory}/angular.json`);

    let currentSubProjectPackageJsonFile = `${CWD}/${packageDirectory}/${directory}/projects/${angularJson.defaultProject}/package.json`;
    updateFileWithNewVersions(currentSubProjectPackageJsonFile);
}

function updatePackageBowserJsonFiles() {
    const CWD = process.cwd();

    const packageMatchesResolvedModuleToVersion = packageName => {
        if (resolvedModulesToVersion === "all") {
            return true;
        }

        // so vue will match ag-grid-vue but not ag-grid-vue3, for example
        return resolvedModulesToVersion.some(resolvedModuleToVersion => packageName.match(new RegExp(`${resolvedModuleToVersion}$`)) !== null);
    }

    packageDirs.forEach(packageDirectory => {
        fs.readdirSync(packageDirectory)
            .filter(packageMatchesResolvedModuleToVersion)
            .forEach(directory => {
                    // update all package.json files
                    let currentPackageJsonFile = `${CWD}/${packageDirectory}/${directory}/package.json`;
                    updateFileWithNewVersions(currentPackageJsonFile);

                    // angular projects have "sub" projects which we need to update
                    if (directory.includes("angular") && !directory.includes("example")) {
                        updateAngularProject(CWD, packageDirectory, directory);
                    }

                    // docs has a documentation sub dir that we need to handle too
                    if(directory === 'ag-grid-docs') {
                        updateFileWithNewVersions(`${CWD}/${packageDirectory}/${directory}/documentation/package.json`);
                    }

                    // update all bower.json files, if they exist
                    let currentBowerFile = `${CWD}/${packageDirectory}/${directory}/bower.json`;
                    updateFileWithNewVersions(currentBowerFile, true);
                }
            );
    })
}

function updateLernaJson() {
    fs.readFile(LERNA_JSON, 'utf8', (err, contents) => {
        const lernaFile = JSON.parse(contents);

        const copyOfFile = JSON.parse(JSON.stringify(lernaFile));
        copyOfFile.version = gridNewVersion;

        fs.writeFileSync(LERNA_JSON,
            JSON.stringify(copyOfFile, null, 2),
            "utf8");
    });
}

function updateFileWithNewVersions(currentFile, optional = false) {
    if (optional && !fs.existsSync(currentFile)) {
        return;
    } else if (!optional && !fs.existsSync(currentFile)) {
        console.log(`${currentFile} does not exist and is not optional`);
        process.exit(1);
    }

    fs.readFile(currentFile, 'utf8', (err, contents) => {
        const packageJson = JSON.parse(contents);

        const updatedPackageJson = pipe(
            updateVersion,
            updateDependencies,
            updateDevDependencies,
            updatePeerDependencies)(packageJson);

        fs.writeFileSync(currentFile,
            JSON.stringify(updatedPackageJson, null, 2),
            "utf8");
    });
}

function updateVersion(packageJson) {
    const copyOfFile = JSON.parse(JSON.stringify(packageJson));
    copyOfFile.version = gridNewVersion;
    return copyOfFile;
}

function updateDependencies(fileContents) {
    return updateDependency(fileContents, 'dependencies', dependencyVersion, chartsDependencyVersion);
}

function updateDevDependencies(fileContents) {
    return updateDependency(fileContents, 'devDependencies', dependencyVersion, chartsDependencyVersion);
}

function updatePeerDependencies(fileContents) {
    //return updateDependency(fileContents, 'peerDependencies', "28.2.0", "6.2.0");
    return updateDependency(fileContents, 'peerDependencies', dependencyVersion, chartsDependencyVersion);
}

function updateDependency(fileContents, property, dependencyVersion, chartsDependencyVersion) {
    if (!fileContents[property]) {
        return fileContents;
    }

    const copyOfFile = JSON.parse(JSON.stringify(fileContents));
    const dependencyContents = copyOfFile[property];

    let gridDependenct = function (key) {
        return key.startsWith('ag-grid') || key.startsWith('@ag-grid');
    };
    let chartDependency = function (key) {
        return key.startsWith('ag-charts') || key.startsWith('@ag-charts');
    };
    Object.entries(dependencyContents)
        .filter(([key, value]) => {
            return gridDependenct(key) ||
                chartDependency(key)
        })
        .filter(([key, value]) => {
            return key !== 'ag-grid-testing'
        })
        .forEach(([key, value]) => {
            if (chartsDependencyVersion) {
                dependencyContents[key] = chartDependency(key) ? chartsDependencyVersion : dependencyVersion;
            } else {
                dependencyContents[key] = dependencyVersion;
            }
        });

    return copyOfFile;
}

main();

