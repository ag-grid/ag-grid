#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUCCESS_STRING = '🏁 Benchmarking finished';
const FAILURE_STRING = `❌ Problems encountered while benchmarking.`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..', '..');
const logFile = path.join(__root, 'playwright-report', 'test-results.json');
const channel = process.env.SLACK_CHANNEL || ' ';
const username = process.env.SLACK_USERNAME || ' ';
const icon_url = process.env.SLACK_ICON || ' ';
const slackFileName = process.env.SLACK_FILE || path.join(__root, 'slack.json');
const snippetSlackFileName = process.env.SLACK_FILE_SNIPPET || path.join(__root, 'slack-snippet.md');
const commentFileName = process.env.COMMENT_FILE || path.join(__root, 'comment.md');
const jiraFileName = process.env.JIRA_FILE || path.join(__root, 'jira.json');

if (!channel) throw new Error('SLACK_CHANNEL is not set');
if (!username) throw new Error('SLACK_USERNAME is not set');
if (!icon_url) throw new Error('SLACK_ICON is not set');

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
    if (!stdout || !stdout.length) return 'No distilled output available. See full output in the report.';
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
            .map(({ status, path, results, annotations }, index) => {
                const annotation = annotations[0] ? createLink('Git Diff', getGitDiffLink(annotations[0])) : '';
                const testPath = `${statusEmoji(status)} ${path.map((p) => p.title).join(' > ')}`;
                const resultsStr = results
                    .map(({ error, stdout }) => {
                        return `${renderError(error)}\n- Output:\n${renderStdout(getStdout(stdout)[distilled ? 'distilled' : 'full'], createCodeBlock)}`;
                    })
                    .join('\n');
                return `${index + 1}. ${[testPath, annotation].filter((_) => _.trim()).join(' | ')} ${paragraph(
                    resultsStr
                )}`;
            })
            .map(paragraph)
            .join('')
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

const slackMessage = getSlackMessage([section(linksText(slackLink)), DIVIDER, section(getTotalsText(report))]);

const textMessage = [linksText(mdLink), getTotalsText(report)]
    .concat(
        process.env.IS_SUCCESS
            ? []
            : [
                  '',
                  getResultsString(
                      calculatedTests.failed.length ? calculatedTests.failed : calculatedTests.all,
                      true,
                      mdLink
                  ),
                  '---',
                  `Please address the issues before merging.`,
              ]
    )
    .join('\n');
fs.writeFileSync(commentFileName, textMessage);
fs.writeFileSync(slackFileName, JSON.stringify(slackMessage, null, 2));
fs.writeFileSync(snippetSlackFileName, getResultsString(calculatedTests.all, false, mdLink));
/**
 * Generates a unique fingerprint for the failed tests based on their titles and git hashes.
 * This fingerprint is used to deduplicate JIRA issues for the same regression.
 *
 * Big assumption here is that the all failed tests have the same control version, e.g. 'production', and we use the first git hash base.
 * Another assumption is that only 1 test file is tested, so we use its filename as a fingerprint base.
 *
 * CAUTION: DO NOT MODIFY THIS FINGERPRINT GENERATION LOGIC UNLESS YOU KNOW WHAT YOU ARE DOING!
 *
 * @type {string}
 */
const uniqueFingerprint = generateHash(
    [
        calculatedTests.all[0].path[0].title || 'unknown',
        calculatedTests.all[0].annotations[0].description.control.gitHash.slice(0, 7) || 'unknown',
    ].join()
);

fs.writeFileSync(
    jiraFileName,
    JSON.stringify(
        {
            fingerprint: uniqueFingerprint,
            text: getResultsString(calculatedTests.failed, true, jiraLink, jiraCodeBlock),
        },
        null,
        2
    )
);

function generateHash(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
}
