#!/usr/bin/env node

const url = 'https://ag-grid.atlassian.net/rest/api/2/issue/';
const auth = process.env.JIRA_API_AUTH;
const commentText = process.env.COMMENT_FILE;
const fs = require('fs');

if (!auth) {
    console.error('JIRA_API_AUTH environment variable must be set.');
    process.exit(1);
}
const TAB = '  ';
const paragraph = (text) => `\n${TAB}${text.trim().replace(/\n+/g, `\n${TAB}`)}\n`;
const codeBlock = (text) => `\`\`\`${paragraph(text)}\`\`\``;

const body = JSON.stringify(
    {
        fields: {
            project: { key: 'RTI' },
            summary: 'Performance Regression',
            description: `A regression in performance has been detected in the latest build. ${codeBlock(fs.readFileSync(commentText, 'utf8'))}`,
            issuetype: { name: 'Task' },
        },
    },
    null,
    2
);
console.log(body);
// Make the POST request
fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` }, body })
    .then((response) => {
        if (!response.ok) throw new Error(`HTTP error status ${response.status} ${response.statusText}`);
        return response.json();
    })
    .then((data) => console.log('Issue created:', data))
    .catch((error) => console.error('Error creating issue:', error));
