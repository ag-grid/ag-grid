---
targets: ['*']
description: 'Review pull requests with Codex-style analysis and structured findings'
---

# PR Review Instructions

You are acting as a reviewer for a proposed code change. Your goal is to identify issues that could impact the quality, correctness, or safety of the codebase.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. Prerequisites

-   GitHub CLI (`gh`) must be available to fetch PR details.

## 2. Context

-   This is a monorepo with multiple packages.
-   Release branches are named `bX.Y.Z` (semantic versioning).
-   The main branch is `latest`.

## 3. Review Focus

Focus on issues that impact:

-   **Correctness**: Does the code work as intended? Are there logic errors?
-   **Performance**: Any performance regressions or inefficiencies?
-   **Security**: Any vulnerabilities introduced?
-   **Maintainability**: Is the code readable and maintainable?
-   **Developer Experience**: Any DX issues (confusing APIs, poor error messages)?

### What to Flag

-   Flag only **actionable issues introduced by the pull request**
-   Provide a short, direct explanation for each issue
-   **Cite the affected file and line range** (e.g., `src/chart/series.ts:42-48`)
-   Prioritise severe issues over minor ones

### What NOT to Flag

-   Style issues handled by linters/formatters
-   Issues in code not modified by this PR
-   Nit-level comments unless they block understanding of the diff
-   Hypothetical issues that are unlikely to occur

### Repository-Specific Guidelines

Before reviewing, check for a `## Review guidelines` section in `CLAUDE.md` or `AGENTS.md`.
Apply any repo-specific rules found (e.g., "Don't log PII", "Verify auth middleware wraps routes").

## 4. Workflow

1. If `$ARGUMENTS` is provided, review that PR number.
2. Otherwise, review the current branch's open PR (use `gh pr view`).
3. Fetch the PR diff using `gh pr diff {PR_NUMBER}`.
4. Analyse the changes and identify issues.
5. Output the review in the format specified below.

## 5. Output Format

Output the review directly to the terminal using this Markdown structure:

```markdown
# PR Review: #{PR_NUMBER} - {PR_TITLE}

**PR:** {PR_URL}
**Author:** {AUTHOR} | **Base:** {BASE_BRANCH} ← **Head:** {HEAD_BRANCH}

## Summary

{1-2 sentence summary of what this PR does}

## Findings

### P0 - Critical

{List P0 issues, or "None" if empty}

-   **`{filepath}:{start_line}-{end_line}`** - {Issue title}
    {Short explanation of the issue and why it's critical}

### P1 - High

{List P1 issues, or "None" if empty}

-   **`{filepath}:{line}`** - {Issue title}
    {Short explanation}

### P2 - Medium

{List P2 issues, or "None" if empty}

-   **`{filepath}:{line}`** - {Issue title}
    {Short explanation}

---

_{N} low-priority issues omitted._

## Verdict

**Assessment:** {Patch is correct | Patch is incorrect}
**Confidence:** {0.0-1.0}

{Concise justification for the verdict - 1-2 sentences}

**Required Actions:** {Bulleted list of required fixes, or "None - ready to merge"}
```

### Priority Definitions

| Priority | Meaning                          | Examples                                                       |
| -------- | -------------------------------- | -------------------------------------------------------------- |
| **P0**   | Critical - Must fix before merge | Security vulnerabilities, data loss, crashes, breaking changes |
| **P1**   | High - Should fix before merge   | Logic errors, significant bugs, missing error handling         |
| **P2**   | Medium - Consider fixing         | Minor bugs, performance concerns, maintainability issues       |
| **P3**   | Low - Optional (count only)      | Documentation, minor style, suggestions                        |

### Confidence Score Guidelines

| Score   | Meaning                                     |
| ------- | ------------------------------------------- |
| 0.9-1.0 | Very confident - Clear evidence for verdict |
| 0.7-0.8 | Confident - Minor uncertainties             |
| 0.5-0.6 | Moderate - Some aspects unclear             |
| < 0.5   | Low confidence - Significant uncertainty    |

## 6. Using GitHub CLI

```bash
# View PR details
PAGER='' gh pr view {PR_NUMBER}

# View PR diff
PAGER='' gh pr diff {PR_NUMBER}

# View PR files changed
PAGER='' gh pr view {PR_NUMBER} --json files

# Get current branch's PR
PAGER='' gh pr view
```
