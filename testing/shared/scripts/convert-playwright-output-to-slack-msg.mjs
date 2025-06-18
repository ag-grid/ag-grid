#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const channel = process.env.SLACK_CHANNEL || ' ';
const username = process.env.SLACK_USERNAME || ' ';
const icon_url = process.env.SLACK_ICON || ' ';
const slackFileName = process.env.SLACK_FILE || './slack.json';
const snippetSlackFileName = process.env.SLACK_FILE_SNIPPET || './slack-snippet.txt';
const commentFileName = process.env.COMMENT_FILE || './comment.txt';

if (!channel) throw new Error('SLACK_CHANNEL is not set');
if (!username) throw new Error('SLACK_USERNAME is not set');
if (!icon_url) throw new Error('SLACK_ICON is not set');

const SUCCESS_STRING = '🏁 Benchmarking finished';
const FAILURE_STRING = `❌ Problems encountered while benchmarking.`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../../../playwright-report/test-results.json');
/** @type {import('playwright/types/testReporter').JSONReport} */
const report = JSON.parse(fs.readFileSync(logFile, 'utf8').toString());
const defaultBlocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*Test results.*` } },
    { type: 'divider' },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `${process.env.IS_SUCCESS ? SUCCESS_STRING : FAILURE_STRING} | <${process.env.JOB_URL ?? 'did you forget to supply process.env.JOB_URL?'}|Job link> | <${process.env.REPORT_URL ?? 'did you forget to supply process.env.REPORT_URL?'}|Benchmark report>\n`,
        },
    },
    { type: 'divider' },
];

const num = (count, emoji, label) => (count ? `${emoji} *${label}:* ${count}` : '');
const statusEmoji = (status) => ({ expected: '✅', unexpected: '🙁', skipped: '🔕', flaky: '👻' })[status] || '❓';
const codeBlock = (text) => `\`\`\`${paragraph(text)}\`\`\``;
const code = (text) => `\`${text}\``;
const TAB = '  ';
const paragraph = (text) => `\n${TAB}${text.trim().replace(/\n+/g, `\n${TAB}`)}\n`;
const renderError = (error) => {
    if (!error) return '';
    const [errorTitle, _, lastAction] = error.message.split('\n');
    let text = errorTitle;
    if (lastAction) text += `: Last action: ${lastAction}`;
    return ` - *Error*: ${code(text)}`;
};

const getStdout = (stdout) => {
    const full = stdout.map((l) => l.text);
    const distilled = full
        .map((l) => l.split('\n'))
        .flat()
        .filter((l) => l.includes('%'))
        .map((l) => l.trim());
    return { full, distilled };
};

const renderStdout = (stdout) => {
    return codeBlock(stdout.join('\n').trim());
};

const getTotalsText = (report) =>
    [
        num(report.stats.expected + report.stats.skipped + report.stats.unexpected + report.stats.flaky, '⚒️', 'Total'),
        num(report.stats.expected, statusEmoji('expected'), 'Passed'),
        num(report.stats.unexpected, statusEmoji('unexpected'), 'Failed'),
        num(report.stats.skipped, statusEmoji('skipped'), 'Skipped'),
        num(report.stats.flaky, statusEmoji('flaky'), 'Flaky'),
    ]
        .filter((t) => t.trim())
        .join(' | ');

const getSectionWithTotals = (report) => ({
    type: 'section',
    text: {
        type: 'mrkdwn',
        text: getTotalsText(report),
    },
});

const getResultsString = (tests, distilled = false) => {
    return (
        'Tests' +
        tests
            .map(
                ({ status, path, results }, i) =>
                    `${i + 1}. _${statusEmoji(status)} ${path.map((p) => p.title).join(' > ')}_ ${paragraph(
                        results
                            .map(({ error, stdout }) => [error, getStdout(stdout)[distilled ? 'distilled' : 'full']])
                            .map(([error, stdout]) => `${renderError(error)}\n- Output: ${renderStdout(stdout)}`)
                            .join('\n')
                    )}`
            )
            .map(paragraph)
            .join('\n')
    );
};

const getSectionWithResults = (text) => {
    return { type: 'section', text: { type: 'mrkdwn', text } };
};

function calculateTests(report) {
    const tests = [];

    const walk = (node, path = []) => {
        if (node.specs) node.specs.forEach((n) => walk(n, [...path, node]));
        if (node.suites) node.suites.forEach((n) => walk(n, [...path, node]));
        if (node.tests) node.tests.forEach((n) => walk(n, [...path, node]));
        if (node.status) {
            node.path = path.slice(1);
            tests.push(node);
        }
    };
    walk(report);
    return tests;
}

const getSlackMessage = (blocks) => ({ channel, username, icon_url, blocks });

const calculatedTests = calculateTests(report);
const resultsString = getResultsString(calculatedTests);
const resultsStringDistilled = getResultsString(calculatedTests, true);
const slackMessage = getSlackMessage(
    defaultBlocks.concat([getSectionWithTotals(report), getSectionWithResults(resultsStringDistilled)])
);

const textMessage = defaultBlocks
    .concat([getSectionWithTotals(report), getSectionWithResults(resultsString)])
    .map((b) => (b.text?.text || '').replace(/<(.+)\|(.+)>/g, '[$2]($1)'))
    .concat(process.env.IS_SUCCESS ? [] : ['---', `Please address the issues before merging.`])
    .join('\n');
fs.writeFileSync(commentFileName, textMessage);
fs.writeFileSync(slackFileName, JSON.stringify(slackMessage, null, 2));
fs.writeFileSync(snippetSlackFileName, resultsString);
