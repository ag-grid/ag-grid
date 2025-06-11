#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const channel = process.env.SLACK_CHANNEL;
const username = process.env.SLACK_USERNAME;
const icon_url = process.env.SLACK_ICON;

if (!channel) throw new Error('SLACK_CHANNEL is not set');
if (!username) throw new Error('SLACK_USERNAME is not set');
if (!icon_url) throw new Error('SLACK_ICON is not set');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../../../playwright-report/test-results.json');
/** @type {import('playwright/types/testReporter').JSONReport} */
const report = JSON.parse(fs.readFileSync(logFile, 'utf8').toString());
const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*Benchmark results.*` } },
    { type: 'divider' },
    ...generateTestsSummary(report),
];

const slackMessage = { channel, username, icon_url, blocks };

console.log(JSON.stringify(slackMessage, null, 2));

/**
 * Generate a summary of test results for Slack message blocks
 * @param {import('playwright/types/testReporter').JSONReport} report - Playwright JSON test report
 * @returns {Array<{type: string, text: {type: string, text: string}}>} - Array of Slack message blocks
 */
function generateTestsSummary(report) {
    const summaryBlocks = [];
    /** @type {Record<string, import('playwright/types/testReporter').JSONReportTest[]>} */
    const tests = {
        passed: [],
        failed: [],
        skipped: [],
        flaky: [],
    };
    const testsCount = report.stats.expected + report.stats.skipped + report.stats.unexpected + report.stats.flaky;
    const walk = (node, path = []) => {
        if (node.specs) node.specs.forEach((n) => walk(n, [...path, node]));
        if (node.suites) node.suites.forEach((n) => walk(n, [...path, node]));
        if (node.tests) node.tests.forEach((n) => walk(n, [...path, node]));
        if (node.status) {
            const status = node.status;
            node.path = path;
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
    summaryBlocks.push({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text:
                `*Total Benches:* ${testsCount}\n` +
                `*Passed:* ${report.stats.expected}\n` +
                `*Failed:* ${report.stats.unexpected}\n` +
                `*Skipped:* ${report.stats.skipped}\n` +
                `*Flaky:* ${report.stats.flaky}`,
        },
    });

    return summaryBlocks;
}

export {};
