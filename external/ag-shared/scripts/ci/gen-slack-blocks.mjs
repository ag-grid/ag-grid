import fs from 'node:fs';

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
const lastFailedStep = process.env.LAST_FAILED_STEP || '';
const library = process.env.AG_LIBRARY;

const jobUrl = `${repoUrl}/actions/runs/${jobId}`;

const parsedReport = parseCtrfReport(ctrfReportFile);

const title = library === 'grid' ? 'AgGrid' : 'AgCharts';
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
const content = getSlackMessage([header, statsTemplate, diffLinks].filter(Boolean));

fs.writeFileSync(slackFile, JSON.stringify(content) + '\n', 'utf8');

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
