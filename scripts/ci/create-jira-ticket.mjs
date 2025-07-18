#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { commonFetch, transitionIssue } from './_utils.mjs';

const COLUMN_BACKLOG_ID = '21';
const COLUMN_BACKLOG_NAME = 'TODO';
const COLUMN_QA_ID = '5';
const COLUMN_QA_NAME = 'READY TO VERIFY';
const PROJECT_ID = 'RTI';
const CUSTOM_FIELD_FINGERPRINT = 'customfield_10708'; // Fingerprint[Short text]
const JIRA_API_URL = 'https://ag-grid.atlassian.net/rest/api/2';
const ACTION_URL = 'https://github.com/ag-grid/ag-grid/blob/latest/.github/actions/jira-integration/action.yml';
const AUTOMATED_MESSAGE = `[This issue/comment was ${jiraLink('automatically created', ACTION_URL)} by the AG Grid CI workflow]`;
const PERFORMANCE_CHAMP_USER_IDS = [
    /** Victor */ '712020:d433cc4b-4581-4385-8e04-7d11157ef90d',
    /** Stephen */ '60e4746bcf1849006a2c3141',
];

const fingerprint = process.env.JIRA_FINGERPRINT;
const auth = process.env.JIRA_API_AUTH;
if (!fingerprint) {
    console.error('JIRA_FINGERPRINT environment variable must be set.');
    process.exit(1);
}
if (!auth) {
    console.error('JIRA_API_AUTH environment variable must be set.');
    process.exit(1);
}

const workflowName = process.env.WORKFLOW_NAME || 'Unknown';
const description = process.env.JIRA_DESCRIPTION || `Please provide a description in workflow file '${workflowName}'`;
const summary = process.env.JIRA_SUMMARY || `[NR] CI/CD workflow '${workflowName}' has failed`;
const isSuccess = process.env.IS_SUCCESS === 'true';

if (isSuccess) {
    await findExistingIssue(fingerprint).then(async (existingIssue) => {
        if (!existingIssue) {
            console.log('No existing issue found. Nothing to do...');
            process.exit(0);
        }
        console.log(`IS_SUCCESS is true, transitioning issue ${existingIssue.key} to QA...`);
        await transitionIssue(existingIssue, COLUMN_QA_ID);
        process.exit(0);
    });
}

await findExistingIssue(fingerprint).then(async (existingIssue) => {
    if (!existingIssue) {
        // If no existing issue is found, create a new one
        console.log('No existing issue found. Creating a new issue...');
        return createIssue();
    }
    // If an existing issue is found, add a comment and reopen it
    console.log(`Duplicate issue found: ${existingIssue.key}. Adding comment...`);

    // Step 2: Reopen the issue if it's not already open
    const status = existingIssue.fields.status.name.toUpperCase();
    const shouldAddComment = status === COLUMN_QA_NAME;
    const promises = [
        // Step 1: Add a comment to the issue
        addComment(
            existingIssue.key,
            `New failure detected${shouldAddComment ? ', reopening this issue' : ''}:\n\n${description}\n\n${AUTOMATED_MESSAGE}`
        ),
    ];

    if (shouldAddComment) {
        console.log(`Reopening issue ${existingIssue.key} from status "${status}" to "${COLUMN_BACKLOG_NAME}"`);
        promises.push(transitionIssue(existingIssue, COLUMN_BACKLOG_ID));
    }
    await Promise.all(promises).catch((error) => {
        console.error('Error processing existing issue:', error);
        throw error;
    });
    process.exit(0);
});

async function createIssue() {
    const body = {
        fields: {
            project: { key: PROJECT_ID },
            summary: summary,
            description: description + `\n\nNo QA needed\n\n${AUTOMATED_MESSAGE}`,
            issuetype: { name: 'Bug' },
            assignee: {
                accountId: PERFORMANCE_CHAMP_USER_IDS[Math.floor(Math.random() * PERFORMANCE_CHAMP_USER_IDS.length)],
            },
            [CUSTOM_FIELD_FINGERPRINT]: fingerprint,
            labels: ['in_kanban'],
        },
    };
    console.log('Creating JIRA issue...', body);
    return commonFetch(`${JIRA_API_URL}/issue/`, { method: 'POST', body: JSON.stringify(body) })
        .then((r) => console.log('Issue created successfully:', r))
        .catch((error) => console.error('Error creating issue:', error));
}

async function findExistingIssue(hash) {
    // Search for existing issues with the given fingerprint
    const jqlQuery = `"Fingerprint[Short text]" ~ '${hash}' AND type = Bug AND project = ${PROJECT_ID} AND fixVersion is EMPTY`;

    const url = `${JIRA_API_URL}/search?jql=${encodeURIComponent(jqlQuery)}&maxResults=1`;

    try {
        const data = await commonFetch(url, { method: 'GET' });
        return data.issues.length > 0 ? data.issues[0] : null;
    } catch (error) {
        console.error('Error searching JIRA for duplicates:', error.message);
        return null; // Fail-safe: proceed to create if search fails
    }
}

// Add a comment to an issue
async function addComment(issueKey, body) {
    const url = `${JIRA_API_URL}/issue/${issueKey}/comment`;

    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ body }) });
        console.log(`Added comment to issue ${issueKey}`);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
}

function jiraLink(text, url) {
    return `[${text}|${url}]`;
}
