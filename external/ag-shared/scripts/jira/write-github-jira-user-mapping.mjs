import fs from 'node:fs';

import { ghaWarning } from '../slack/_ci-notification-utils.mjs';
import { getSlackUserConfig } from '../slack/get-slack-user-config.mjs';

/**
 * Writes the GitHub login to JIRA user mapping, read from the Notion user directory, to the
 * step's `mapping` output as `{ "<github-login>": ["<jira-account-id>", "<full name>"] }`.
 *
 * Best-effort, like the Slack mentions read from the same directory: on any failure it writes
 * `{}` and a warning, so the JIRA update still runs and names people by GitHub login.
 */
const { NOTION_API_TOKEN, NOTION_DATA_SOURCE_ID, NOTION_API_VERSION, GITHUB_OUTPUT } = process.env;

async function getGithubJiraUserMapping() {
    if (!NOTION_API_TOKEN || !NOTION_DATA_SOURCE_ID) {
        return { error: 'NOTION_API_TOKEN or NOTION_DATA_SOURCE_ID is unset.' };
    }

    const { results, error } = await getSlackUserConfig({
        notionApiToken: NOTION_API_TOKEN,
        notionDataSourceId: NOTION_DATA_SOURCE_ID,
        notionApiVersion: NOTION_API_VERSION || undefined,
    });
    if (error) {
        return { error };
    }
    if (results.every((user) => user.jiraAccountId === undefined)) {
        return { error: 'The Notion user directory has no "Jira Account ID" column.' };
    }

    const mapping = {};
    for (const { github, jiraAccountId, fullName } of results) {
        if (github && jiraAccountId) {
            mapping[github] = [jiraAccountId, fullName ?? github];
        }
    }
    return { mapping };
}

const { mapping, error } = await getGithubJiraUserMapping();
if (error) {
    ghaWarning(`JIRA comments will name people by GitHub login. ${error}`, {
        title: 'GitHub to JIRA user mapping unavailable',
    });
}
const json = JSON.stringify(mapping ?? {});
console.log(`Mapped ${Object.keys(mapping ?? {}).length} GitHub users to JIRA accounts.`);

if (GITHUB_OUTPUT) {
    fs.appendFileSync(GITHUB_OUTPUT, `mapping=${json}\n`);
} else {
    console.log(json);
}
