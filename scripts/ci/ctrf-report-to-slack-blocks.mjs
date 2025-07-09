import fs from 'node:fs';

const rawReportFile = process.env.CTRF_REPORT_FILE || './ctrf-report.json';
const jobID = process.env.JOB_ID || '';
const jobName = process.env.JOB_NAME || '';
const repoUrl = process.env.REPO_URL || '';
const branchName = process.env.BRANCH_NAME || '';
const channel = process.env.SLACK_CHANNEL || '';
const username = process.env.SLACK_USERNAME || '';
const icon_url = process.env.SLACK_ICON || '';
const currentCommitSha = process.env.COMMIT_SHA || '';
const previousCommitShaFile = process.env.COMMIT_SHA_FILE || './commit-sha.txt';
const slackFile = process.env.SLACK_FILE || './slack.json';

const jobUrl = `${repoUrl}/actions/runs/${jobID}`;

let rawReport;

try {
    rawReport = fs.readFileSync(rawReportFile, 'utf8').trim();
    if (!rawReport) {
        throw new Error(`Report file ${rawReportFile} is empty.`);
    }
} catch (error) {
    console.error(`Failed to read CTRF report from ${rawReportFile}:`, error);
    process.exit(1);
}

console.log('Converting CTRF report to Slack blocks...');
let parsedReport;
try {
    parsedReport = JSON.parse(rawReport).results.summary;
} catch (error) {
    console.error('Failed to parse CTRF report:', rawReport, error);
    process.exit(1);
}
const isSuccess = parsedReport.extra?.result === 'passed' || parsedReport.failed === 0;

let previousCommitSha = '';
try {
    previousCommitSha = fs.readFileSync(previousCommitShaFile, 'utf8').trim();
} catch (error) {
    console.error(`Failed to read previous commit SHA from ${previousCommitShaFile}:`, error);
}

const headerTemplate = `${isSuccess ? '✅' : '❌'} AgGrid / ${slackLink(`${jobName} #${jobID}`, jobUrl)} run (on ${branchName}) ${bold(isSuccess ? 'is successful' : 'failed')}`;

const statsString = ['failed', 'passed', 'skipped']
    .filter((n) => parsedReport[n])
    .map(renderStat)
    .join(', ');
const statsTemplate = `Status: Tests ${statsString}`;
const blocks = [section(headerTemplate), context(statsTemplate), getGitDiffLink()];
const slackMsg = getSlackMessage(blocks);
fs.writeFileSync(slackFile, `${JSON.stringify(slackMsg)}\n`, 'utf8');

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

function renderStat(statKey) {
    return `${statKey}: ${parsedReport[statKey]}${statKey === 'failed' ? ` (${parsedReport.extra?.failRateChange} new)` : ''}`;
}

function getGitDiffLink() {
    if (!repoUrl || !currentCommitSha || !previousCommitSha) {
        return context('No git diff available');
    }

    if (previousCommitSha === currentCommitSha) {
        return context('No new changes');
    }

    return section(
        slackLink('Git diff', `${repoUrl}/compare/${previousCommitSha.slice(0, 7)}...${currentCommitSha.slice(0, 7)}`)
    );
}
