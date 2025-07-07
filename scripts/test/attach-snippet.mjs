#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const snippetUrl = process.env.SNIPPET_URL || 'https://example.com/snippet.md';

if (!snippetUrl) {
    console.error('SNIPPET_URL environment variable must be set.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '..', '..');
const jiraFilePath = process.env.JIRA_DESCRIPTION_FILE || path.join(__root, 'jira-description.txt');
const slackFileName = process.env.SLACK_FILE || path.join(__root, 'slack.json');
const commentFileName = process.env.COMMENT_FILE || path.join(__root, 'comment.md');

const slackMsg = JSON.parse(fs.readFileSync(slackFileName, 'utf8'));
let ghMsg = fs.readFileSync(commentFileName, 'utf8');
let jiraMsg = fs.readFileSync(jiraFilePath, 'utf8');

slackMsg.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `<${snippetUrl}|Full stdout>` } });
ghMsg += `\n[Full stdout](${snippetUrl})`;
jiraMsg += `\n[Full stdout|${snippetUrl}]`;

fs.writeFileSync(slackFileName, `${JSON.stringify(slackMsg)}\n`);
fs.writeFileSync(commentFileName, `${ghMsg}\n`);
fs.writeFileSync(jiraFilePath, `${jiraMsg}\n`);
