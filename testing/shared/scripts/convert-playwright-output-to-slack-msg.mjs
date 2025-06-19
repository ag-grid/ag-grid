#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const channel = process.env.SLACK_CHANNEL || ' ';
const username = process.env.SLACK_USERNAME || ' ';
const icon_url = process.env.SLACK_ICON || ' ';
const slackFileName = process.env.SLACK_FILE || './slack.json';
const snippetSlackFileName = process.env.SLACK_FILE_SNIPPET || './slack-snippet.md';
const commentFileName = process.env.COMMENT_FILE || './comment.md';
const jiraFileName = process.env.JIRA_FILE || './jira.md';

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

const DIVIDER = { type: 'divider' };
const num = (count, emoji, label) => (count ? `${emoji} *${label}:* ${count}` : '');
const statusEmoji = (status) => ({ expected: '✅', unexpected: '🙁', skipped: '🔕', flaky: '👻' })[status] || '❓';
const codeBlock = (text) => `\`\`\`${paragraph(text)}\`\`\``;
const jiraCodeBlock = (text) => `{noformat}${paragraph(text)}{noformat}`;
const code = (text) => `\`${text}\``;
const TAB = '  ';
const paragraph = (text) => `\n${TAB}${text.trim().replace(/\n+/g, `\n${TAB}`)}\n`;
const section = (text) => ({ type: 'section', text: { type: 'mrkdwn', text } });

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

const renderStdout = (stdout, codeBlock) => {
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

const getGitDiffLink = (annotation) =>
    `https://github.com/ag-grid/ag-grid/compare/${annotation.description.control.gitHash.slice(0, 7)}...${annotation.description.variant.gitHash.slice(0, 7)}`;

const getResultsString = (tests, distilled, createLink, createCodeBlock = codeBlock) => {
    if (!tests.length) return 'If you see this message, it means that there is an error in pipeline script.';
    return (
        '*Tests*' +
        tests
            .map(
                ({ status, path, results, annotations }, index) =>
                    `${index + 1}. ${statusEmoji(status)} ${path.map((p) => p.title).join(' > ')} | ${createLink('Git Diff', getGitDiffLink(annotations[0]))} ${paragraph(
                        results
                            .map(({ error, stdout }) => [error, getStdout(stdout)[distilled ? 'distilled' : 'full']])
                            .map(
                                ([error, stdout]) =>
                                    `${renderError(error)}\n- Output:\n${renderStdout(stdout, createCodeBlock)}`
                            )
                            .join('\n')
                    )}`
            )
            .map(paragraph)
            .join('\n')
    );
};

function calculateTests(report) {
    const tests = {
        failed: [],
        all: [],
    };

    const walk = (node, path = []) => {
        if (node.specs) node.specs.forEach((n) => walk(n, [...path, node]));
        if (node.suites) node.suites.forEach((n) => walk(n, [...path, node]));
        if (node.tests) node.tests.forEach((n) => walk(n, [...path, node]));
        if (node.status) {
            if (node.status !== 'expected') {
                tests.failed.push(node);
            }
            node.path = path.slice(1);
            tests.all.push(node);
        }
    };
    walk(report);
    return tests;
}
const slackLink = (text, url) => `<${url}|${text}>`;
const mdLink = (text, url) => `[${text}](${url})`;
const jiraLink = (text, url) => `[${text}|${url}]`;
const getSlackMessage = (blocks) => ({ channel, username, icon_url, blocks });
const calculatedTests = calculateTests(report);

const linksText = (createLink) =>
    [
        process.env.IS_SUCCESS ? SUCCESS_STRING : FAILURE_STRING,
        createLink('Job link', process.env.JOB_URL ?? 'https://example.com'),
        createLink('Benchmark report', process.env.REPORT_URL ?? 'https://example.com'),
    ].join(' | ');

const slackMessage = getSlackMessage(
    [section(linksText(slackLink)), DIVIDER, section(getTotalsText(report))].concat(
        process.env.IS_SUCCESS ? [] : [section(getResultsString(calculatedTests.failed, true, slackLink))]
    )
);

const textMessage = [linksText(mdLink), getTotalsText(report)]
    .concat(
        process.env.IS_SUCCESS
            ? []
            : [
                  '',
                  getResultsString(calculatedTests.failed, true, mdLink),
                  '---',
                  `Please address the issues before merging.`,
              ]
    )
    .join('\n');
fs.writeFileSync(commentFileName, textMessage);
fs.writeFileSync(slackFileName, JSON.stringify(slackMessage, null, 2));
fs.writeFileSync(snippetSlackFileName, getResultsString(calculatedTests.all, false, mdLink));
fs.writeFileSync(jiraFileName, getResultsString(calculatedTests.failed, true, jiraLink, jiraCodeBlock));
