#!/usr/bin/env node
import fs from 'fs';

const url = 'https://ag-grid.atlassian.net/rest/api/2/issue/';
const auth = process.env.JIRA_API_AUTH;
const commentText = fs.readFileSync(process.env.JIRA_FILE || './jira.md', 'utf8');

if (!auth) {
    console.error('JIRA_API_AUTH environment variable must be set.');
    process.exit(1);
}

createIssue()
    .then((r) => console.log('Issue created successfully:', r))
    .catch((error) => console.error('Error creating issue:', error));

function createIssue() {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({
            fields: {
                project: { key: 'RTI' },
                summary: 'Performance Regression',
                description: `A regression in performance has been detected in the latest build.\n${commentText}`,
                issuetype: { name: 'Task' },
            },
        }),
    }).then((response) => {
        if (!response.ok) throw new Error(`HTTP error status ${response.status} ${response.statusText}`);
        return response.json();
    });
}
