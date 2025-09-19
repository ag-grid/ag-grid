const fs = require('fs');
const { executeJiraRequest, saveDataToFile, logger } = require('./utils');

const PIPELINE_URL = 'https://ag-grid.atlassian.net/rest/api/3/search/jql?jql=filter=11839+order+by+key+desc';
const PIPELINE_LOG = '/home/ubuntu/jira_reports/pipeline.log';
const PIPELINE_TMP_FILE = '/var/www/html/pipeline/pipeline.tmp.json';
const PIPELINE_FILE = '/var/www/html/pipeline/pipeline.json';
const PIPELINE_BAK_FILE = '/var/www/html/pipeline/pipeline.bak.json';

try {
    logger('Grid Pipeline Data Download Started', PIPELINE_LOG);
    const pipelineData = executeJiraRequest(PIPELINE_URL, 'Grid');
    logger('Grid Pipeline Data Downloaded', PIPELINE_LOG);

    saveDataToFile(pipelineData, PIPELINE_TMP_FILE);
    logger('Grid Pipeline Data Saved', PIPELINE_LOG);

    // check we've not downloaded an empty data set (it's very unlikely the pipeline will ever be empty)
    if (pipelineData.length > 1) {
        logger('Grid Updating Existing Pipeline Data', PIPELINE_LOG);
        // if we've data switch it over to the "live" set, backing up the previous data set - just in case
        if (fs.existsSync(PIPELINE_FILE)) {
            fs.renameSync(PIPELINE_FILE, PIPELINE_BAK_FILE);
        }
        fs.renameSync(PIPELINE_TMP_FILE, PIPELINE_FILE);
    }

    logger('Grid Pipeline Data Processing Complete', PIPELINE_LOG);
} catch (e) {
    logger('Error: Grid Pipeline Data Downloaded Failed', PIPELINE_LOG);
    logger(e.message, PIPELINE_LOG);
}
