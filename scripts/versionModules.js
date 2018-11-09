// Note: Assumes working directory is the root of the mono-repo
const fs = require('fs');

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const PACKAGE_DIR = 'packages';
const LERNA_JSON = 'lerna.json';

if (process.argv.length !== 4) {
    console.log("Usage: node scripts/versionModules.js [New Version] [Dependency Version]");
    console.log("For example: node scripts/versionModules.js 19.1.0 ^19.1.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, newVersion, dependencyVersion] = process.argv;

function main() {
    updatePackageBowserJsonFiles();
    updateLernaJson();
}

function updatePackageBowserJsonFiles() {
    const CWD = process.cwd();

    fs.readdirSync(PACKAGE_DIR)
        .forEach(directory => {
                // update all package.json files
                let currentPackageJsonFile = `${CWD}/${PACKAGE_DIR}/${directory}/package.json`;
                updateFileWithNewVersions(currentPackageJsonFile);

                // update all bower.json files, if they exist
                let currentBowerFile = `${CWD}/${PACKAGE_DIR}/${directory}/bower.json`;
                updateFileWithNewVersions(currentBowerFile, true);
            }
        );
}

function updateLernaJson() {
    fs.readFile(LERNA_JSON, 'utf8', (err, contents) => {
        const lernaFile = JSON.parse(contents);

        const copyOfFile = JSON.parse(JSON.stringify(lernaFile));
        copyOfFile.version = newVersion;

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
    copyOfFile.version = newVersion;
    return copyOfFile;
}

function updateDependencies(fileContents) {
    return updateDependency(fileContents, 'dependencies', dependencyVersion);
}

function updateDevDependencies(fileContents) {
    return updateDependency(fileContents, 'devDependencies', dependencyVersion);
}

function updatePeerDependencies(fileContents) {
    return updateDependency(fileContents, 'peerDependencies', dependencyVersion);
}

function updateDependency(fileContents, property, dependencyVersion) {
    if (!fileContents[property]) {
        return fileContents;
    }

    const copyOfFile = JSON.parse(JSON.stringify(fileContents));
    const dependencyContents = copyOfFile[property];

    Object.entries(dependencyContents)
        .filter(([key, value]) => {
            return key.startsWith('ag-grid')
        })
        .filter(([key, value]) => {
            return key !== 'ag-grid-testing'
        })
        .forEach(([key, value]) => {
            dependencyContents[key] = dependencyVersion;
        });

    return copyOfFile;
}

main();