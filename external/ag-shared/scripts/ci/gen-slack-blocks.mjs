import fs from 'node:fs';

import { ghaWarning } from '../slack/_ci-notification-utils.mjs';
import {
    getPullRequestsInRange,
    isRangeTooWide,
    renderPullRequestBlame,
    renderRangeSummary,
} from '../slack/_pr-blame.mjs';
import { getSlackUserConfig } from '../slack/get-slack-user-config.mjs';
import { getGitDiffLinks, getHeader, getStats, parseCtrfReport } from './_utils.mjs';

const ctrfReportFile = process.env.CTRF_REPORT_FILE;
const workflowName = process.env.WORKFLOW_NAME || '';
const jobId = process.env.JOB_ID || '';
const repoUrl = process.env.REPO_URL || 'https://github.com/ag-grid/ag-grid';
const branchName = process.env.BRANCH_NAME || '';
const channel = process.env.SLACK_CHANNEL || '';
const username = process.env.SLACK_USERNAME || '';
const icon_url = process.env.SLACK_ICON || '';
const currentCommitSha = process.env.CURRENT_COMMIT_SHA || '';
const previousCommitSha = process.env.PREV_COMMIT_SHA || '';
const slackFile = process.env.SLACK_FILE || './slack.json';
const isSuccess = process.env.IS_SUCCESS === 'true';
// Set when the previous run already failed, so the channel has had the full message for this break
// once. A repeat failure is the same break seen again: it gets the header and the counts and
// nothing else, rather than a second round of pings for people who were told the first time.
const isRepeatFailure = process.env.IS_REPEAT_FAILURE === 'true';
const lastFailedStep = process.env.LAST_FAILED_STEP || '';
const library = process.env.AG_LIBRARY;
const repository = process.env.GITHUB_REPOSITORY || '';
const githubToken = process.env.GITHUB_TOKEN || '';
const notionApiToken = process.env.NOTION_API_TOKEN || '';
const notionDataSourceId = process.env.NOTION_DATA_SOURCE_ID || '';
const notionApiVersion = process.env.NOTION_API_VERSION || undefined;

const jobUrl = `${repoUrl}/actions/runs/${jobId}`;

const parsedReport = parseCtrfReport(ctrfReportFile);

const LIBRARY_TITLES = {
    grid: 'AgGrid',
    charts: 'AgCharts',
    studio: 'AgStudio',
};

const title = LIBRARY_TITLES[library] || 'AgGrid';
const header = getHeader({
    isSuccess,
    link: slackLink,
    workflowName,
    jobId,
    jobUrl,
    branchName,
    bold,
    inlineCode,
    lastFailedStep,
    section,
    title,
});
const diffLinks = getGitDiffLinks(
    repoUrl,
    currentCommitSha,
    previousCommitSha,
    context,
    section,
    slackLink,
    parsedReport
);
const statsTemplate = getStats(parsedReport, context);
// Attribution is for failures only. A back-to-green message says the break is over, which is the
// whole of what the channel needs from it, and a repeat failure has already had the full message
// once - so neither spends the API calls, and neither pings anybody.
const blame = isSuccess || isRepeatFailure ? undefined : await getPullRequestBlameSection();
const blocks = isRepeatFailure ? [header, statsTemplate] : [header, statsTemplate, blame, diffLinks];
const content = getSlackMessage(blocks.filter(Boolean));

fs.writeFileSync(slackFile, JSON.stringify(content) + '\n', 'utf8');

/**
 * Names the PRs that landed between the last verified run and this one, so a failure points at
 * the change that could have caused it and reaches its author directly. Failures only - see the
 * caller.
 *
 * Best-effort throughout: the notification is the only signal the channel gets, so a missing
 * token or an unreachable GitHub/Notion drops this section rather than failing the step. Callers
 * that pass no GITHUB_TOKEN - every consumer other than post-deploy verification - get the
 * previous message unchanged.
 */
async function getPullRequestBlameSection() {
    if (!repository || !githubToken || !currentCommitSha || !previousCommitSha) {
        return undefined;
    }
    try {
        const { pullRequests, totalCommits } = await getPullRequestsInRange({
            repository,
            token: githubToken,
            baseSha: previousCommitSha,
            currentSha: currentCommitSha,
        });
        if (totalCommits === 0) {
            return undefined;
        }
        const tooWide = isRangeTooWide({ pullRequests, totalCommits });
        // The user directory is only fetched on the path that names people, so neither a range
        // reported as a count nor one that resolved to no pull request costs a Notion request on
        // top of the lookups it already skipped.
        const blame =
            tooWide || pullRequests.length === 0
                ? undefined
                : renderPullRequestBlame({ pullRequests, users: await getUsers() });
        // Passed on rather than re-derived in the renderer, which cannot tell an oversized range
        // from one that simply resolved to no pull request: both arrive with an empty list.
        return section(blame ?? renderRangeSummary({ totalCommits, tooWide }));
    } catch (error) {
        ghaWarning(`Could not work out which PRs are in this range: ${error.message}`, {
            title: 'PR attribution unavailable',
        });
        return undefined;
    }
}

/** The Notion-backed GitHub-login to Slack-ID directory; empty means authors are named by login. */
async function getUsers() {
    if (!notionApiToken || !notionDataSourceId) {
        ghaWarning(
            'NOTION_API_TOKEN / NOTION_DATA_SOURCE_ID are unset, so PR authors are listed by GitHub username instead of being @-mentioned.',
            { title: 'Slack user directory unavailable' }
        );
        return [];
    }
    const { results, error } = await getSlackUserConfig({
        notionApiToken,
        notionDataSourceId,
        notionApiVersion,
    });
    if (error) {
        ghaWarning(`Could not fetch the Slack user directory from Notion: ${error}`, {
            title: 'Slack user directory unavailable',
        });
        return [];
    }
    return results;
}

function slackLink(text, url) {
    return `<${url}|${text}>`;
}

function context(text) {
    return { type: 'context', elements: [{ type: 'plain_text', text: text, emoji: true }] };
}

function bold(text) {
    return `*${text}*`;
}

function section(text) {
    return { type: 'section', text: { type: 'mrkdwn', text } };
}

function getSlackMessage(blocks) {
    return { channel, username, icon_url, blocks };
}

function inlineCode(text) {
    return `\`${text}\``;
}
