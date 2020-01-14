const fs = require("fs");
const glob = require("glob");

const rootPackages = require('../lerna.json').packages;

rootPackages.forEach(rootPackage => {
    const packageDirectories = glob.sync(`${rootPackage}`);
    packageDirectories.forEach(packageDirectory => {
        if (fs.existsSync(`${packageDirectory}/package.json`)) {
            if (!fs.existsSync(`${packageDirectory}/node_modules`)) {
                fs.mkdirSync(`${packageDirectory}/node_modules`);
            }
            if (!fs.existsSync(`${packageDirectory}/node_modules/.nosync`)) {
                fs.openSync(`${packageDirectory}/node_modules/.nosync`, 'a')
            }
        }
    });

    if(!fs.existsSync(`../node_modules`)) {
        fs.mkdirSync(`../node_modules`);
    }
    if(!fs.existsSync(`../node_modules/.nosync`)) {
        fs.openSync(`../node_modules/.nosync`, 'a')
    }
});
