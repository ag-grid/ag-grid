if (process.argv.length < 3) {
    console.log('Usage: node scripts/deployments/release/getReleaseChangelog.js [Grid Release Version]');
    console.log('For example: scripts/deployments/release/getReleaseChangelog.js 25.3.0');
    console.log('Note: This script should be run from the root of the monorepo');
    process.exit(1);
}
const [exec, script, releaseVersion] = process.argv;

// get these from the wiki
const JIRA_CREDENTIALS = process.env.JIRA_CREDENTIALS;

const URL = 'https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=11743+order+by+fixversion+desc',
    baseCurlCommand = `curl -X GET --user ${JIRA_CREDENTIALS}`,
    { execSync } = require('child_process');

const curlRequest = (url) => {
    const curlCommand = `${baseCurlCommand} "${url}"`;
    return JSON.parse(execSync(curlCommand, { stdio: 'pipe', encoding: 'utf-8' }));
};

const jiraRequest = (startAt, maxResults) => {
    const issueData = curlRequest(`${URL}&startAt=${startAt}&maxResults=${maxResults}`);

    for (let page = 1; page < Math.ceil(issueData.total / maxResults); page++) {
        const block = curlRequest(`${URL}&startAt=${maxResults * page}&maxResults=${maxResults}`);
        issueData.issues = issueData.issues.concat(block.issues);
    }

    return issueData.issues;
};

const allReleasedIssues = jiraRequest(0, 50).map((issue) => {
    const {
        key,
        fields: {
            summary,
            fixVersions,
            issuetype: { name: issueType },
            status: { name: status },
        },
    } = issue;

    let versions = [];
    if (fixVersions) {
        versions = fixVersions.map((fixVersion) => fixVersion.name);
    }

    return {
        key,
        issueType,
        summary,
        status,
        fixVersions: versions,
    };
});

const releaseNotes = [
    `Release [${releaseVersion}](https://www.ag-grid.com/ag-grid-changelog/?fixVersion=${releaseVersion})`,
    `| Key | Issue Type | Summary |`,
    `| --- | --- | --- |`,
]
    .concat(
        allReleasedIssues
            .filter((issue) => issue.fixVersions.some((fixVersion) => fixVersion === releaseVersion))
            // we replace - with &#x2011; to ensure the table doesn't break at the hyphen
            .map((issue) => `| ${issue.key.replace('-', '&#x2011;')} | ${issue.issueType} | ${issue.summary} |`)
    )
    .join('\n');

console.log(releaseNotes);
