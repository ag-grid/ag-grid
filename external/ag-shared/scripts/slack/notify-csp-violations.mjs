/**
 * Reports the CSP violations a post-deploy page-verification run found to the channel that owns
 * the policy, and annotates the CI run. Violations are not a build gate: a policy hash goes
 * stale whenever a tag is edited in Google Tag Manager, which is nobody's build break but does
 * need fixing, so this notifies the owning team instead of failing the run.
 *
 * Posts only when the violation set has changed against the previous run's report, so a policy
 * that stays broken for a week does not repeat itself on every deploy. The channel sees a single
 * headline (count, how many are new, links); the individual violations go into a thread under
 * it, so a bad deploy does not fill the channel. Exits non-zero only when Slack itself rejects a
 * message.
 *
 * A baseline is only usable if it describes the same site, and only a complete run can say a
 * violation is gone: a run that died mid-suite reports fewer violations than the site has, which
 * would otherwise read as a policy being fixed. Set RUN_COMPLETE=false for such a run and it will
 * still report anything new, without claiming anything was resolved.
 *
 * A violation the suite marked `accepted` — one the policy knowingly produces and will not be
 * changed to fix, with the reason carried on the record — is neither counted nor diffed. It is
 * listed in the step summary so the decision stays visible, and never posted to Slack.
 *
 * Expects a report as written by the suite's CSP reporter:
 *   { baseUrl?: string, violations: [{ key, directive, blockedUri, disposition, suggestedHashes,
 *     sourceFiles, pages, tests, accepted? }] }
 *
 * Env: CSP_REPORT_FILE (required), PREVIOUS_CSP_REPORT_FILE, RUN_COMPLETE, SLACK_CHANNEL,
 * SLACK_BOT_OAUTH_TOKEN, PROJECT_TITLE, SITE_URL, RUN_URL, COMMIT_SHA, DRY_RUN,
 * GITHUB_STEP_SUMMARY.
 */
import fs from 'node:fs';

import { sendSlackMessage } from './send-slack-message.mjs';

// Slack allows 50 blocks per message; the thread details are chunked into replies of this size.
const MAX_BLOCKS_PER_REPLY = 40;
const MAX_RESOLVED_LISTED = 10;
// Slack rejects the whole message when any block's text exceeds its limit, which would turn the
// reporting job red over a long blocked URI. Well under the 3000-character limit.
const MAX_BLOCK_TEXT = 1000;

const reportFile = process.env.CSP_REPORT_FILE;
const previousReportFile = process.env.PREVIOUS_CSP_REPORT_FILE;
const channel = process.env.SLACK_CHANNEL;
const authToken = process.env.SLACK_BOT_OAUTH_TOKEN;
const projectTitle = process.env.PROJECT_TITLE || 'AG';
const runUrl = process.env.RUN_URL || '';
const commitSha = process.env.COMMIT_SHA || '';
const isDryRun = process.env.DRY_RUN === 'true';
const isRunComplete = process.env.RUN_COMPLETE !== 'false';
const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;

const readReport = (file) => {
    if (!file || !fs.existsSync(file)) {
        return undefined;
    }
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.error(`Could not parse CSP report ${file}: ${error.message}`);
        return undefined;
    }
};

const isAccepted = (violation) => typeof violation.accepted === 'string';
// Enforced and not accepted: what the owning team is being asked to act on.
const enforcedOf = (report) =>
    (report?.violations ?? []).filter((violation) => violation.disposition === 'enforce' && !isAccepted(violation));
const acceptedOf = (report) =>
    (report?.violations ?? []).filter((violation) => violation.disposition === 'enforce' && isAccepted(violation));

const truncate = (text, limit = MAX_BLOCK_TEXT) => (text.length > limit ? `${text.slice(0, limit - 3)}...` : text);

// Trailing slashes and case differ between a resolved staging URL and a hand-typed one.
const sameSite = (a, b) =>
    String(a ?? '')
        .toLowerCase()
        .replace(/\/+$/, '') ===
    String(b ?? '')
        .toLowerCase()
        .replace(/\/+$/, '');

