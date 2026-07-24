// Appends a bounded, always-renderable failed-tests summary to $GITHUB_STEP_SUMMARY.
//
// ctrf-io/github-test-reporter's failed-folded-report includes the full message and trace for
// every failed test with no cap, so a run with hundreds of failures can produce a step summary
// well over GitHub's 1MB per-job limit - at which point the whole summary is silently dropped
// rather than shrunk. This script reads the merged CTRF report and writes a small, fixed-size
// table instead: it lists at most MAX_FAILURES tests with a single truncated line of error
// detail each, so the summary always renders regardless of how many tests failed.
import { appendFileSync, readFileSync } from 'node:fs';

const MAX_FAILURES = 100;
const MAX_MESSAGE_LENGTH = 200;

const ctrfFile = process.argv[2];
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (!ctrfFile || !summaryFile) {
    // eslint-disable-next-line no-console
    console.error('Usage: GITHUB_STEP_SUMMARY=<path> node summarise-ctrf-failures.mjs <ctrf-report.json>');
    process.exit(1);
}

const report = JSON.parse(readFileSync(ctrfFile, 'utf8'));
const tests = report?.results?.tests ?? [];
const failed = tests.filter((test) => test.status === 'failed');

if (failed.length === 0) {
    process.exit(0);
}

const lines = ['## Failed tests', '', `${failed.length} test(s) failed.`, '', '| Test | Error |', '| --- | --- |'];

for (let i = 0, len = Math.min(failed.length, MAX_FAILURES); i < len; ++i) {
    const test = failed[i];
    lines.push(`| ${escapeCell(truncate(firstLine(test.name)))} | ${escapeCell(truncate(firstLine(test.message)))} |`);
}

if (failed.length > MAX_FAILURES) {
    lines.push(
        '',
        `_...and ${failed.length - MAX_FAILURES} more failure(s) - see the \`ctrf-report\` artifact for the full report._`
    );
}

appendFileSync(summaryFile, `${lines.join('\n')}\n`);

function firstLine(message) {
    if (typeof message !== 'string') {
        return '';
    }
    return message.split('\n')[0];
}

function truncate(text) {
    return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH)}...` : text;
}

function escapeCell(text) {
    return text.replaceAll('|', '\\|');
}
