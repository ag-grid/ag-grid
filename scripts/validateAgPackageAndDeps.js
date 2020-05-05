// Note: Assumes working directory is the root of the mono-repo

const getPackageInformation = require("./utils/utils").getPackageInformation;

if (process.argv.length < 6) {
    console.log("Usage: node scripts/sanityCheckPackages.js [Grid Version] [Grid Dependency Version] [Chart Version] [Chart Dependency Version]");
    console.log("For example: node scripts/validateAgPackageAndDeps.js 23.0.0 ~23.0.0 1.0.0 ~1.0.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}
const [exec, scriptPath, gridNewVersion, gridDependencyVersion, chartNewVersion, chartDependencyVersion] = process.argv;

const allPackages = getPackageInformation();
const packageNames = Object.keys(allPackages);
packageNames
    .forEach(packageName => {
        const agPackage = allPackages[packageName];
        const {projectRoot, isGridPackage, version, agGridDeps, agChartDeps, agSubAngularVersion, agSubAngularGridDeps, agSubAngularChartDeps} = agPackage;

        function checkDependency(dependencyName, currentVersion, expectedVersion) {
            if (currentVersion !== expectedVersion) {
                console.log(`${dependencyName} in ${projectRoot}/package.json has ${currentVersion} but we expect it to be ${expectedVersion}`);
            }
        }

        checkDependency(packageName, version, isGridPackage ? gridNewVersion : chartNewVersion);
        Object.keys(agPackage.agGridDeps).forEach(dependencyName => checkDependency(dependencyName, agGridDeps[dependencyName], gridDependencyVersion));
        Object.keys(agPackage.agChartDeps).forEach(dependencyName => checkDependency(dependencyName, agChartDeps[dependencyName], chartDependencyVersion));

        if (agSubAngularVersion) {
            checkDependency(packageName, agSubAngularVersion, isGridPackage ? gridNewVersion : chartNewVersion);
        }

        if (agSubAngularGridDeps) {
            Object.keys(agSubAngularGridDeps).forEach(dependencyName => checkDependency(dependencyName, agSubAngularGridDeps[dependencyName], gridDependencyVersion));
        }
        if (agSubAngularChartDeps) {
            Object.keys(agSubAngularChartDeps).forEach(dependencyName => checkDependency(dependencyName, agSubAngularChartDeps[dependencyName], chartDependencyVersion));
        }
    });
