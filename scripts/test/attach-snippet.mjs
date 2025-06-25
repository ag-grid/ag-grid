#!/usr/bin/env node
import fs from 'node:fs';

const snippetUrl = process.env.SNIPPET_URL || 'https://example.com/snippet.md';

if (!snippetUrl) {
    console.error('SNIPPET_URL environment variable must be set.');
    process.exit(1);
}

const slackFileName = process.env.SLACK_FILE || './slack.json';
const commentFileName = process.env.COMMENT_FILE || './comment.md';
const jiraFileName = process.env.JIRA_FILE || './jira.md';

const slackMsg = JSON.parse(fs.readFileSync(slackFileName, 'utf8'));
let ghMsg = fs.readFileSync(commentFileName, 'utf8');
let jiraMsg = fs.readFileSync(jiraFileName, 'utf8');

slackMsg.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `<${snippetUrl}|Full stdout>` } });
ghMsg += `\n\n[Full stdout](${snippetUrl})`;
jiraMsg += `\n\n[Full stdout|${snippetUrl}]`;

fs.writeFileSync(slackFileName, JSON.stringify(slackMsg));
fs.writeFileSync(commentFileName, ghMsg);
fs.writeFileSync(jiraFileName, jiraMsg);
