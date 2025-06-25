#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const jiraBaseUrl = 'https://ag-grid.atlassian.net/rest/api/2';
const auth = process.env.JIRA_API_AUTH;
if (!auth) {
    console.error('JIRA_API_AUTH environment variable must be set.');
    process.exit(1);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..', '..');
const jiraFilePath = process.env.JIRA_FILE || path.join(__root, 'jira.json');
if (!fs.existsSync(jiraFilePath)) {
    console.error(`JIRA file not found: ${process.env.JIRA_FILE || './jira.json'}`);
    process.exit(1);
}
const COLUMN_TODO_ID = '21';

const jiraFileContent = fs.readFileSync(jiraFilePath, 'utf8');

if (!jiraFileContent) {
    console.error('JIRA file is empty or not readable.');
    process.exit(1);
}
const jiraFileContentParsed = JSON.parse(jiraFileContent);
if (!jiraFileContentParsed?.text || !jiraFileContentParsed?.fingerprint) {
    console.error('Invalid JIRA file content. Ensure it contains "text" and "fingerprint".');
    process.exit(1);
}

const jiraLink = (text, url) => `[${text}|${url}]`;
const automatedMessage = `[This issue/comment was ${jiraLink(
    'automatically created',
    'https://github.com/ag-grid/ag-grid/blob/latest/.github/workflows/benchmark.yml#L232'
)} by the AG Grid performance regression test]`;
createIssue()
    .then((r) => console.log('Issue created successfully:', r))
    .catch((error) => console.error('Error creating issue:', error));

async function createIssue() {
    const existingIssue = await findExistingIssue(jiraFileContentParsed.fingerprint);

    if (existingIssue) {
        // If an existing issue is found, add a comment and reopen it
        console.log(`Duplicate issue found: ${existingIssue.key}. Adding comment...`);

        try {
            // Step 1: Add a comment to the issue
            await addComment(
                existingIssue.key,
                `New failure detected:\n\n${jiraFileContentParsed.text}\n\n${automatedMessage}`
            );

            // Step 2: Reopen the issue if it's not already open
            const status = existingIssue.fields.status.name.toUpperCase();
            if (status === 'DONE') {
                console.log(`Reopening issue ${existingIssue.key} from status "${status}" to "TODO"`);
                await transitionIssue(existingIssue.key, COLUMN_TODO_ID);
            }

            // Skip creating a new issue
            process.exit(0);
        } catch (err) {
            console.error('Error updating existing JIRA issue:', err.message);
            process.exit(1);
        }
    }

    const body = {
        fields: {
            project: { key: 'RTI' },
            summary: '[NR] CI/CD detected a slowdown in grid performance',
            description: `A regression in performance has been detected in the latest build.\n${jiraFileContentParsed.text}\n\n${automatedMessage}`,
            issuetype: { name: 'Bug' },
            customfield_10675: jiraFileContentParsed.fingerprint,
        },
    };
    console.log('Creating JIRA issue...', body);
    return fetch(`${jiraBaseUrl}/issue/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify(body),
    }).then(async (response) => {
        if (!response.ok)
            throw new Error(`HTTP error status ${response.status} ${response.statusText} ${await response.text()}`);
        return response.json();
    });
}

async function findExistingIssue(hash) {
    const jqlQuery = `"Fingerprint[Short text]" ~ '${hash}' AND type = Bug AND project = RTI`;

    const url = `${jiraBaseUrl}/search?jql=${encodeURIComponent(jqlQuery)}&maxResults=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            throw new Error(
                `JIRA search error: ${response.status} - ${response.statusText} - ${await response.text()}`
            );
        }

        const data = await response.json();
        return data.issues.length > 0 ? data.issues[0] : null;
    } catch (error) {
        console.error('Error searching JIRA for duplicates:', error.message);
        return null; // Fail safe: proceed to create if search fails
    }
}

// Add a comment to an issue
async function addComment(issueKey, body) {
    const url = `${jiraBaseUrl}/issue/${issueKey}/comment`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({ body }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to add comment to issue ${issueKey}: ${response.status} - ${await response.text()}`
            );
        }

        console.log(`Added comment to issue ${issueKey}`);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
}

// Transition an issue to a new status
async function transitionIssue(issueKey, transitionId) {
    const url = `${jiraBaseUrl}/issue/${issueKey}/transitions`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                transition: { id: transitionId },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to transition issue ${issueKey}: ${response.status} - ${await response.text()}`);
        }

        console.log(`Issue ${issueKey} transitioned successfully`);
    } catch (error) {
        console.error('Error transitioning issue:', error.message);
        throw error;
    }
}
