const {executeJiraRequest, saveDataToFile, logger} = require("./utils");

const CHANGELOG_URL = "https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=11743+order+by+fixversion+desc";

const changelogData = executeJiraRequest(CHANGELOG_URL);
saveDataToFile(changelogData, "/home/ceolter/public_html/jira_reports/cache/changelog.json");

logger("Changelog Data Downloaded");
