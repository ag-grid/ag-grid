// Note: Assumes working directory is the root of the mono-repo

const fs = require('fs');

const readFile = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const isAgDependency = dependency => dependency.startsWith('ag-') || dependency.startsWith('@ag-');
const gridDependency = dependency => dependency.startsWith('ag-grid') || dependency.startsWith('@ag-grid');
const chartDependency = dependency => dependency.startsWith('ag-charts');

const getAgDependencies = packageJson => packageJson.dependencies ? Object.keys(packageJson.dependencies).filter(isAgDependency) : [];
const getAgDevDependencies = packageJson => packageJson.devDependencies ? Object.keys(packageJson.devDependencies).filter(isAgDependency) : [];
const getAgPeerDependencies = packageJson => packageJson.peerDependencies ? Object.keys(packageJson.peerDependencies).filter(isAgDependency) : [];

const extractDependencies = (projectPackageJson, dependencies, devDependencies, depFilter) =>
    dependencies.filter(depFilter)
        .map(dependency => ({
            [dependency]: projectPackageJson.dependencies[dependency]
        })).concat(devDependencies
        .filter(depFilter).map(dependency => ({
            [dependency]: projectPackageJson.devDependencies[dependency]
        }))).reduce((accumulator, current) => {
        const dependency = Object.keys(current)[0];
        accumulator[dependency] = current[dependency];
        return accumulator;
    }, {});

const extractPeerDependencies = (projectPackageJson, dependencies, depFilter) =>
    dependencies.filter(depFilter)
        .map(dependency => ({
            [dependency]: projectPackageJson.peerDependencies[dependency]
        })).reduce((accumulator, current) => {
        const dependency = Object.keys(current)[0];
        accumulator[dependency] = current[dependency];
        return accumulator;
    }, {});

// only angular projects have "sub" projects
const extractSubAngularProjectDependencies = (packageDirectory, directory) => {
    const CWD = process.cwd();

    let agSubAngularVersion = null;
    let agSubAngularGridDeps = null;
    let agSubAngularChartDeps = null;
    if (directory.includes("angular") && !directory.includes("example")) {
        const angularJson = require(`${CWD}/${packageDirectory}/${directory}/angular.json`);
        const currentSubProjectPackageJsonFile = require(`${CWD}/${packageDirectory}/${directory}/projects/${angularJson.defaultProject}/package.json`);

        agSubAngularVersion = currentSubProjectPackageJsonFile.version;

        agSubAngularGridDeps = getAgPeerDependencies(currentSubProjectPackageJsonFile)
            .filter(gridDependency)
            .map(dependency => ({
                [dependency]: currentSubProjectPackageJsonFile.peerDependencies[dependency]
            }))
            .reduce((accumulator, current) => {
                const dependency = Object.keys(current)[0];
                accumulator[dependency] = current[dependency];
                return accumulator;
            }, {});

        agSubAngularChartDeps = getAgPeerDependencies(currentSubProjectPackageJsonFile)
            .filter(chartDependency)
            .map(dependency => ({
                [dependency]: currentSubProjectPackageJsonFile.peerDependencies[dependency]
            }))
            .reduce((accumulator, current) => {
                const dependency = Object.keys(current)[0];
                accumulator[dependency] = current[dependency];
                return accumulator;
            }, {});
    }

    return {agSubAngularVersion, agSubAngularGridDeps, agSubAngularChartDeps};
}

const exclude = ['grid-packages/ag-grid-docs/documentation/']
const getPackageInformation = () => {
    const lernaFile = readFile('lerna.json');
    const packages = lernaFile.packages.map(pkg => pkg.replace('/*', ''));

    const packageInformation = {};

    packages
        .filter(packageDirectory => !exclude.includes(packageDirectory))
        .forEach(packageDirectory => {
            fs.readdirSync(packageDirectory)
                .filter(directory => !directory.includes('.git'))
                .forEach(directory => {
                    const projectRoot = `./${packageDirectory}/${directory}`;
                    const projectPackageJson = readFile(`${projectRoot}/package.json`);

                    const dependencies = getAgDependencies(projectPackageJson).filter(dependency => dependency !== 'ag-grid-testing');
                    const peerDependencies = getAgPeerDependencies(projectPackageJson).filter(dependency => dependency !== 'ag-grid-testing');
                    const devDependencies = getAgDevDependencies(projectPackageJson).filter(dependency => dependency !== 'ag-grid-testing');

                    const agGridDeps = extractDependencies(projectPackageJson, dependencies, devDependencies, gridDependency);
                    const agGridPeerDeps = projectPackageJson.peerDependencies ? extractPeerDependencies(projectPackageJson, peerDependencies, gridDependency) : {};
                    const agChartDeps = extractDependencies(projectPackageJson, dependencies, devDependencies, chartDependency);
                    const {agSubAngularVersion, agSubAngularGridDeps, agSubAngularChartDeps} = extractSubAngularProjectDependencies(packageDirectory, directory);

                    packageInformation[projectPackageJson.name] = {
                        projectRoot,
                        version: projectPackageJson.version,
                        publicPackage: !projectPackageJson.private,
                        isGridPackage: gridDependency(projectPackageJson.name),
                        agGridDeps,
                        agGridPeerDeps,
                        agChartDeps,
                        agSubAngularVersion,
                        agSubAngularGridDeps,
                        agSubAngularChartDeps
                    }
                });
        });

    return packageInformation;
};


exports.readFile = readFile;
exports.isAgDependency = isAgDependency;
exports.gridDependency = gridDependency;
exports.chartDependency = chartDependency;
exports.getPackageInformation = getPackageInformation;
