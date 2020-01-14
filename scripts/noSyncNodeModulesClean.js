const fs = require("fs-extra");
const glob = require("glob");

const rootPackages = require('../lerna.json').packages;

rootPackages.forEach(rootPackage => {
    const packageDirectories = glob.sync(`${rootPackage}`);
    packageDirectories.forEach(packageDirectory => {
        if (fs.existsSync(`${packageDirectory}/package.json`)) {
            if (fs.existsSync(`${packageDirectory}/node_modules.nosync`)) {
                fs.removeSync(`${packageDirectory}/node_modules.nosync`);
                fs.mkdirSync(`${packageDirectory}/node_modules.nosync`);
            }
        }
    });
});
