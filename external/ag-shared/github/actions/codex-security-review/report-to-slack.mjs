// Posts the Codex security review results to Slack: one summary message, with every finding
// (at or above MIN_SEVERITY) as a threaded reply.
//
// Reads OUT_DIR/status.jsonl and OUT_DIR/<shard>.json written by run-shards.sh.
// Never prints findings - the workflow log may be public. Slack errors are reported by error code only.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { sendSlackMessage } from '../../../scripts/slack/send-slack-message.mjs';

const { SLACK_BOT_OAUTH_TOKEN, SLACK_CHANNEL, PRODUCT_NAME, OUT_DIR, RUN_URL, GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_REF_NAME } =
    process.env;
const MIN_SEVERITY = process.env.MIN_SEVERITY || 'medium';

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const SEVERITY_EMOJI = { critical: ':red_circle:', high: ':large_orange_circle:', medium: ':large_yellow_circle:', low: ':white_circle:' };
// Slack allows about one message per second per channel, so posts are spaced out. Rate limits and
// transient failures (network errors, Slack outages) are retried. Findings are deleted from the
// runner after this step, so one finding that can't be posted must not stop the others.
const POST_INTERVAL_MS = 1100;
const RATE_LIMIT_BACKOFF_MS = 30_000;
const TRANSIENT_BACKOFF_MS = 10_000;
const MAX_RETRIES = 5;
// Slack Web API errors worth retrying. The shared helper reports a network failure as an error
// starting "Failed to send Slack message".
const TRANSIENT_ERRORS = new Set(['internal_error', 'fatal_error', 'service_unavailable', 'request_timeout']);
// Slack limits a section block to 3000 characters and a header to 150
const MAX_FIELD_LENGTH = 2800;
const MAX_HEADER_LENGTH = 150;

if (!SEVERITIES.includes(MIN_SEVERITY)) {
    console.log(`::error::Unknown min-severity [${MIN_SEVERITY}] - expected one of ${SEVERITIES.join(', ')}`);
    process.exit(1);
}

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const field = (text) => {
    const value = String(text ?? '');
    return escape(value.length > MAX_FIELD_LENGTH ? `${value.slice(0, MAX_FIELD_LENGTH)}…` : value);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastPostAt = 0;

async function post(text, threadTs, blocks) {
    for (let attempt = 0; ; attempt++) {
        await sleep(Math.max(0, lastPostAt + POST_INTERVAL_MS - Date.now()));
        lastPostAt = Date.now();

        const result = await sendSlackMessage({
            authToken: SLACK_BOT_OAUTH_TOKEN,
            data: { channel: SLACK_CHANNEL, text, blocks, thread_ts: threadTs, unfurl_links: false, unfurl_media: false },
        });
        if (result.ok) {
            return result.ts;
        }
        const error = String(result.error ?? 'unknown_error');
        const transient = TRANSIENT_ERRORS.has(error) || error.startsWith('Failed to send Slack message');
        if ((error === 'ratelimited' || transient) && attempt < MAX_RETRIES) {
            const backoff = error === 'ratelimited' ? RATE_LIMIT_BACKOFF_MS : TRANSIENT_BACKOFF_MS;
            console.log(`Slack post failed (${transient ? 'transient error' : error}) - retrying in ${backoff / 1000}s`);
            await sleep(backoff);
            continue;
        }
        // Only the error code: a network error message could echo the request
        throw new Error(`Slack chat.postMessage failed: ${transient ? 'transient error, retries used up' : error}`);
    }
}

const statusFile = join(OUT_DIR, 'status.jsonl');
const statuses = existsSync(statusFile)
    ? readFileSync(statusFile, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line))
    : [];

const findings = [];
for (const { shard, status } of statuses) {
    if (status !== 'ok') {
        continue;
    }
    const result = JSON.parse(readFileSync(join(OUT_DIR, `${shard}.json`), 'utf8'));
    for (const finding of result.findings) {
        findings.push({ ...finding, shard });
    }
}

const reportable = findings
    .filter((f) => SEVERITIES.indexOf(f.severity) <= SEVERITIES.indexOf(MIN_SEVERITY))
    .sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));

const counts = SEVERITIES.map((s) => [s, reportable.filter((f) => f.severity === s).length])
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${s}`)
    .join(', ');
const failed = statuses.filter((s) => s.status !== 'ok');
const shortSha = (GITHUB_SHA || '').slice(0, 10);
const commitUrl = `https://github.com/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}`;

