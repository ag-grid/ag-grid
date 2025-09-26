#!/usr/bin/env node
import crypto from 'node:crypto';
import fs, { link } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    getGitDiffLink,
    getGitDiffLinks,
    getGitHashFromTest,
    getHeader,
    getStats,
    parseCtrfReport,
} from './_utils.mjs';

const ctrfReportFile = process.env.CTRF_REPORT_FILE || '../../reports/performance.json';
const workflowName = process.env.WORKFLOW_NAME || '';
const jobId = process.env.JOB_ID || '';
const isSuccess = process.env.IS_SUCCESS === 'true';
const jobID = process.env.JOB_ID || '';
const repoUrl = process.env.REPO_URL || 'https://github.com/ag-grid/ag-grid';
const branchName = process.env.BRANCH_NAME || '';
const currentCommitSha = process.env.CURRENT_COMMIT_SHA || '';
const previousCommitSha = process.env.PREV_COMMIT_SHA || '';
const lastFailedStep = process.env.LAST_FAILED_STEP || '';
const jobUrl = `${repoUrl}/actions/runs/${jobId}`;
const commentFileName = process.env.COMMENT_FILE || './comment.md';
const parsedReport = parseCtrfReport(ctrfReportFile);

const header = getHeader(
    isSuccess,
    mdLink,
    workflowName,
    jobID,
    jobUrl,
    branchName,
    bold,
    inlineCode,
    lastFailedStep,
    section
);
const statsTemplate = getStats(parsedReport, context);
const diffLinks = getGitDiffLinks(repoUrl, currentCommitSha, previousCommitSha, context, section, mdLink, parsedReport);
const content = [header, statsTemplate, diffLinks].join('\n').trim();

fs.writeFileSync(commentFileName, content + '\n');

function context(text) {
    return `> ${text}`;
}

function inlineCode(text) {
    return `\`${text}\``;
}

function section(text) {
    const TAB = '  ';
    return `\n${TAB}${text.trim().replace(/\n+/g, `\n${TAB}`)}\n`;
}

function bold(text) {
    return `**${text}**`;
}

function mdLink(text, url) {
    return `[${text}](${url})`;
}
