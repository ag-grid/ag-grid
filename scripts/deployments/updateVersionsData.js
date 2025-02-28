const fs = require('fs');
const path = require('path');
const rootPackageJson = require('../../package.json');

// Absolute path from the root directory
const VERSIONS_DATA_PATH = '../../documentation/ag-grid-docs/src/content/versions/ag-grid-versions.json';

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);

    const day = date.getUTCDate();
    const suffix = getDaySuffix(day);

    const options = { month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    return `${formattedDate.split(' ')[0]} ${day}${suffix} ${formattedDate.split(' ')[1]}`;
}

function main(mode) {
    const resolvedPath = path.resolve(__dirname, VERSIONS_DATA_PATH);
    const versionsData = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    // NOTE: Strip off beta, as we only care about the main version
    const rootVersion = rootPackageJson.version.replace(/(.*)(-beta.*)$/g, '$1');
    const currentVersion = versionsData.find((version) => version.version === rootVersion);
    const hasVersion = currentVersion !== undefined;

    if (mode === 'version') {
        if (hasVersion) {
            console.info(`Version '${rootVersion}' already exists in '${resolvedPath}'`);
            return;
        }

        const newVersion = {
            version: rootVersion,
        };

        versionsData.unshift(newVersion);

        fs.writeFileSync(resolvedPath, JSON.stringify(versionsData, null, 4) + '\n', 'utf8');

        console.log(`Added version '${rootVersion}' to '${resolvedPath}'`);
    } else if (mode === 'date') {
        if (!hasVersion) {
            console.error(`ERROR: Version '${rootVersion}' does not exist, to add date`);
            process.exit(1);
        } else if (currentVersion.date !== undefined) {
            console.info(`Version '${rootVersion}' already has a date: ${currentVersion.date}`);
            return;
        }

        const newVersion = {
            ...currentVersion,
            date: formatDate(new Date().toISOString()),
        };
        const newVersionsData = versionsData.map((version) =>
            version.version === newVersion.version ? newVersion : version
        );

        fs.writeFileSync(resolvedPath, JSON.stringify(newVersionsData, null, 4) + '\n', 'utf8');
        console.log(`Updated version '${newVersion.version}' with date '${newVersion.date}' in '${resolvedPath}'`);
    }
}

if (process.argv.length < 3) {
    console.log('Usage: node scripts/deployments/updateVersionsData.js [version|date]');
    console.log('Note: This script should be run from the root of the monorepo');
    process.exit(1);
}

const [_exec, _scriptPath, mode] = process.argv;

main(mode);
