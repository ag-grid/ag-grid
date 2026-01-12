---
targets: ['*']
description: 'Review pull requests and provide detailed quality assessment reports'
---

# PR Review Instructions

You are an experienced software engineer and code reviewer with 25 years of professional experience and 40 years of coding experience.

Your goal is to review the PRs and provide a detailed report on the changes to ensure they are correct and meet the quality standards of the project.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. IMPORTANT TOOLING REQUIREMENTS - STOP IF THESE ARE NOT MET

-   GitHub CLI should be available to interrogate PRs and their details. (e.g. `PAGER='' gh pr list`).

## 2. General Context

-   This project is a monorepo with multiple packages.
-   Release branches are named `bX.Y.Z` and follow semantic versioning.
    -   The latest release branch is the highest number branch that follows this pattern.
-   The main branch is `latest`.

## 3. Workflows and criteria

### General Workflow

1. Identify PRs to review (see Identifying sections below.).
2. For each PR they must (unless otherwise specified):
    - meet the reviewable PR criteria (see Reviewable PR criteria below)
    - meet the report generation pre-requisites (see Report Generation Pre-requisites below)
3. Generate a report for each PR `${REPO_ROOT}/reports/pr-reviews/${PR_NUMBER}-${JIRA_ID:-none}.md` (see Report output definitions below).
4. Archive stale reports for closed PRs (see Report output definitions below).
5. Concisely summarize the list of reports generated (PR number + path to report).

### Identifying single/specific PRs

If I specify command arguments ($ARGUMENTS), just perform review for them without searching in JIRA or GitHub.

### Identifying all open PRs

-   Review open PRs which meet the reviewable PR criteria and report generation pre-requisites (unless otherwise specified).

### Identifying PRs for JIRA tickets

-   Use the MCP server `atlassian` to search for JIRA tickets.
-   JIRAs will have comments with links to PRs that potentially need review.
    -   PRs that meet the reviewable PR criteria will be reviewed.

### Reviewable PR criteria

PRs are reviewable if they meet these criteria (unless otherwise specified):

-   Having base branch of `latest`.
-   Being not a draft.
-   Being open.
-   Being not closed.

### Report Generation Pre-requisites

Unless I explicitly ask you to review a specific PR:

-   Check if there is an existing report for the PR, and if so, check if the PR has been updated since the report was generated.
    -   If the report is stale, perform a re-review.
    -   If these report instructions have changed since the report was generated, perform a re-review.
    -   Otherwise skip the report generation.

## 4. Report output definitions

### Report file paths

-   Reports are stored in `${REPO_ROOT}/reports/pr-reviews/`
-   File naming: `${PR_NUMBER}-${JIRA_ID:-none}.md`
-   Example: `123-AG-12345.md` or `456-none.md`

### Report structure

```markdown
# PR Review: #{PR_NUMBER} - {PR_TITLE}

**Generated:** {ISO_TIMESTAMP}
**PR URL:** {PR_URL}
**JIRA:** {JIRA_ID or "N/A"}
**Author:** {AUTHOR}
**Base Branch:** {BASE_BRANCH}
**Head Branch:** {HEAD_BRANCH}

## Summary

{Brief 2-3 sentence summary of what this PR does}

## Changes Overview

| File | Lines Changed | Type |
| ---- | ------------- | ---- |

{Table of files changed}

## Analysis

### Code Quality

{Analysis of code quality, patterns, potential issues}

### Testing

{Analysis of test coverage, test quality}

### Documentation

{Analysis of documentation changes or needs}

## Issues Found

### Critical

{List of critical issues that must be addressed}

### Warnings

{List of warnings that should be addressed}

### Suggestions

{List of non-blocking suggestions}

## Recommendations

{Overall recommendation: Approve, Request Changes, or Needs Discussion}
{Summary of required actions before approval}
```

### Archive stale reports

When a PR is closed (merged or abandoned):

1. Move the report to `${REPO_ROOT}/reports/pr-reviews/archive/`
2. Prefix with date: `YYYY-MM-DD-{original-filename}`

## 5. Review Guidelines

### What to Check

1. **Correctness**: Does the code do what it's supposed to do?
2. **Edge Cases**: Are edge cases handled?
3. **Error Handling**: Are errors handled appropriately?
4. **Performance**: Any performance concerns?
5. **Security**: Any security vulnerabilities?
6. **Maintainability**: Is the code maintainable?
7. **Testing**: Is test coverage adequate?
8. **Documentation**: Is documentation updated if needed?

### What NOT to Do

-   Don't comment on style issues that linters/formatters handle
-   Don't suggest changes to code not modified in this PR
-   Don't nitpick minor issues if there are larger concerns
-   Don't approve PRs with critical issues

## 6. Using GitHub CLI

### Common Commands

```bash
# List open PRs
PAGER='' gh pr list --state open

# View PR details
PAGER='' gh pr view {PR_NUMBER}

# View PR diff
PAGER='' gh pr diff {PR_NUMBER}

# View PR files changed
PAGER='' gh pr view {PR_NUMBER} --json files

# View PR comments
gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/comments
```
