const {executeJiraRequest, saveDataToFile, logger} = require("./utils");

const PIPELINE_URL = "https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=11839+order+by+key+desc";

const pipelineData = executeJiraRequest(PIPELINE_URL);
saveDataToFile(pipelineData, "/home/ceolter/jira_reports/pipeline.json");

logger("Pipeline Data Downloaded");