const describe = (violation) => {
    const parts = [`\`${violation.directive}\` blocked \`${violation.blockedUri}\``];
    if (violation.suggestedHashes?.length) {
        parts.push(`needs ${violation.suggestedHashes.map((hash) => `\`${hash}\``).join(' ')}`);
    }
    if (violation.sourceFiles?.length) {
        parts.push(`from ${violation.sourceFiles.slice(0, 2).join(', ')}`);
    }
    parts.push(`on ${violation.pages.slice(0, 4).join(', ')}${violation.pages.length > 4 ? ', ...' : ''}`);
    return parts.join(' - ');
};

const report = readReport(reportFile);
if (!report) {
    // The run that produces the report has its own failure signal; nothing to add here.
    console.log(`No CSP report at ${reportFile}; nothing to report.`);
    process.exit(0);
}

const siteUrl = process.env.SITE_URL || report.baseUrl || '';
const enforced = enforcedOf(report);
const accepted = acceptedOf(report);
const reportOnlyCount = (report.violations ?? []).length - enforced.length - accepted.length;

const candidateBaseline = readReport(previousReportFile);
// A manual run can target any URL, and its report is uploaded like any other, so the most recent
// run is not necessarily a baseline for this one.
const baselineMatchesSite = candidateBaseline && sameSite(candidateBaseline.baseUrl, report.baseUrl);
if (candidateBaseline && !baselineMatchesSite) {
    console.log(
        `Previous report describes ${candidateBaseline.baseUrl || '(unknown)'}, not ${report.baseUrl || '(unknown)'}; ignoring it as a baseline.`
    );
}
const previousReport = baselineMatchesSite ? candidateBaseline : undefined;
const previousKeys = new Set(enforcedOf(previousReport).map((violation) => violation.key));
const currentKeys = new Set(enforced.map((violation) => violation.key));
const added = enforced.filter((violation) => !previousKeys.has(violation.key));
const resolved = isRunComplete ? enforcedOf(previousReport).filter((violation) => !currentKeys.has(violation.key)) : [];

for (const violation of enforced) {
    console.log(`::warning title=CSP violation::${describe(violation)}`);
}
for (const violation of accepted) {
    console.log(`::notice title=Accepted CSP violation::${describe(violation)} - ${violation.accepted}`);
}
console.log(
    `${enforced.length} enforced violation(s), ${accepted.length} accepted, ${reportOnlyCount} report-only, ` +
        `${added.length} new, ${resolved.length} resolved` +
        (previousReport ? '' : ' (no usable baseline to compare against)') +
        (isRunComplete ? '' : ' (incomplete run: not reporting anything as resolved)')
);

if (stepSummaryFile) {
    const summary = enforced.length
        ? [
              `### CSP violations on ${projectTitle} (${siteUrl})`,
              '',
              ...enforced.map((violation) => `- ${added.includes(violation) ? '**new** ' : ''}${describe(violation)}`),
          ]
        : [`### No enforced CSP violations on ${projectTitle} (${siteUrl})`];
    if (accepted.length) {
        summary.push(
            '',
            `#### Accepted (${accepted.length})`,
            '',
            ...accepted.map((violation) => `- ${describe(violation)}<br>${violation.accepted}`)
        );
    }
    if (reportOnlyCount) {
        summary.push('', `${reportOnlyCount} report-only violation(s) not listed.`);
    }
    fs.appendFileSync(stepSummaryFile, `${summary.join('\n')}\n`, 'utf8');
}

const hasChanged = previousReport ? added.length > 0 || resolved.length > 0 : enforced.length > 0;
if (!hasChanged) {
    console.log(
        isRunComplete
            ? 'Violation set unchanged since the previous run; not posting to Slack.'
            : 'Nothing new observed, and an incomplete run cannot report anything as resolved; not posting.'
    );
    process.exit(0);
}

const section = (text) => ({ type: 'section', text: { type: 'mrkdwn', text } });
const context = (text) => ({ type: 'context', elements: [{ type: 'mrkdwn', text }] });

const headline = enforced.length
    ? `:warning: *${projectTitle}: ${enforced.length} enforced CSP violation(s)*` +
      (added.length ? ` - ${added.length} new` : '')
    : `:white_check_mark: *${projectTitle}: CSP violations cleared*`;

const footer = context(
    [siteUrl && `Site: ${siteUrl}`, runUrl && `<${runUrl}|CI run>`, commitSha && `Commit ${commitSha.slice(0, 8)}`]
        .filter(Boolean)
        .join('  |  ')
);

const baseMessage = {
    channel,
    username: 'ag-grid CI',
    icon_url: 'https://avatars.slack-edge.com/2020-11-25/1527503386626_319578f21381f9641cd8_192.png',
};

// The channel post: headline and links only. Everything per-violation goes in the thread.
const message = {
    ...baseMessage,
    // Notification fallback: strip Slack's markdown but leave :emoji: shortcodes intact.
    text: headline.replace(/[*`]/g, ''),
    blocks: [section(headline), footer],
};

const detailBlocks = enforced.map((violation) =>
    section(truncate(`${added.includes(violation) ? ':new: ' : ''}${describe(violation)}`))
);
if (resolved.length) {
    const cleared = resolved
        .slice(0, MAX_RESOLVED_LISTED)
        .map((violation) => `\`${violation.directive}\` / \`${violation.blockedUri}\``);
    const remainder = resolved.length - cleared.length;
    detailBlocks.push(
        context(
            truncate(
                `No longer blocked since the previous run: ${cleared.join(', ')}` +
                    (remainder ? ` and ${remainder} more` : '')
            )
        )
    );
}
if (accepted.length) {
    detailBlocks.push(context(`${accepted.length} accepted violation(s) not listed; see the run summary.`));
}

const chunk = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};

// Thread replies under the channel post, in the order the violations are listed.
const replies = chunk(detailBlocks, MAX_BLOCKS_PER_REPLY).map((blocks, index, all) => ({
    ...baseMessage,
    text: all.length > 1 ? `CSP violation details (${index + 1}/${all.length})` : 'CSP violation details',
    blocks,
}));

if (isDryRun) {
    console.log(`DRY_RUN: would post to ${channel || '(no channel set)'}:`);
    console.log(JSON.stringify(message, null, 2));
    for (const reply of replies) {
        console.log('DRY_RUN: would reply in thread:');
        console.log(JSON.stringify(reply, null, 2));
    }
    process.exit(0);
}

if (!authToken || !channel) {
    console.error('SLACK_BOT_OAUTH_TOKEN and SLACK_CHANNEL are required to post.');
    process.exit(1);
}

const post = async (data) => {
    const results = await sendSlackMessage({ authToken, data });
    if (results.error || !results.ok) {
        console.error('Error sending Slack message:', results.error ?? results);
        process.exit(1);
    }
    return results;
};

const { ts: threadTs } = await post(message);
for (const reply of replies) {
    await post({ ...reply, thread_ts: threadTs });
}
console.log(`Posted CSP report to ${channel}${replies.length ? ` with ${replies.length} thread reply(ies)` : ''}.`);
