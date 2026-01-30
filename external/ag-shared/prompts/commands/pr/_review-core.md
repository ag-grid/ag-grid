# PR Review Core Instructions

This file contains the shared review methodology. It is included by format-specific prompts.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. Prerequisites

-   **CI Environment (preferred)**: PR refs pre-fetched, use `git diff` commands
-   **Local Environment (fallback)**: GitHub CLI (`gh`) available for PR access

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
-   **Cite the affected file and line number** from the diff
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

1. Determine the PR number from `$ARGUMENTS` (required in CI, optional locally).
2. Determine if running in CI (PR refs pre-fetched) or locally (use `gh` CLI).
3. Fetch the PR diff and metadata using the appropriate method (see sections below).
4. Analyse the changes and identify issues.
5. Output the review in the format specified by the calling prompt.

### CI Environment (Sandboxed - No Network Access)

In CI, PR refs are pre-fetched by the workflow. Use git commands with these environment variables:
- `$ARGUMENTS` - PR number
- `$BASE_REF` - Target branch (e.g., `latest`, `main`)
- `$HEAD_REF` - Source branch name (may be empty)
- `$PR_TITLE` - PR title from GitHub (may be empty, fall back to first commit message)
- `$PR_AUTHOR` - PR author username (may be empty)

```bash
# Get PR diff (three-dot = what PR introduces, same as GitHub's PR view)
git diff origin/${BASE_REF}...origin/pr/$ARGUMENTS

# Get head commit SHA
git rev-parse origin/pr/$ARGUMENTS

# List changed files
git diff --name-only origin/${BASE_REF}...origin/pr/$ARGUMENTS

# Get all commit messages in the PR (for context)
git log --format="%s" origin/${BASE_REF}..origin/pr/$ARGUMENTS
```

**Why three-dot (`...`)?** GitHub uses three-dot comparison for PR diffs. This shows changes since the branches diverged (merge-base), focusing on "what the PR introduces" rather than comparing current branch states. See [GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-comparing-branches-in-pull-requests).

**IMPORTANT**: Use `$PR_TITLE` for the PR title if available. Only fall back to git commit messages if `$PR_TITLE` is empty. The PR URL follows the pattern: `https://github.com/{owner}/{repo}/pull/{PR_NUMBER}`

### Local Environment (With Network Access)

When `gh` CLI is available and network-accessible, use the commands in Section 8.

```bash
# Get PR diff
PAGER='' gh pr diff $ARGUMENTS

# Get PR metadata (title, author, head SHA)
PAGER='' gh pr view $ARGUMENTS --json title,author,headRefOid,baseRefName,headRefName,url
```

## 5. Priority Definitions

| Priority | Meaning                          | Examples                                                       |
| -------- | -------------------------------- | -------------------------------------------------------------- |
| **P0**   | Critical - Must fix before merge | Security vulnerabilities, data loss, crashes, breaking changes |
| **P1**   | High - Should fix before merge   | Logic errors, significant bugs, missing error handling         |
| **P2**   | Medium - Consider fixing         | Minor bugs, performance concerns, maintainability issues       |
| **P3**   | Low - Optional (count only)      | Documentation, minor style, suggestions                        |

## 6. Confidence Score Guidelines

| Score   | Meaning                                     |
| ------- | ------------------------------------------- |
| 0.9-1.0 | Very confident - Clear evidence for verdict |
| 0.7-0.8 | Confident - Minor uncertainties             |
| 0.5-0.6 | Moderate - Some aspects unclear             |
| < 0.5   | Low confidence - Significant uncertainty    |

## 7. Line Number Guidelines

**IMPORTANT**: Line numbers must reference the line number in the NEW (changed) version of the file, not the old version. This is the line number shown with `+` prefix in the diff.

To find the correct line number:
1. Look at the diff hunk header: `@@ -old_start,old_count +new_start,new_count @@`
2. Count lines from `new_start` for added/modified lines
3. Only reference lines that are actually changed (added or modified) in this PR

## 8. Using GitHub CLI (Local Only)

These commands require network access and won't work in sandboxed CI environments:

```bash
# View PR details
PAGER='' gh pr view {PR_NUMBER}

# View PR diff
PAGER='' gh pr diff {PR_NUMBER}

# Get head commit SHA
PAGER='' gh pr view {PR_NUMBER} --json headRefOid -q '.headRefOid'

# View PR files changed
PAGER='' gh pr view {PR_NUMBER} --json files

# Get current branch's PR
PAGER='' gh pr view
```

## 9. Environment Detection

To determine which method to use:

1. **Check `CI` environment variable**: If `CI=true` is set, use git diff commands (network is restricted)
2. **Fallback**: Check for pre-fetched refs with `git rev-parse origin/pr/$ARGUMENTS 2>/dev/null`
   - If successful: Use git diff commands
   - If fails: Use `gh` CLI commands
