// Note: Assumes working directory is the root of the mono-repo

const fs = require('fs');

if (process.argv.length < 6) {
    console.log("Usage: node scripts/sanityCheckPackages.js [Grid Version] [Grid Dependency Version] [Chart Version] [Chart Dependency Version]");
    console.log("For example: node scripts/sanityCheckPackages.js 23.0.0 ~23.0.0 1.0.0 ~1.0.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const LERNA_JSON = 'lerna.json';

const readFile = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const lernaFile = readFile(LERNA_JSON);
const packages = lernaFile.packages.map(pkg => pkg.replace('/*', ''));

packages.forEach(packageDirectory => {
    fs.readdirSync(packageDirectory)
        .forEach(directory => {
            const projectRoot = `./${packageDirectory}/${directory}`;
            const projectPackageJson = readFile(`${projectRoot}/package.json`);

            const dependencies = projectPackageJson.dependencies ? Object.keys(projectPackageJson.dependencies) : [];
            dependencies.concat(projectPackageJson.devDependencies ? Object.keys(projectPackageJson.devDependencies) : [])

            const agDependencies = dependencies
                .filter(dependency => dependency.startsWith('ag-') || dependency.startsWith('@ag-'));

            agDependencies.forEach(agDependency => {
                const nodeModuleDirPath = `${projectRoot}/node_modules/${agDependency}`;
                if (!fs.existsSync(nodeModuleDirPath)) {
                    console.log(`${agDependency} is listed as a dependency of ${directory} but isn't under node_modules`);
                } else {
                    const nodeModuleDir = fs.lstatSync(nodeModuleDirPath);
                    if (!nodeModuleDir.isSymbolicLink()) {
                        console.log(`${nodeModuleDirPath} is not a symbolic link - check ag version in ${projectRoot}/package.json`);
                    }
                }
            })
        });
});


const [exec, scriptPath, gridNewVersion, gridDependencyVersion, chartNewVersion, chartDependencyVersion] = process.argv;

packages.forEach(packageDirectory => {
    fs.readdirSync(packageDirectory)
        .forEach(directory => {
            const projectRoot = `./${packageDirectory}/${directory}`;
            const projectPackageJson = readFile(`${projectRoot}/package.json`);

            const gridDependency = dependency => dependency.startsWith('ag-grid') || dependency.startsWith('@ag-grid');
            const chartDependency = dependency => dependency.startsWith('ag-charts');

            function checkDependency(packageName, currentVersion, expectedVersion) {
                if(currentVersion !== expectedVersion) {
                    console.log(`${packageName} in ${projectRoot}/package.json has ${currentVersion} but we expect it to be ${expectedVersion}`);
                }
            }

            debugger

            if(gridDependency(projectPackageJson.name)) {
                checkDependency(projectPackageJson.name, projectPackageJson.version, gridNewVersion);
            } else {
                checkDependency(projectPackageJson.name, projectPackageJson.version, chartNewVersion);
            }

            const checkDependencies = packageDependencies => {
                const dependencies = Object.keys(packageDependencies)
                    .filter(dependency => gridDependency(dependency) || chartDependency(dependency));

                dependencies.forEach(dependency => {
                    if(gridDependency(dependency)) {
                        checkDependency(dependency, packageDependencies[dependency], gridDependencyVersion);
                    } else {
                        checkDependency(dependency, packageDependencies[dependency], chartDependencyVersion);
                    }
                })
            };

            if (projectPackageJson.dependencies) {
                checkDependencies(projectPackageJson.dependencies);
            }
            if (projectPackageJson.devDependencies) {
                checkDependencies(projectPackageJson.devDependencies);
            }

        });
});

console.log(gridNewVersion, gridDependencyVersion, chartNewVersion, chartDependencyVersion);
