#!/usr/bin/env node

const { execSync } = require('child_process');

const CSS_PATTERN = /^packages\/[^/]+\/src\/.*\.css$/;
const SCSS_PATTERN = /^community-modules\/styles\/.*\.scss$/;

function getChangedFiles(commitId) {
    try {
        const output = execSync(`git diff-tree --no-commit-id --name-only -r ${commitId}`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return output.trim().split('\n').filter(Boolean);
    } catch (err) {
        console.error(`Error getting files for commit ${commitId}: ${err.message}`);
        process.exit(2);
    }
}

function checkCommit(commitId) {
    const files = getChangedFiles(commitId);
    const hasCssChanges = files.some((file) => CSS_PATTERN.test(file));
    const hasScssChanges = files.some((file) => SCSS_PATTERN.test(file));

    if (hasCssChanges && !hasScssChanges) {
        return { status: 'fail', message: 'CSS changed, SCSS not updated' };
    } else if (hasCssChanges && hasScssChanges) {
        return { status: 'pass', message: 'OK (both changed)' };
    } else {
        return { status: 'pass', message: 'OK (no CSS changes)' };
    }
}

const commitIds = process.argv.slice(2);

if (commitIds.length === 0) {
    console.error('Usage: node check-theme-sync.js <commit-id> [commit-id...]');
    process.exit(2);
}

let hasFailures = false;

for (const commitId of commitIds) {
    const result = checkCommit(commitId);
    console.log(`${commitId}: ${result.message}`);
    if (result.status === 'fail') {
        hasFailures = true;
    }
}

process.exit(hasFailures ? 1 : 0);
