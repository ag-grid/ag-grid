const { BASE_URL_FILE_PATH, getBaseUrl } = require('./prep_and_archive/baseUrlUtils');
const fs = require('fs');
const path = require('path');

function getUsageInfo() {
    const usageInfo = [
        'Usage: node scripts/deployments/sanityCheckBaseUrl.js [dev|staging|archive|production] (ARCHIVE_VERSION)',
        '\tFor dev: node scripts/deployments/sanityCheckBaseUrl.js dev',
        '\tFor staging: node scripts/deployments/sanityCheckBaseUrl.js staging',
        '\tFor archive eg, on v32.3.0: node scripts/deployments/sanityCheckBaseUrl.js archive 32.3.0',
        '\tFor production: node scripts/deployments/sanityCheckBaseUrl.js production',
        'Note: This script should be run from the root of the monorepo',
    ];

    return usageInfo.join('\n');
}

function getBaseUrlFromFile(baseUrlFilePath) {
    if (!fs.existsSync(baseUrlFilePath)) {
        throw new Error(`baseUrlFilePath '${baseUrlFilePath}' not found`);
    }

    const contents = fs.readFileSync(baseUrlFilePath, { encoding: 'utf8' });
    const regex = /(export const BASE_URL =)(.*)'(?<baseUrl>.*)';$/m;

    return contents.match(regex)?.groups.baseUrl;
}

function main() {
    const [, , env, archiveVersion] = process.argv;

    const { error, baseUrl } = getBaseUrl({ env, archiveVersion });

    if (error) {
        console.log('Error:', error, '\n');
        console.log(getUsageInfo());
        process.exit(1);
    }

    console.log(
        '******************************************************************************************************************************'
    );
    console.log(`Verify baseUrl is ${baseUrl}`);
    console.log(
        '******************************************************************************************************************************'
    );

    const baseUrlFilePath = path.resolve(process.cwd(), BASE_URL_FILE_PATH);
    const fileBaseUrl = getBaseUrlFromFile(baseUrlFilePath);

    if (fileBaseUrl === baseUrl) {
        console.log(`'${baseUrlFilePath}' is correctly set.`);
    } else {
        console.error(`ERROR: '${baseUrlFilePath}' is not set to '${baseUrl}'`);
        process.exit(1);
    }
}

main();
