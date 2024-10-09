/**
 * Update `packages/ag-grid-community/src/baseUrl.ts` file based on the environment
 */
const fs = require('fs');
const path = require('path');
const { BASE_URL_FILE_PATH, getBaseUrl } = require('./baseUrlUtils');

function getUsageInfo() {
    const usageInfo = [
        'Usage: node scripts/deployments/prep_and_archive/updateBaseUrl.js [dev|staging|archive|production] (ARCHIVE_VERSION)',
        '\tFor dev: node scripts/deployments/prep_and_archive/updateBaseUrl.js dev',
        '\tFor staging: node scripts/deployments/prep_and_archive/updateBaseUrl.js staging',
        '\tFor archive eg, on v32.3.0: node scripts/deployments/prep_and_archive/updateBaseUrl.js archive 32.3.0',
        '\tFor production: node scripts/deployments/prep_and_archive/updateBaseUrl.js production',
        'Note: This script should be run from the root of the monorepo',
    ];

    return usageInfo.join('\n');
}

function updateBaseUrlFile({ baseUrlFilePath, baseUrl }) {
    if (!fs.existsSync(baseUrlFilePath)) {
        throw new Error(`baseUrlFilePath '${baseUrlFilePath}' not found`);
    }

    fs.readFile(baseUrlFilePath, 'utf8', (_err, contents) => {
        const regex = /(export const BASE_URL =)(.*)$/m;
        const substitute = `$1 '${baseUrl}';`;
        const replacement = contents.replace(regex, substitute);

        fs.writeFileSync(baseUrlFilePath, replacement, 'utf8');
    });
}

function main() {
    const [, , env, archiveVersion] = process.argv;

    const { error, baseUrl } = getBaseUrl({ env, archiveVersion });

    if (error) {
        console.log('Error:', error, '\n');
        console.log(getUsageInfo());
        process.exit(1);
    }

    console.log('************************************************************************************************');
    console.log(`Updating base url to ${baseUrl}`);
    console.log('************************************************************************************************');

    const baseUrlFilePath = path.resolve(process.cwd(), BASE_URL_FILE_PATH);
    updateBaseUrlFile({ baseUrlFilePath, baseUrl });
}

main();
