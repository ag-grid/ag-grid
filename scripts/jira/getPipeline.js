const fs = require('fs');
const {executeJiraRequest, saveDataToFile, logger} = require("./utils");

const PIPELINE_URL = "https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=11839+order+by+key+desc";
const PIPELINE_LOG = "/home/aggrid/jira_reports/pipeline.log";
const PIPELINE_TMP_FILE = "/home/aggrid/public_html/pipeline/pipeline.tmp.json";
const PIPELINE_FILE = "/home/aggrid/public_html/pipeline/pipeline.json";
const PIPELINE_BAK_FILE = "/home/aggrid/public_html/pipeline/pipeline.bak.json";

try {
    logger("Pipeline Data Download Started", PIPELINE_LOG);
    const pipelineData = executeJiraRequest(PIPELINE_URL);
    logger("Pipeline Data Downloaded", PIPELINE_LOG);

    saveDataToFile(pipelineData, PIPELINE_TMP_FILE);
    logger("Pipeline Data Saved", PIPELINE_LOG);

    // check we've not downloaded an empty data set (it's very unlikely the pipeline will ever be empty)
    if(pipelineData.length > 1) {
        logger("Updating Existing Pipeline Data", PIPELINE_LOG);
        // if we've data switch it over to the "live" set, backing up the previous data set - just in case
        if(fs.existsSync(PIPELINE_FILE)) {
            fs.renameSync(PIPELINE_FILE, PIPELINE_BAK_FILE);
        }
        fs.renameSync(PIPELINE_TMP_FILE, PIPELINE_FILE);
    }

    logger("Pipeline Data Processing Complete", PIPELINE_LOG);
} catch (e) {
    logger("Error: Pipeline Data Downloaded Failed", PIPELINE_LOG);
    logger(e.message, PIPELINE_LOG);
}

