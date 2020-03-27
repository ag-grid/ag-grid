// Note: Assumes working directory is the root of the mono-repo

const fs = require('fs');
const getPackageInformation = require("./utils/utils").getPackageInformation;

const allPackages = getPackageInformation();
const packageNames = Object.keys(allPackages);

packageNames.forEach(packageName => {
    const agPackage = allPackages[packageName];
    const {projectRoot} = agPackage;

    const agDependencies = Object.keys(agPackage.agGridDeps)
        .concat(Object.keys(agPackage.agChartDeps));

    agDependencies.forEach(agDependency => {
        const nodeModuleDirPath = `${projectRoot}/node_modules/${agDependency}`;
        if (!fs.existsSync(nodeModuleDirPath)) {
            console.log(`${agDependency} is listed as a dependency of ${packageName} (${projectRoot}) but isn't under node_modules`);
        } else {
            const nodeModuleDir = fs.lstatSync(nodeModuleDirPath);
            if (!nodeModuleDir.isSymbolicLink()) {
                console.log(`${nodeModuleDirPath} is not a symbolic link - check ag version in ${projectRoot}/package.json`);
            }
        }
    })

});

