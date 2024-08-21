const fetch = require('node-fetch');

const JIRA_CREDENTIALS = process.env.JIRA_CREDENTIALS;

if (!JIRA_CREDENTIALS) {
    console.error('JIRA_CREDENTIALS not defined - exiting script.');
    process.exit(1);
}

const jiraRequest = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${Buffer.from(JIRA_CREDENTIALS).toString('base64')}`,
            Accept: 'application/json',
        },
    });
    return await response.json();
};

const retrieveData = async (url) => {
    // JIRA limits the data returned via the rest api so we need to access the whole data set in chunks - each "page" will be maxResults long
    // we keep executing the request with a new startAt until we reach the total number of issues in the set
    const startAt = 0,
        maxResults = 50;

    const result = [];

    const data = await jiraRequest(`${url}?startAt=${startAt}&maxResults=${maxResults}`);
    result.push(...data.values);

    for (let page = 1; page < Math.ceil(data.total / maxResults); page++) {
        const block = await jiraRequest(`${url}?startAt=${maxResults * page}&maxResults=${maxResults}`);
        result.push(...block.values);
    }

    return result;
};

const releaseJiraVersion = async (versionNumber) => {
    const data = await retrieveData("https://ag-grid.atlassian.net/rest/api/2/project/AG/version");
    const versionToRelease = data.filter(version => !version.archived)
        .filter(version => !version.released)
        .filter(version => version.name === versionNumber)[0];

    if (versionToRelease) {
        const bodyData = `{
          "released": true,
          "releaseDate": "${new Date().toISOString().substring(0,10)}"
        }`;

        const response = await fetch(`https://ag-grid.atlassian.net/rest/api/2/version/${versionToRelease.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Basic ${Buffer.from(JIRA_CREDENTIALS).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyData
        })

        if(response.status !== 200) {
            console.error(`Error releasing version ${versionToRelease}: ${response.statusText}`);
            process.exit(1);
        }
    } else {
        console.error(`No unreleased jira version for ${versionToRelease} found`);
        process.exit(1);
    }
};

(async () => {
    const versionNumber = process.argv[2];
    if(!versionNumber) {
        console.error("No version specified!")
        process.exit(1);
    }
    await releaseJiraVersion(versionNumber);
    console.log(`Version ${versionNumber} released`);
})();
