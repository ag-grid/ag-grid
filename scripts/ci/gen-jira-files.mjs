#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';

import { getGitDiffLinks, getHeader, getStats, parseCtrfReport } from './_utils.mjs';

const ctrfReportFile = process.env.CTRF_REPORT_FILE || '../../reports/performance.json';
const workflowName = process.env.WORKFLOW_NAME || '';
const jobId = process.env.JOB_ID || '';
const isSuccess = process.env.IS_SUCCESS === 'true';
const repoUrl = process.env.REPO_URL || 'https://github.com/ag-grid/ag-grid';
const branchName = process.env.BRANCH_NAME || '';
const currentCommitSha = process.env.CURRENT_COMMIT_SHA || '';
const previousCommitSha = process.env.PREV_COMMIT_SHA || '';
const lastFailedStep = process.env.LAST_FAILED_STEP || '';

const jobUrl = `${repoUrl}/actions/runs/${jobId}`;

const parsedReport = parseCtrfReport(ctrfReportFile);

const header = getHeader(
    isSuccess,
    jiraLink,
    workflowName,
    jobId,
    jobUrl,
    branchName,
    bold,
    inlineCode,
    lastFailedStep,
    section
);
const diffLinks = getGitDiffLinks(
    repoUrl,
    currentCommitSha,
    previousCommitSha,
    context,
    section,
    jiraLink,
    parsedReport
);
const statsTemplate = getStats(parsedReport, context);
const content = [header, statsTemplate, diffLinks].filter(Boolean).join('\n').trim();

const jiraDescriptionFile = process.env.JIRA_DESCRIPTION_FILE || './jira-description.txt';
const jiraFingerprintFile = process.env.JIRA_FINGERPRINT_FILE || './jira-fingerprint.txt';

function bold(text) {
    return `*${text}*`;
}

function context(text) {
    return `{quote}${text}{quote}`;
}

function inlineCode(text) {
    return `\`${text}\``;
}

function section(text) {
    const TAB = '  ';
    return `\n${TAB}${text.trim().replace(/\n+/g, `\n${TAB}`)}\n`;
}

function jiraLink(text, url) {
    return `[${text}|${url}]`;
}

/**
 * Generates a unique fingerprint for the failed tests based on their titles and git hashes.
 * This fingerprint is used to deduplicate JIRA issues for the same regression.
 *
 * CAUTION: DO NOT MODIFY THIS FINGERPRINT GENERATION LOGIC UNLESS YOU KNOW WHAT YOU ARE DOING!
 * If you change the logic, you must also delete/manually change fingerprint field on all JIRA issues created by this script.
 *
 * @type {string}
 */
const uniqueFingerprint = generateHash(workflowName);

fs.writeFileSync(jiraDescriptionFile, content + '\n');
fs.writeFileSync(jiraFingerprintFile, uniqueFingerprint + '\n');

function generateHash(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
}
