// Note: Assumes working directory is the root of the mono-repo
const fs = require('fs');

if (process.argv.length !== 3) {
    console.log("Usage: node scripts/versionPackageJson.js [New Version]");
    console.log("For example: node scripts/versionPackageJson.js 19.1.2");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, newVersion] = process.argv;

FILE = 'package.json';
function main() {
    fs.readFile(FILE, 'utf8', (err, contents) => {
        const packageJson = JSON.parse(contents);

        const copyOfFile = JSON.parse(JSON.stringify(packageJson));
        copyOfFile.version = newVersion;

        fs.writeFileSync(FILE,
            JSON.stringify(copyOfFile, null, 2),
            "utf8");
    });
}

main();