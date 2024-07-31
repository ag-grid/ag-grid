const fetch = require('node-fetch');

const REVIEWED_ISSUES_FILTER = 11897;
const PENDING_RC_ISSUES_FILTER = 11896;

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

    const data = await jiraRequest(`${url}&startAt=${startAt}&maxResults=${maxResults}`);
    result.push(...data.issues);

    for (let page = 1; page < Math.ceil(data.total / maxResults); page++) {
        const block = await jiraRequest(`${url}&startAt=${maxResults * page}&maxResults=${maxResults}`);
        result.push(...block.issues);
    }

    return result;
};

const getAvailableTransitions = async (issueId) => {
    const transitionData = await jiraRequest(`https://ag-grid.atlassian.net/rest/api/2/issue/${issueId}/transitions`);
    return Object.assign(
        ...transitionData.transitions.map((transition) => ({ [transition.name.toUpperCase()]: transition.id }))
    );
};

const transitionIssues = async (filterId, transition) => {
    const data = await retrieveData(`https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=${filterId}&fields=id`);
    const issueIds = data.map((datum) => datum.key);

    const transitions = await getAvailableTransitions(issueIds[0]);
    await transitionIssues(issueIds, transitions[transition]);
};

const command = process.argv[2];
switch (command) {
    case 'REVIEWED_TO_PENDING_RC':
        await transitionIssues(REVIEWED_ISSUES_FILTER, 'REVIEWED TO PENDING RC');
        break;
    case 'PENDING_RC_TO_READY_TO_VERIFY':
        await transitionIssues(PENDING_RC_ISSUES_FILTER, 'READY TO VERIFY');
        break;
    default:
        console.error('Invalid option. Possible options are [REVIEWED_TO_PENDING_RC|PENDING_RC_TO_READY_FOR_REVIEW]');
}
