// Note: Assumes working directory is the root of the mono-repo

const os = require('os');
const {spawnSync} = require('child_process');
const getPackageInformation = require("./utils/utils").getPackageInformation;

const WINDOWS = /^win/.test(os.platform());

const npm = WINDOWS ? 'npm.cmd' : 'npm';

if (process.argv.length < 4) {
    console.log("Usage: node scripts/sanityCheckPackages.js [Grid Version] [Grid Dependency Version] [Chart Version] [Chart Dependency Version]");
    console.log("For example: node scripts/sanityCheckPackages.js 23.0.0 ~23.0.0 1.0.0 ~1.0.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}
const [exec, scriptPath, gridNewVersion, chartNewVersion] = process.argv;

const allPackages = getPackageInformation();
const packageNames = Object.keys(allPackages);
packageNames
    .forEach(packageName => {
        const agPackage = allPackages[packageName];
        const {isGridPackage, publicPackage} = agPackage;

        if(publicPackage) {
            const result = spawnSync(npm, ['show', packageName, 'version'],
                {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'pipe',
                    encoding: 'utf-8'
                }
            );

            const publishedVersion = result.stdout;
            const expectedVersion = isGridPackage ? gridNewVersion : chartNewVersion;
            if(expectedVersion.trim() !== publishedVersion.trim()) {
                console.log(`Published version of ${packageName} is ${publishedVersion}, but expected version is ${expectedVersion}`);
            }
        }
    });
