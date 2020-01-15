const fs = require("fs-extra");
const glob = require("glob");

console.log('node_modules');

const rootPackages = require('../lerna.json').packages;
rootPackages.forEach(rootPackage => {
    const packageDirectories = glob.sync(`${rootPackage}`);
    packageDirectories.forEach(packageDirectory => {
        if (fs.existsSync(`${packageDirectory}/package.json`)) {
            console.log(`${packageDirectory}/node_modules`);
        }
    });
});
