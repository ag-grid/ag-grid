// Note: Assumes working directory is the root of the mono-repo

const fs = require('fs');

const readFile = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const isAgDependency = dependency => dependency.startsWith('ag-') || dependency.startsWith('@ag-');
const gridDependency = dependency => dependency.startsWith('ag-grid') || dependency.startsWith('@ag-grid');
const chartDependency = dependency => dependency.startsWith('ag-charts');

const getPackageInformation = () => {
    const lernaFile = readFile('lerna.json');
    const packages = lernaFile.packages.map(pkg => pkg.replace('/*', ''));

    const packageInformation = {};

    packages
        .forEach(packageDirectory => {
            fs.readdirSync(packageDirectory)
                .forEach(directory => {
                    const projectRoot = `./${packageDirectory}/${directory}`;
                    const projectPackageJson = readFile(`${projectRoot}/package.json`);

                    const dependencies = projectPackageJson.dependencies ? Object.keys(projectPackageJson.dependencies) : []
                        .filter(isAgDependency);

                    const devDependencies = projectPackageJson.devDependencies ? Object.keys(projectPackageJson.devDependencies) : []
                        .filter(isAgDependency);

                    const agGridDeps = dependencies
                        .filter(dependency => dependency !== 'ag-grid-testing')
                        .filter(gridDependency).map(dependency => ({
                            [dependency]: projectPackageJson.dependencies[dependency]
                        })).concat(devDependencies
                            .filter(dependency => dependency !== 'ag-grid-testing')
                            .filter(gridDependency).map(dependency => ({
                                [dependency]: projectPackageJson.devDependencies[dependency]
                            }))).reduce((accumulator, current) => {
                            const dependency = Object.keys(current)[0];
                            accumulator[dependency] = current[dependency];
                            return accumulator;
                        }, {});

                    const agChartDeps = dependencies.filter(chartDependency).map(dependency => ({
                        [dependency]: projectPackageJson.dependencies[dependency]
                    })).concat(devDependencies.filter(chartDependency).map(dependency => ({
                        [dependency]: projectPackageJson.devDependencies[dependency]
                    }))).reduce((accumulator, current) => {
                        const dependency = Object.keys(current)[0];
                        accumulator[dependency] = current[dependency];
                        return accumulator;
                    }, {});

                    packageInformation[projectPackageJson.name] = {
                        projectRoot,
                        version: projectPackageJson.version,
                        publicPackage: !projectPackageJson.private,
                        isGridPackage: gridDependency(projectPackageJson.name),
                        agGridDeps,
                        agChartDeps,
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
