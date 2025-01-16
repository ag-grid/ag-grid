const fs = require('fs');
const os = require('os');

const chartsVersion = process.argv[2];

if (chartsVersion == null) {
    console.error('Usage: ' + process.argv0 + ' [new-version]');
}

console.log(`Updating references to charts dependencies to version ${chartsVersion}`);

function updateDependency(fileContents, property, chartsVersion) {
    if (!fileContents[property]) {
        return fileContents;
    }

    let updated = false;
    Object.entries(fileContents[property]).forEach(([key, value]) => {
        if (key.startsWith('ag-charts')) {
            fileContents[property][key] = chartsVersion;
            updated = true;
        }
    });

    return updated;
}

const packageRootDirectories = JSON.parse(fs.readFileSync('package.json', 'utf-8')).workspaces.packages.filter(
    (d) => !d.startsWith('external/')
);

const processPackageFile = (packageJsonFilename) => {
    if (fs.existsSync(packageJsonFilename)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonFilename, 'utf-8'));

        let updated = updateDependency(packageJson, 'dependencies', chartsVersion);
        updated |= updateDependency(packageJson, 'devDependencies', chartsVersion);
        updated |= updateDependency(packageJson, 'peerDependencies', chartsVersion);
        updated |= updateDependency(packageJson, 'optionalDependencies', chartsVersion);

        if (updated) {
            fs.writeFileSync(packageJsonFilename, JSON.stringify(packageJson, null, 2) + os.EOL, 'utf-8');
        }
    }
};

for (const lernaPackage of packageRootDirectories) {
    const packageRootDirectory = lernaPackage.replace('/*', '');
    const packageJsonFilename = `./${packageRootDirectory}/package.json`;
    if (fs.existsSync(packageJsonFilename)) {
        processPackageFile(packageJsonFilename);
    }
}
