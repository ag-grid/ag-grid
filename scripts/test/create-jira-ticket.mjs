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
const IS_SUCCESS = process.env.IS_SUCCESS;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..', '..');
const jiraFilePath = process.env.JIRA_FILE || path.join(__root, 'jira.json');
if (!fs.existsSync(jiraFilePath)) {
    console.error(`JIRA file not found: ${process.env.JIRA_FILE || './jira.json'}`);
    process.exit(1);
}
const COLUMN_BACKLOG_ID = '21';
const COLUMN_BACKLOG_NAME = 'TODO';
const COLUMN_QA_ID = '5';
const COLUMN_QA_NAME = 'READY TO VERIFY';
const PROJECT_ID = 'RTI';
const _GRID_PERFORMANCE_ITEMS_TICKET_ID = '38254'; // AG-8145
const CUSTOM_FIELD_FINGERPRINT = 'customfield_10708'; // Fingerprint[Short text]

const PERFORMANCE_CHAMP_USER_IDS = [
    /** Victor */ '712020:d433cc4b-4581-4385-8e04-7d11157ef90d',
    /** Stephen */ '60e4746bcf1849006a2c3141',
];
const _CUSTOM_FIELD_TRACK = 'customfield_10501'; // Track[Multi-select list]

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

if (IS_SUCCESS) {
    await findExistingIssue(jiraFileContentParsed.fingerprint).then(async (existingIssue) => {
        if (!existingIssue) {
            console.log('No existing issue found. Nothing to do...');
            return;
        }
        console.log(`IS_SUCCESS is true, transitioning issue ${existingIssue.key} to QA...`);
        return transitionIssue(existingIssue, COLUMN_QA_ID);
    });
} else {
    await findExistingIssue(jiraFileContentParsed.fingerprint).then((existingIssue) => {
        if (!existingIssue) {
            // If no existing issue is found, create a new one
            console.log('No existing issue found. Creating a new issue...');
            return createIssue()
                .then((r) => console.log('Issue created successfully:', r))
                .catch((error) => console.error('Error creating issue:', error));
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
                `New failure detected${shouldAddComment ? ', reopening this issue' : ''}:\n\n${jiraFileContentParsed.text}\n\n${automatedMessage}`
            ),
        ];

        if (shouldAddComment) {
            console.log(`Reopening issue ${existingIssue.key} from status "${status}" to "${COLUMN_BACKLOG_NAME}"`);
            promises.push(transitionIssue(existingIssue, COLUMN_BACKLOG_ID));
        }
        return Promise.all(promises).catch((error) => {
            console.error('Error processing existing issue:', error);
            throw error;
        });
    });
}

async function updateIssue(issueKey, body) {
    const url = `${jiraBaseUrl}/issue/${issueKey}`;
    try {
        await commonFetch(url, { method: 'PUT', body: JSON.stringify(body) });
        console.log(`Issue ${issueKey} updated successfully`);
    } catch (error) {
        console.error('Error updating issue:', error.message);
        throw error;
    }
}

async function createIssue() {
    const body = {
        fields: {
            project: { key: PROJECT_ID },
            summary: '[NR] CI/CD detected a slowdown in grid performance',
            description: `A regression in performance has been detected in the latest build.\n${jiraFileContentParsed.text}\n\n${automatedMessage}`,
            issuetype: { name: 'Bug' },
            assignee: {
                accountId: PERFORMANCE_CHAMP_USER_IDS[Math.floor(Math.random() * PERFORMANCE_CHAMP_USER_IDS.length)],
            },
            [CUSTOM_FIELD_FINGERPRINT]: jiraFileContentParsed.fingerprint,
            // [CUSTOM_FIELD_TRACK]: [{ value: 'Bug' }],
            // components: [{ name: 'Grid' }],
            labels: ['in_kanban'],
            // parent: {
            //     id: GRID_PERFORMANCE_ITEMS_TICKET_ID,
            // },
        },
    };
    console.log('Creating JIRA issue...', body);
    return commonFetch(`${jiraBaseUrl}/issue/`, { method: 'POST', body: JSON.stringify(body) });
}

async function findExistingIssue(hash) {
    // Search for existing issues with the given fingerprint
    const jqlQuery = `"Fingerprint[Short text]" ~ '${hash}' AND type = Bug AND project = ${PROJECT_ID} AND fixVersion is EMPTY`;

    const url = `${jiraBaseUrl}/search?jql=${encodeURIComponent(jqlQuery)}&maxResults=1`;

    try {
        const data = await commonFetch(url, { method: 'GET' });
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
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ body }) });
        console.log(`Added comment to issue ${issueKey}`);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
}

// Transition an issue to a new status
async function transitionIssue(issue, transitionId) {
    const url = `${jiraBaseUrl}/issue/${issue.key}/transitions`;
    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ transition: { id: transitionId } }) });
        await updateIssue(issue.key, { fields: { assignee: { accountId: issue.fields.assignee.accountId } } });
        console.log(`Issue ${issue.key} transitioned successfully`);
    } catch (error) {
        console.error('Error transitioning issue:', error.message);
        throw error;
    }
}

// Debugging function to get available transitions for an issue
async function _getTransitions(issueKey) {
    const url = `${jiraBaseUrl}/issue/${issueKey}/transitions`;
    try {
        const data = await commonFetch(url, { method: 'GET' });
        return data.transitions;
    } catch (error) {
        console.error('Error fetching transitions:', error.message);
        throw error;
    }
}

async function commonFetch(url, options) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
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
