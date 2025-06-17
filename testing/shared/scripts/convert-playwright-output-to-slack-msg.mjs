#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const channel = process.env.SLACK_CHANNEL || ' ';
const username = process.env.SLACK_USERNAME || ' ';
const icon_url = process.env.SLACK_ICON || ' ';
const slackFileName = process.env.SLACK_FILE || './slack.json';
const commentFileName = process.env.COMMENT_FILE || './comment.txt';

if (!channel) throw new Error('SLACK_CHANNEL is not set');
if (!username) throw new Error('SLACK_USERNAME is not set');
if (!icon_url) throw new Error('SLACK_ICON is not set');

const SUCCESS_STRING = '🏁 Benchmarking finished';
const FAILURE_STRING = `❌ Problems encountered while benchmarking.\nPlease check output for details.`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../../../playwright-report/test-results.json');
/** @type {import('playwright/types/testReporter').JSONReport} */
const report = JSON.parse(fs.readFileSync(logFile, 'utf8').toString());
const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*Test results.*` } },
    { type: 'divider' },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `<${process.env.JOB_URL ?? 'did you forget to supply process.env.JOB_URL?'}|Job link>\n<${process.env.REPORT_URL ?? 'did you forget to supply process.env.REPORT_URL?'}|Benchmark report>\n`,
        },
    },
    { type: 'section', text: { type: 'mrkdwn', text: process.env.IS_SUCCESS ? SUCCESS_STRING : FAILURE_STRING } },
    { type: 'divider' },
    ...generateTestsSummary(report),
];

const slackMessage = { channel, username, icon_url, blocks };

fs.writeFileSync(
    commentFileName,
    blocks
        .map((b) => b.text?.text?.replace?.(/<(.+)\|(.+)>/g, '[$2]($1)') || '---')
        .concat(['---', process.env.IS_SUCCESS ? '' : `Please address the issues before merging.`])
        .join('\n')
);
fs.writeFileSync(slackFileName, JSON.stringify(slackMessage, null, 2));

/**
 * Generate a summary of test results for Slack message blocks
 * @param {import('playwright/types/testReporter').JSONReport} report - Playwright JSON test report
 * @returns {Array<{type: string, text: {type: string, text: string}}>} - Array of Slack message blocks
 */
function generateTestsSummary(report) {
    const summaryBlocks = [];
    /** @type {Record<string, import('playwright/types/testReporter').JSONReportTest[]>} */
    const tests = { passed: [], failed: [], skipped: [], flaky: [], all: [] };
    const testsCount = report.stats.expected + report.stats.skipped + report.stats.unexpected + report.stats.flaky;
    const walk = (node, path = []) => {
        if (node.specs) node.specs.forEach((n) => walk(n, [...path, node]));
        if (node.suites) node.suites.forEach((n) => walk(n, [...path, node]));
        if (node.tests) node.tests.forEach((n) => walk(n, [...path, node]));
        if (node.status) {
            const status = node.status;
            node.path = path.slice(1);
            tests.all.push(node);
            if (status === 'expected') {
                tests.passed.push(node);
            } else if (status === 'unexpected') {
                tests.failed.push(node);
            } else if (status === 'skipped') {
                tests.skipped.push(node);
            } else if (status === 'flaky') {
                tests.flaky.push(node);
            }
        }
    };
    walk(report);
    // Add a section for number of tests
    const num = (count, emoji, label) => (count ? `${emoji} *${label}:* ${count}\n` : '');
    const statusEmoji = (status) => ({ expected: '✅', unexpected: '🙁', skipped: '🔕', flaky: '👻' })[status] || '❓';
    summaryBlocks.push({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text:
                num(testsCount, '⚒️', 'Total') +
                num(report.stats.expected, statusEmoji('expected'), 'Passed') +
                num(report.stats.unexpected, statusEmoji('unexpected'), 'Failed') +
                num(report.stats.skipped, statusEmoji('skipped'), 'Skipped') +
                num(report.stats.flaky, statusEmoji('flaky'), 'Flaky'),
        },
    });
    const codeBlock = (text) => `\`\`\`${paragraph(text)}\`\`\``;
    const code = (text) => `\`${text}\``;
    const paragraph = (text) => {
        const tab = '    ';
        return `\n${tab}${text.trim().replace(/\n+/g, `\n${tab}`)}\n`;
    };

    const renderError = (error) => {
        if (error) {
            const [errorTitle, _, lastAction] = error.message.split('\n');
            let text = errorTitle;
            if (lastAction) text += `: Last action: ${lastAction}`;
            return ` - *Error*: ${code(text)}`;
        }
        return '';
    };

    const renderStdout = (stdout) =>
        codeBlock(
            stdout
                .map((l) => l.text)
                .join('\n')
                .trim()
        );

    const testsSection = tests.all
        .map((test, i) => {
            const resultBody = test.results
                .map((result) => `${renderError(result.error)}\n- *Output*: ${renderStdout(result.stdout)}`)
                .join('\n');
            return paragraph(
                `${i + 1}. ${statusEmoji(test.status)} *${test.path.map((p) => p.title).join(' > ')}* ${paragraph(resultBody)}`
            );
        })
        .join('\n');

    summaryBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*🔥 Tests*${testsSection}` } });

    return summaryBlocks;
}
