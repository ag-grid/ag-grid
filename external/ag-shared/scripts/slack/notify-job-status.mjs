import { getSlackUserConfig } from './get-slack-user-config.mjs';
import { sendSlackMessage } from './send-slack-message.mjs';
import {
    deriveStatus,
    getBranchLink,
    getChangesData,
    getEmoji,
    getGitChanges,
    getJobStatusSummary,
    getRunUrl,
} from './_ci-notification-utils.mjs';

const {
    SLACK_BOT_OAUTH_TOKEN,
    NOTION_API_TOKEN,
    NOTION_DATA_SOURCE_ID,
    NOTION_API_VERSION,
    AG_PROJECT,
    RUN_ID,
    WORKFLOW,
    REF,
    CURRENT_SHA,
    LAST_SUCCESSFUL_SHA,
    TEAM_CHANNEL,
    DEBUG_CHANNEL,
    JOB_STATUSES,
    CHANGED_STATE,
    REPORT_URL,
} = process.env;

const required = { SLACK_BOT_OAUTH_TOKEN, NOTION_API_TOKEN, NOTION_DATA_SOURCE_ID, AG_PROJECT, RUN_ID, CURRENT_SHA, LAST_SUCCESSFUL_SHA, JOB_STATUSES };
for (const [name, value] of Object.entries(required)) {
    if (!value) {
        console.error(`Error: ${name} environment variable is not set.`);
        process.exit(1);
    }
}

const THREAD_DEBUG_RAW = true;

(async () => {
    const jobStatuses = JSON.parse(JOB_STATUSES);
    const status = deriveStatus(jobStatuses);
    const changedState = CHANGED_STATE === 'true';

    const { results: users, error } = await getSlackUserConfig({
        notionApiToken: NOTION_API_TOKEN,
        notionDataSourceId: NOTION_DATA_SOURCE_ID,
        notionApiVersion: NOTION_API_VERSION,
    });
    if (error) {
        console.error('Error fetching Slack user config:', error);
        process.exit(1);
    }

    const changes = getGitChanges(CURRENT_SHA, LAST_SUCCESSFUL_SHA, users);

    const ctx = {
        project: AG_PROJECT,
        runId: RUN_ID,
        workflow: WORKFLOW,
        ref: REF,
        currentSha: CURRENT_SHA,
        lastSuccessfulSha: LAST_SUCCESSFUL_SHA,
        status,
        changedState,
        jobStatuses,
        reportUrl: REPORT_URL || '',
    };

    // Debug channel: always send, regardless of changedState, with raw JSON threads.
    if (DEBUG_CHANNEL) {
        const debugResp = await sendStatusMessage({ channel: DEBUG_CHANNEL, ctx, changes, users, userDisplayType: 'debug' });
        if (THREAD_DEBUG_RAW && debugResp?.ts) {
            await sendCodeBlock({ channel: DEBUG_CHANNEL, threadTs: debugResp.ts, label: 'Run context', code: JSON.stringify(ctx, null, 2) });
            await sendCodeBlock({ channel: DEBUG_CHANNEL, threadTs: debugResp.ts, label: 'Detected changes', code: JSON.stringify(changes, null, 2) });
        }
    }

    // Team channel: only when the status changed since the last run.
    if (changedState && TEAM_CHANNEL) {
        await sendStatusMessage({ channel: TEAM_CHANNEL, ctx, changes, users, userDisplayType: 'slack' });
    }
})();

async function sendStatusMessage({ channel, ctx, changes, users, userDisplayType }) {
    if (ctx.status === 'failure') {
        return sendFailureMessage({ channel, ctx, changes, users, userDisplayType });
    }
    return sendSuccessMessage({ channel, ctx, changes, users, userDisplayType });
}

async function sendFailureMessage({ channel, ctx, changes, users, userDisplayType }) {
    const branchLink = getBranchLink(ctx.ref, ctx.project);
    const branchDetails = branchLink ? ` (on ${branchLink})` : '';
    const { changesText } = getChangesData({
        currentSha: ctx.currentSha,
        lastSuccessfulSha: ctx.lastSuccessfulSha,
        project: ctx.project,
        gitChanges: changes,
        userDisplayTypeSetting: userDisplayType,
        users,
    });
    const testReportUrl = ctx.reportUrl ? `(<${ctx.reportUrl}|Test Results>)` : '';
    const emoji = getEmoji(ctx.project);
    const webUrl = getRunUrl(ctx.project, ctx.runId);

    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:x: ${emoji} ${ctx.project} / <${webUrl} | ${ctx.workflow} #${ctx.runId}>${branchDetails} *failed* ${testReportUrl}\n${getJobStatusSummary(ctx.jobStatuses)}`,
            },
        },
        {
            type: 'section',
            text: { type: 'mrkdwn', text: changesText },
        },
    ];

    return sendSlackMessage({
        authToken: SLACK_BOT_OAUTH_TOKEN,
        data: { channel, blocks, unfurl_links: false },
    });
}

async function sendSuccessMessage({ channel, ctx, changes, users, userDisplayType }) {
    const branchLink = getBranchLink(ctx.ref, ctx.project);
    const branchDetails = branchLink ? ` (on ${branchLink})` : '';
    const { changesText } = getChangesData({
        currentSha: ctx.currentSha,
        lastSuccessfulSha: ctx.lastSuccessfulSha,
        project: ctx.project,
        gitChanges: changes,
        userDisplayTypeSetting: userDisplayType,
        users,
    });
    const emoji = getEmoji(ctx.project);
    const webUrl = getRunUrl(ctx.project, ctx.runId);

    const text = `:white_check_mark: ${emoji} ${ctx.project} / <${webUrl} | ${ctx.workflow} #${ctx.runId}>${branchDetails} successful\n${getJobStatusSummary(ctx.jobStatuses)}\n${changesText}`;

    return sendSlackMessage({
        authToken: SLACK_BOT_OAUTH_TOKEN,
        data: { channel, text, unfurl_links: false },
    });
}

async function sendCodeBlock({ channel, threadTs, label, code }) {
    return sendSlackMessage({
        authToken: SLACK_BOT_OAUTH_TOKEN,
        data: {
            channel,
            text: `${label}:\n\`\`\`${code}\n\`\`\``,
            thread_ts: threadTs,
        },
    });
}