let headline;
if (statuses.length === 0) {
    headline = ':x: The review did not run - see the workflow run.';
} else if (failed.length > 0) {
    // Never a tick here: a failed shard (expired key, used-up quota, timeout) is not a clean result
    headline =
        `:warning: *Incomplete review* - ${failed.length} of ${statuses.length} shard${statuses.length === 1 ? '' : 's'} failed, so findings may be missing. ` +
        (reportable.length === 0
            ? `No findings at ${MIN_SEVERITY} severity or above from the shards that ran.`
            : `*${reportable.length} finding${reportable.length === 1 ? '' : 's'}* (${counts}) from the shards that ran - details in the thread.`);
} else if (reportable.length === 0) {
    headline = `:white_check_mark: No findings at ${MIN_SEVERITY} severity or above.`;
} else {
    headline = `*${reportable.length} finding${reportable.length === 1 ? '' : 's'}* (${counts}) - details in the thread.`;
}

const summary = [
    `:shield: *${escape(PRODUCT_NAME)} Codex security review* on \`${escape(GITHUB_REF_NAME)}\` @ <${commitUrl}|${shortSha}>`,
    headline,
    `Shards reviewed: ${statuses.length - failed.length}/${statuses.length}` +
        (failed.length ? ` - :warning: failed: ${failed.map((s) => `${escape(s.shard)} (${s.status})`).join(', ')}` : ''),
    `<${RUN_URL}|Workflow run>`,
].join('\n');

// Without the summary there is no thread to post findings into, so this failure ends the step
let threadTs;
try {
    threadTs = await post(summary);
} catch (error) {
    console.log(`::error::Could not post the security review report to ${SLACK_CHANNEL}: ${error.message}`);
    process.exit(1);
}

let unsent = 0;
// Older output, or a model that ignores the schema, may give a string instead of a list
const asList = (value) => (Array.isArray(value) ? value : [value]).map((item) => String(item ?? '').trim()).filter(Boolean);
const section = (text) => ({ type: 'section', text: { type: 'mrkdwn', text } });

// Each finding is a header, a context line and one section per part, so it reads at a glance
function findingBlocks(f, file, fileUrl) {
    // Headers are plain text, so backticks would show literally
    const title = `${SEVERITY_EMOJI[f.severity]} ${String(f.title ?? '').replace(/`/g, '')}`;
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                emoji: true,
                text: title.length > MAX_HEADER_LENGTH ? `${title.slice(0, MAX_HEADER_LENGTH - 1)}…` : title,
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `*${f.severity.toUpperCase()}* · ${escape(f.confidence)} confidence · ${field(f.category)} · <${fileUrl}|${escape(file)}:${f.line}> · shard ${escape(f.shard)}`,
                },
            ],
        },
        section(`*What*\n${field(f.description)}`),
        section(`*Exploit*\n${field(asList(f.exploit_scenario).map((step, i) => `${i + 1}. ${step}`).join('\n'))}`),
        section(`*Fix*\n${field(asList(f.recommendation).map((change) => `• ${change}`).join('\n'))}`),
    ];
}

for (const f of reportable) {
    const file = String(f.file).replace(/^\.?\//, '');
    const fileUrl = `https://github.com/${GITHUB_REPOSITORY}/blob/${GITHUB_SHA}/${encodeURI(file)}#L${f.line}`;
    try {
        // text is the notification and fallback; blocks are what the thread shows
        await post(
            `${f.severity.toUpperCase()}: ${field(f.title)} (${escape(file)}:${f.line})`,
            threadTs,
            findingBlocks(f, file, fileUrl)
        );
    } catch (error) {
        unsent++;
        console.log(`::error::Could not post a finding to Slack: ${error.message}`);
    }
}

if (unsent > 0) {
    try {
        await post(
            `:x: ${unsent} of ${reportable.length} findings could not be posted. Re-run the review to get them back.`,
            threadTs
        );
    } catch (error) {
        console.log(`::error::Could not post the unsent-findings notice to Slack: ${error.message}`);
    }
    console.log(`::error::${unsent} of ${reportable.length} findings could not be posted to ${SLACK_CHANNEL}`);
    process.exit(1);
}

console.log(`Posted the security review report to ${SLACK_CHANNEL}`);
