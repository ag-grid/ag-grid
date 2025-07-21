#!/usr/bin/env node
import { addJiraComment, commonFetch, transitionJiraIssue } from './_utils.mjs';

const TRANSITIONS = [
    { id: '21', name: 'TODO' },
    { id: '31', name: 'IN PROGRESS' },
    { id: '51', name: 'READY TO REVIEW' },
    { id: '3', name: 'REVIEWED' },
    // { id: '6', name: 'Reviewed to Pending RC' }, // unused
    { id: '4', name: 'PENDING RC' },
    { id: '5', name: 'READY TO VERIFY' },
    { id: '8', name: 'TESTS PASSED' },
    { id: '11', name: 'POST RELEASE' },
];
const QA_INDEX = TRANSITIONS.findIndex((tr) => tr.name === 'READY TO VERIFY');
const TRANSITIONS_MAP = TRANSITIONS.reduce(
    (acc, el) => Object.assign(acc, { [el.name.toUpperCase()]: el, [el.id]: el }),
    {}
);
const PROJECT_ID = 'RTI';
const CUSTOM_FIELD_FINGERPRINT = 'customfield_10708'; // Fingerprint[Short text]
const JIRA_API_URL = 'https://ag-grid.atlassian.net/rest/api/2';
const ACTION_URL = 'https://github.com/ag-grid/ag-grid/blob/latest/.github/actions/jira-integration/action.yml';
const AUTOMATED_REGRESSION_CHAMP_USER_IDS = [
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
const paragraph = (content) => ({
    type: 'paragraph',
    content: Array.isArray(content) ? content : [content],
});
const txt = (text, marks = []) => {
    if (marks.length) {
        return { text, type: 'text', marks };
    }
    return { text, type: 'text' };
};
const link = (text, url) => ({
    type: 'text',
    text: text,
    marks: [{ type: 'link', attrs: { href: url, title: text } }],
});
const AUTOMATED_MESSAGE = [
    paragraph([
        txt(`[This issue/comment was `),
        link('automatically created', ACTION_URL),
        txt(' by the AG Grid CI workflow.]'),
    ]),
];
const workflowName = process.env.WORKFLOW_NAME || 'Unknown';
const description = process.env.JIRA_DESCRIPTION || `Please provide a description in workflow file '${workflowName}'`;
const summary = process.env.JIRA_SUMMARY || `[NR] CI/CD workflow '${workflowName}' has failed`;
const isSuccess = process.env.IS_SUCCESS === 'true';

if (isSuccess) {
    await findExistingJiraIssue(fingerprint).then(async (existingIssue) => {
        if (!existingIssue) {
            console.log('No existing issue found. Nothing to do...');
            process.exit(0);
        }
        if (TRANSITIONS.findIndex((tr) => existingIssue.fields.status.name.toUpperCase() === tr.name) < QA_INDEX) {
            console.log(`IS_SUCCESS is true, transitioning issue ${existingIssue.key} to QA...`);
            await transitionJiraIssue(existingIssue, TRANSITIONS_MAP['READY TO VERIFY'].id);
            await addJiraComment(existingIssue.key, {
                content: [
                    paragraph([txt(`Transitioned to ${TRANSITIONS_MAP['READY TO VERIFY'].name}.`)]),
                    AUTOMATED_MESSAGE,
                ],
                type: 'doc',
                version: 1,
            });
        } else {
            console.log(`IS_SUCCESS is true, but issue ${existingIssue.key} is already in QA or beyond.`);
        }
        process.exit(0);
    });
} else {
    await findExistingJiraIssue(fingerprint).then(async (existingIssue) => {
        if (!existingIssue) {
            // If no existing issue is found, create a new one
            console.log('No existing issue found. Creating a new issue...');
            return createJiraIssue();
        }
        // If an existing issue is found, add a comment and reopen it
        console.log(`Duplicate issue found: ${existingIssue.key}. Adding comment...`);

        // Step 2: Reopen the issue if it's not already open
        const status = existingIssue.fields.status.name.toUpperCase();
        const shouldAddComment = status === TRANSITIONS_MAP['READY TO VERIFY'].name;
        const promises = [
            // Step 1: Add a comment to the issue
            addJiraComment(existingIssue.key, {
                content: [
                    paragraph([
                        txt(
                            `New failure detected${shouldAddComment ? ', reopening this issue' : ''}:\n\n${description}`
                        ),
                    ]),
                    AUTOMATED_MESSAGE,
                ],
                type: 'doc',
                version: 1,
            }),
        ];

        if (shouldAddComment) {
            console.log(
                `Reopening issue ${existingIssue.key} from status "${status}" to "${TRANSITIONS_MAP['TODO'].name}"`
            );
            promises.push(transitionJiraIssue(existingIssue, TRANSITIONS_MAP['TODO'].id));
        }
        await Promise.all(promises).catch((error) => {
            console.error('Error processing existing issue:', error);
            throw error;
        });
        process.exit(0);
    });
}

async function createJiraIssue() {
    const body = {
        fields: {
            project: { key: PROJECT_ID },
            summary: summary,
            description: description + `\n\nNo QA needed\n\n${AUTOMATED_MESSAGE}`,
            issuetype: { name: 'Bug' },
            assignee: {
                accountId:
                    AUTOMATED_REGRESSION_CHAMP_USER_IDS[
                        Math.floor(Math.random() * AUTOMATED_REGRESSION_CHAMP_USER_IDS.length)
                    ],
            },
            [CUSTOM_FIELD_FINGERPRINT]: fingerprint,
        },
    };
    console.log('Creating JIRA issue...', body);
    return commonFetch(`${JIRA_API_URL}/issue/`, { method: 'POST', body: JSON.stringify(body) })
        .then((r) => console.log('Issue created successfully:', r))
        .catch((error) => console.error('Error creating issue:', error));
}

async function findExistingJiraIssue(hash) {
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
