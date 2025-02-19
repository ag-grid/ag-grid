const { curlRequest } = require('./utils');

const REQUEST = 'https://ag-grid.atlassian.net/rest/api/2/project/AG/versions';

if (process.argv.length < 3) {
    console.log('Usage: node scripts/jira/production/releasedVersionExists.js <version>');
    console.log('For example: node scripts/jira/production/releasedVersionExists.js 33.0.0');
    console.log('Note: This script should be run from the root of the monorepo');
    process.exit(1);
}

const [exec, scriptPath, releasedVersion] = process.argv;

try {
    const releasedVersionExists = curlRequest(REQUEST)
        .filter((version) => version.released)
        .map((version) => version.name)
        .some((version) => releasedVersion === version);
    console.log(releasedVersionExists);
} catch (e) {
    console.error('Error: Could not download/process released versions', e);
    process.exit(1);
}
