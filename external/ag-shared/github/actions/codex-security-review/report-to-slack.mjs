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
// Slack allows about one message per second per channel, so posts are spaced out, and rate-limited
// posts are retried. Findings are deleted from the runner after this step, so a post that gives up
// loses them.
const POST_INTERVAL_MS = 1100;
const RATE_LIMIT_BACKOFF_MS = 30_000;
const MAX_RATE_LIMIT_RETRIES = 5;

if (!SEVERITIES.includes(MIN_SEVERITY)) {
    console.log(`::error::Unknown min-severity [${MIN_SEVERITY}] - expected one of ${SEVERITIES.join(', ')}`);
    process.exit(1);
}

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastPostAt = 0;

async function post(text, threadTs) {
    for (let attempt = 0; ; attempt++) {
        await sleep(Math.max(0, lastPostAt + POST_INTERVAL_MS - Date.now()));
        lastPostAt = Date.now();

        const result = await sendSlackMessage({
            authToken: SLACK_BOT_OAUTH_TOKEN,
            data: { channel: SLACK_CHANNEL, text, thread_ts: threadTs, unfurl_links: false, unfurl_media: false },
        });
        if (result.ok) {
            return result.ts;
        }
        if (result.error === 'ratelimited' && attempt < MAX_RATE_LIMIT_RETRIES) {
            console.log(`Slack rate limited the report - retrying in ${RATE_LIMIT_BACKOFF_MS / 1000}s`);
            await sleep(RATE_LIMIT_BACKOFF_MS);
            continue;
        }
        throw new Error(`Slack chat.postMessage failed: ${result.error}`);
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

const summary = [
    `:shield: *${escape(PRODUCT_NAME)} Codex security review* on \`${escape(GITHUB_REF_NAME)}\` @ <${commitUrl}|${shortSha}>`,
    statuses.length === 0
        ? ':x: The review did not run - see the workflow run.'
        : reportable.length === 0
          ? `:white_check_mark: No findings at ${MIN_SEVERITY} severity or above.`
          : `*${reportable.length} finding${reportable.length === 1 ? '' : 's'}* (${counts}) - details in the thread.`,
    `Shards reviewed: ${statuses.length - failed.length}/${statuses.length}` +
        (failed.length ? ` - :warning: failed: ${failed.map((s) => `${escape(s.shard)} (${s.status})`).join(', ')}` : ''),
    `<${RUN_URL}|Workflow run>`,
].join('\n');

const threadTs = await post(summary);

for (const f of reportable) {
    const fileUrl = `https://github.com/${GITHUB_REPOSITORY}/blob/${GITHUB_SHA}/${f.file}#L${f.line}`;
    await post(
        [
            `${SEVERITY_EMOJI[f.severity]} *${f.severity.toUpperCase()}* (${f.confidence} confidence) - ${escape(f.category)}`,
            `*${escape(f.title)}*`,
            `<${fileUrl}|${escape(f.file)}:${f.line}> (shard: ${escape(f.shard)})`,
            '',
            `*What:* ${escape(f.description)}`,
            `*Exploit:* ${escape(f.exploit_scenario)}`,
            `*Fix:* ${escape(f.recommendation)}`,
        ].join('\n'),
        threadTs
    );
}

console.log(`Posted the security review report to ${SLACK_CHANNEL}`);
