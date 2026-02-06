import fs from 'fs';
import path from 'path';

import { convertToCtrfGithubSummary } from './snyk-code-to-ctrf-github-summary.mjs';

const SNYK_FILE = process.env.SNYK_FILE;
const REPORT_FILE = process.env.REPORT_FILE;
const OUTPUT_DIR = process.env.OUTPUT_DIR;

// Github environment variables
const GITHUB_STEP_SUMMARY = process.env.GITHUB_STEP_SUMMARY;
const GITHUB_REPO_URL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;

if (!REPORT_FILE) {
    console.error('Error: REPORT_FILE environment variable is not set.');
    process.exit(1);
}
const cwd = process.cwd();
const outputDir = path.resolve(cwd, OUTPUT_DIR);
const snykReportPath = path.resolve(outputDir, SNYK_FILE);
const githubSummaryFile = GITHUB_STEP_SUMMARY;

if (!fs.existsSync(snykReportPath)) {
    console.error(`Error: Snyk Code JSON file not found at path: ${snykReportPath}`);
    process.exit(1);
}

(async () => {
    console.log(`Snyk Code JSON file: ${snykReportPath}`);
    const snykJson = fs.readFileSync(snykReportPath, 'utf-8');
    const snykData = JSON.parse(snykJson);
    const { failedTests, ctrf, githubSummary } = convertToCtrfGithubSummary({
        results: snykData,
        githubRepoUrl: GITHUB_REPO_URL,
    });

    const ctrfPath = path.join(outputDir, REPORT_FILE);
    fs.writeFileSync(ctrfPath, JSON.stringify(ctrf, null, 2));
    console.log(`Converted Snyk data to CTRF format and saved to ${ctrfPath}`);

    // Add summary to github job summary
    fs.appendFileSync(githubSummaryFile, `${githubSummary}\n`);
    console.log(`Converted Snyk data to GitHub summary and appended to ${githubSummaryFile}`);

    const failed = failedTests.length;
    if (failedTests.length > 0) {
        const errorMessage = `❌ SAST Code Scan had ${failed} failed tests`;
        console.error(`::group::${errorMessage}`);
        failedTests.forEach(({ id, shortDescription, locations }) => {
            locations.forEach(({ file, line, col, endLine, endColumn }) => {
                console.error(
                    `::error file=${file},line=${line},col=${col},endLine=${endLine},endColumn=${endColumn}::${id}: ${shortDescription}`
                );
            });
        });
        console.error(`::endgroup::`);

        throw new Error(errorMessage);
    }
})();
