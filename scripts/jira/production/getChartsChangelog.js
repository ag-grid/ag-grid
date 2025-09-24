const fs = require('fs');
const { executeJiraRequest, saveDataToFile, logger } = require('./utils');

const CHANGELOG_URL = 'https://ag-grid.atlassian.net/rest/api/3/search/jql?jql=filter=11743+order+by+fixversion+desc';
const CHANGELOG_LOG = '/home/ubuntu/jira_reports/charts-changelog.log';
const CHANGELOG_TMP_FILE = '/var/www/html/charts/changelog/changelog.tmp.json';
const CHANGELOG_FILE = '/var/www/html/charts/changelog/changelog.json';
const CHANGELOG_BAK_FILE = '/var/www/html/charts/changelog/changelog.bak.json';

try {
    logger('Charts Changelog Data Download Started', CHANGELOG_LOG);
    const changelogData = executeJiraRequest(CHANGELOG_URL, 'Charts');
    logger('Charts Changelog Data Downloaded', CHANGELOG_LOG);

    saveDataToFile(changelogData, CHANGELOG_TMP_FILE);
    logger('Charts Changelog Data Saved', CHANGELOG_LOG);

    // check we've not downloaded an empty data set (it's very unlikely the changelog will ever be empty)
    if (changelogData.length > 1) {
        logger('Charts Updating Existing Changelog Data', CHANGELOG_LOG);
        // if we've data switch it over to the "live" set, backing up the previous data set - just in case
        if (fs.existsSync(CHANGELOG_FILE)) {
            fs.renameSync(CHANGELOG_FILE, CHANGELOG_BAK_FILE);
        }
        fs.renameSync(CHANGELOG_TMP_FILE, CHANGELOG_FILE);
    }

    logger('Charts Changelog Data Processing Complete', CHANGELOG_LOG);
} catch (e) {
    logger('Error: Charts Changelog Data Downloaded Failed', CHANGELOG_LOG);
    logger(e.message, CHANGELOG_LOG);
}
