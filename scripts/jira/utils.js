const fs = require('fs');
const {execSync} = require('child_process');

// get these from the wiki
const JIRA_CREDENTIALS=process.env.JIRA_CREDENTIALS;
const baseCurlCommand = `curl -X GET --user ${JIRA_CREDENTIALS}`;

const curlRequest = url => {
    const curlCommand = `${baseCurlCommand} "${url}"`;
    return JSON.parse(execSync(curlCommand, {stdio: 'pipe', encoding: 'utf-8'}));
}

const jiraRequest = (url) => {
    // JIRA limits the data returned via the rest api so we need to access the whole data set in chunks - each "page" will be maxResults long
    // we keep executing the request with a new startAt until we reach the total number of issues in the set

    const startAt = 0, maxResults = 50;
    const issueData = curlRequest(`${url}&startAt=${startAt}&maxResults=${maxResults}`)

    for (let page = 1; page < Math.ceil(issueData.total / maxResults); page++) {
        const block = curlRequest(`${url}&startAt=${maxResults * page}&maxResults=${maxResults}`)
        issueData.issues = issueData.issues.concat(block.issues);
    }

    return issueData.issues;
}

const executeJiraRequest = (url) => {
    const result = jiraRequest(url)
        .map(issue => {
            const {
                key,
                fields: {
                    summary,
                    fixVersions,
                    customfield_10536: features,
                    customfield_10522: moreInformation,
                    customfield_10520: deprecationNotes,
                    customfield_10521: breakingChangesNotes,
                    issuetype: {name: issueType},
                    status: {name: status}
                }
            } = issue;

            // map the fixVersions to their underlying name (ie 26.0.0 is what we're interested in, not the underlying JIRA metadata for it)
            let versions = [];
            if (fixVersions) {
                versions = fixVersions.map(fixVersion => fixVersion.name);
            }

            return {
                key,
                issueType,
                summary,
                versions,
                status,
                features,
                moreInformation,
                deprecationNotes,
                breakingChangesNotes
            }
        });

    return JSON.stringify(result);
}

const saveDataToFile = (data, filename) => {
    fs.writeFileSync(filename, data, {
        encoding: "UTF-8"
    });
}

module.exports = {
    executeJiraRequest,
    saveDataToFile
}
