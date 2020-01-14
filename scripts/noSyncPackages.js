const fs = require("fs");
const glob = require("glob");

const rootPackages = require('../lerna.json').packages;

rootPackages.forEach(rootPackage => {
    const packageDirectories = glob.sync(`${rootPackage}`);
    packageDirectories.forEach(packageDirectory => {
        if (fs.existsSync(`${packageDirectory}/package.json`)) {
            if (!fs.existsSync(`${packageDirectory}/node_modules.nosync`)) {
                fs.mkdirSync(`${packageDirectory}/node_modules.nosync`);
            }
            process.chdir(packageDirectory);
            try {
                fs.symlinkSync('node_modules.nosync', 'node_modules');
            } catch(e) {}
            process.chdir('../..');
        }
    });
});
