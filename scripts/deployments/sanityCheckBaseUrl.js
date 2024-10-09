const { FILES_TO_CHECK_BASE_URL, getBaseUrl } = require('./prep_and_archive/baseUrlUtils');
const fs = require('fs');
const path = require('path');

function getUsageInfo() {
    const usageInfo = [
        'Usage: node scripts/deployments/sanityCheckBaseUrl.js [dev|staging|archive|production] (ARCHIVE_VERSION)',
        '\tFor dev: node scripts/deployments/sanityCheckBaseUrl.js dev',
        '\tFor staging: node scripts/deployments/sanityCheckBaseUrl.js staging',
        '\tFor archive eg, on v32.3.0: node scripts/deployments/sanityCheckBaseUrl.js archive 32.3.0',
        '\tFor production: node scripts/deployments/sanityCheckBaseUrl.js production',
        'Note: This script should be run from the root of the monorepo, and run *after* a build',
    ];

    return usageInfo.join('\n');
}

function getBaseUrlFromFile(baseUrlFilePath) {
    if (!fs.existsSync(baseUrlFilePath)) {
        throw new Error(`baseUrlFilePath '${baseUrlFilePath}' not found`);
    }

    const contents = fs.readFileSync(baseUrlFilePath, { encoding: 'utf8' });
    const regex = /(BASE_URL =)(.*)["'](?<baseUrl>.*)["'];$/m;

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

    const baseUrlErrors = FILES_TO_CHECK_BASE_URL.map((file) => {
        const baseUrlFilePath = path.resolve(process.cwd(), file);
        const fileBaseUrl = getBaseUrlFromFile(baseUrlFilePath);

        if (fileBaseUrl !== baseUrl) {
            return {
                file,
                fileBaseUrl,
            };
        }
    }).filter(Boolean);

    if (baseUrlErrors.length) {
        baseUrlErrors.forEach(({ file, fileBaseUrl }) => {
            console.error(`ERROR: '${file}' has BASE_URL '${fileBaseUrl}' but should be '${baseUrl}'`);
        });
        process.exit(1);
    } else {
        console.log(`BASE_URL is correctly set in\n${FILES_TO_CHECK_BASE_URL.join('\n')}`);
    }
}

main();
