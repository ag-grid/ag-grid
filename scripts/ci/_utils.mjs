const JIRA_API_URL = 'https://ag-grid.atlassian.net/rest/api/2';

// Transition an issue to a new status
export async function transitionJiraIssue(issue, transitionId) {
    const url = `${JIRA_API_URL}/issue/${issue.key}/transitions`;
    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ transition: { id: transitionId } }) });
        await updateJiraIssue(issue.key, { fields: { assignee: { accountId: issue.fields.assignee.accountId } } });
        console.log(`Issue ${issue.key} transitioned successfully`);
    } catch (error) {
        console.error('Error transitioning issue:', error.message);
        throw error;
    }
}

export async function updateJiraIssue(issueKey, body) {
    const url = `${JIRA_API_URL}/issue/${issueKey}`;
    try {
        await commonFetch(url, { method: 'PUT', body: JSON.stringify(body) });
        console.log(`Issue ${issueKey} updated successfully`);
    } catch (error) {
        console.error('Error updating issue:', error.message);
        throw error;
    }
}

export async function commonFetch(url, options) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${process.env.JIRA_API_AUTH}`,
        },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} ${response.statusText} ${await response.text()}`);
    }
    return response.json().catch((e) => {
        if (e.message === 'Unexpected end of JSON input') {
            return {};
        }
    });
}

export async function getJiraTransitions(issueKey) {
    const url = `${JIRA_API_URL}/issue/${issueKey}/transitions`;
    try {
        const data = await commonFetch(url, { method: 'GET' });
        return data.transitions;
    } catch (error) {
        console.error('Error fetching transitions:', error.message);
        throw error;
    }
}

export async function getJiraIssue(issueKey) {
    const url = `${JIRA_API_URL}/issue/${issueKey}`;
    try {
        return await commonFetch(url, { method: 'GET' });
    } catch (error) {
        console.error('Error fetching issue:', error.message);
        throw error;
    }
}
// Add a comment to an issue
export async function addJiraComment(issueKey, body) {
    const url = `https://ag-grid.atlassian.net/rest/api/3/issue/${issueKey}/comment`;

    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ body }) }); // fixme JIRA updated body format
        console.log(`Added comment to issue ${issueKey}`);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
}

export async function getCurrentJiraUser() {
    const url = `${JIRA_API_URL}/myself`;
    try {
        const user = await commonFetch(url, { method: 'GET' });
        return user.accountId;
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        throw error;
    }
}

export async function unwatchJiraIssue(issueKey, userId) {
    const url = `https://ag-grid.atlassian.net/rest/api/3/issue/${issueKey}/watchers?accountId=${userId}`;
    try {
        await commonFetch(url, { method: 'DELETE' });
        console.log(`Unwatched issue ${issueKey}`);
    } catch (error) {
        console.error('Error unwatching issue:', error.message);
        throw error;
    }
}

export async function getJiraIssueComments(issueKey) {
    const url = `https://ag-grid.atlassian.net/rest/api/3/issue/${issueKey}/comment?maxResults=100`;
    try {
        const data = await commonFetch(url, { method: 'GET' });
        return data.comments || [];
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        throw error;
    }
}
