const ENV_BASE_URLS = {
    dev: 'https://localhost:4610',
    staging: 'https://grid-staging.ag-grid.com',
    archive: 'https://www.ag-grid.com/archive/%VERSION%',
    production: 'https://www.ag-grid.com',
};

// `baseUrl.ts` file path relative to root of monorepo
const BASE_URL_FILE_PATH = 'packages/ag-grid-community/src/baseUrl.ts';

const FILES_TO_CHECK_BASE_URL = [
    BASE_URL_FILE_PATH,
    'packages/ag-grid-community/dist/ag-grid-community.js',
    'packages/ag-grid-community/dist/package/main.cjs.js',
    'packages/ag-grid-enterprise/dist/ag-grid-enterprise.js',
];

function getBaseUrl({ env, archiveVersion }) {
    let output;
    if (!Object.keys(ENV_BASE_URLS).includes(env)) {
        output = { error: `Env '${env}' not valid. Must be one of ${Object.keys(ENV_BASE_URLS)}` };
    } else if (env === 'archive') {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(archiveVersion)) {
            output = {
                error: `Env 'archive' does not have a valid version number. Must be in the format ${versionRegex.toString()}`,
            };
        } else {
            const baseUrl = ENV_BASE_URLS.archive.replace('%VERSION%', archiveVersion);
            output = {
                baseUrl,
            };
        }
    } else {
        output = {
            baseUrl: ENV_BASE_URLS[env],
        };
    }

    return output;
}

module.exports = {
    BASE_URL_FILE_PATH,
    FILES_TO_CHECK_BASE_URL,
    getBaseUrl,
};
