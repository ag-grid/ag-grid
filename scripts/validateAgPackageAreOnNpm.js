// Note: Assumes working directory is the root of the mono-repo

const os = require('os');
const {spawnSync} = require('child_process');
const getPackageInformation = require("./utils/utils").getPackageInformation;

const WINDOWS = /^win/.test(os.platform());

const npm = WINDOWS ? 'npm.cmd' : 'npm';

if (process.argv.length < 4) {
    console.log("Usage: node scripts/validateAgPackageAreOnNpm.js [Grid Version] [Chart Version]");
    console.log("For example: node scripts/validateAgPackageAreOnNpm.js 23.1.0 1.1.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}
const [exec, scriptPath, gridNewVersion, chartNewVersion] = process.argv;

const exclude = ['@ag-grid-community/vue-legacy', 'ag-grid-vue-legacy']
const allPackages = getPackageInformation();
const packageNames = Object.keys(allPackages);
packageNames
    .forEach(packageName => {
        const agPackage = allPackages[packageName];
        const {isGridPackage, publicPackage} = agPackage;
        const excludePackage = exclude.includes(packageName);

        if(publicPackage && !excludePackage) {
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
                console.error('******************************************************************');
                console.error(`Published version of ${packageName} is ${publishedVersion}, but expected version is ${expectedVersion}`);
                console.error('******************************************************************');
            } else {
                console.log(`Published version of ${packageName} is ${publishedVersion}`);
            }
        }
    });
