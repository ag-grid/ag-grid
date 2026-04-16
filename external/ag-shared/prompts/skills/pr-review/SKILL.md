---
targets: ['*']
name: pr-review
description: 'Review pull requests with Markdown or JSON output'
invocable: user-only
---

# PR Review Instructions

You are acting as a reviewer for a proposed code change. Your goal is to identify issues that could impact the quality, correctness, or safety of the codebase.

**Read and follow all instructions in the co-located `_review-core.md` file (in this skill's directory) for the review methodology.**

## Arguments

Parse the `ARGUMENTS` environment variable (or skill arguments) for flags and the PR number:

- `--json` — output structured JSON instead of Markdown (used for inline commenting in CI)
- `--devils-advocate` — run an additional Devil's Advocate review pass after the standard review (see below)
- `--full` — run all additional review passes: Devil's Advocate + JIRA Completeness verification (see below)
- Remaining positional argument — the PR number

Examples: `123`, `--json 123`, `123 --json`, `--devils-advocate 123`, `--full 123`, `--json --full 123`

**Note:** `--full` implies `--devils-advocate`. You do not need to pass both.

## Output Format

### Default: Markdown

When `--json` is **not** specified, output the review directly to the terminal using this Markdown structure:

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

### JSON Mode (`--json`)

When `--json` is specified, output **ONLY** valid JSON. No markdown code fences, no explanatory text before or after. The output must be parseable by `JSON.parse()`.

```json
{
  "pr_number": 123,
  "pr_title": "Fix bug in chart rendering",
  "pr_url": "https://github.com/owner/repo/pull/123",
  "author": "username",
  "base_branch": "latest",
  "head_branch": "feature-branch",
  "commit_sha": "abc123def456...",
  "summary": "Brief 1-2 sentence summary of what this PR does",
  "findings": [
    {
      "priority": "P0",
      "file": "src/chart/series.ts",
      "line": 42,
      "end_line": 48,
      "title": "Issue title",
      "description": "Detailed explanation of the issue"
    }
  ],
  "verdict": {
    "assessment": "correct",
    "confidence": 0.85,
    "justification": "Brief reason for the verdict",
    "required_actions": ["Action 1", "Action 2"]
  },
  "stats": {
    "p0_count": 0,
    "p1_count": 1,
    "p2_count": 2,
    "p3_count": 3
  },
  "diff_stats": {
    "files_changed": 5,
    "lines_added": 150,
    "lines_removed": 20
  }
}
```

#### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `pr_number` | number | The PR number |
| `pr_title` | string | The PR title |
| `pr_url` | string | Full URL to the PR |
| `author` | string | PR author's username |
| `base_branch` | string | Target branch (e.g., "latest") |
| `head_branch` | string | Source branch |
| `commit_sha` | string | Full SHA of the head commit (for inline comments) |
| `summary` | string | 1-2 sentence summary of the PR |
| `findings` | array | List of issues found |
| `findings[].priority` | string | "P0", "P1", "P2", or "P3" |
| `findings[].file` | string | Relative file path from repo root |
| `findings[].line` | number | Line number in the NEW version of the file |
| `findings[].end_line` | number | Optional end line for multi-line issues |
| `findings[].title` | string | Short issue title |
| `findings[].description` | string | Detailed explanation |
| `verdict.assessment` | string | "correct" or "incorrect" |
| `verdict.confidence` | number | 0.0 to 1.0 |
| `verdict.justification` | string | Brief reason for verdict |
| `verdict.required_actions` | array | List of required fixes, or empty array |
| `stats` | object | Count of issues by priority |
| `diff_stats` | object | Statistics about the diff analyzed |
| `diff_stats.files_changed` | number | Number of files changed in the PR |
| `diff_stats.lines_added` | number | Number of lines added (+) |
| `diff_stats.lines_removed` | number | Number of lines removed (-) |

#### Example JSON Output

```json
{
  "pr_number": 5990,
  "pr_title": "Fix tooltip positioning in polar charts",
  "pr_url": "https://github.com/ag-grid/ag-charts/pull/5990",
  "author": "developer123",
  "base_branch": "latest",
  "head_branch": "fix/tooltip-polar",
  "commit_sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "summary": "Fixes tooltip positioning issues in polar charts by correctly calculating the angle-based offset.",
  "findings": [
    {
      "priority": "P1",
      "file": "packages/ag-charts-community/src/chart/tooltip/tooltip.ts",
      "line": 142,
      "end_line": 145,
      "title": "Missing null check for polar axis",
      "description": "The polarAxis could be undefined for non-polar series, which would cause a runtime error when accessing polarAxis.angle."
    },
    {
      "priority": "P2",
      "file": "packages/ag-charts-community/src/chart/tooltip/tooltip.ts",
      "line": 150,
      "title": "Magic number should be a constant",
      "description": "The offset value 15 should be extracted to a named constant for clarity and maintainability."
    }
  ],
  "verdict": {
    "assessment": "incorrect",
    "confidence": 0.85,
    "justification": "The fix addresses the main issue but introduces a potential null reference error that must be fixed before merge.",
    "required_actions": [
      "Add null check for polarAxis before accessing its properties"
    ]
  },
  "stats": {
    "p0_count": 0,
    "p1_count": 1,
    "p2_count": 1,
    "p3_count": 0
  },
  "diff_stats": {
    "files_changed": 2,
    "lines_added": 45,
    "lines_removed": 12
  }
}
```

## Devil's Advocate Mode (`--devils-advocate`)

When the `--devils-advocate` flag is present, run an additional adversarial review pass after the standard review completes. This mode challenges assumptions, stress-tests edge cases, and questions whether the PR's approach is the right one.

### Workflow

1. **Run the standard review first.** Complete the full review as described above and collect all findings.
2. **Spawn a sub-agent with the Devil's Advocate instructions.** Use the Agent tool to spawn a sub-agent with the following prompt structure:
   - Include the full contents of `agents/devils-advocate.md` (co-located in this skill's directory) as the sub-agent's instructions.
   - Pass the PR diff, PR metadata, and the `--json` flag state to the sub-agent so it has full context.
   - The sub-agent should read and follow `_review-core.md` for shared methodology.
3. **Merge findings from both passes.**
   - Combine standard review findings with Devil's Advocate findings (prefixed with `[DA]`).
   - Deduplicate: if both passes flag the same file and line for the same issue, keep the higher-priority version and note it was flagged by both passes.
   - In Markdown mode, add a `## Devil's Advocate Findings` section after the standard `## Findings` section.
   - In JSON mode, merge the Devil's Advocate findings into the `findings` array (the `[DA]` prefix in the title distinguishes them).
4. **Update the verdict.** If the Devil's Advocate pass surfaces P0 or P1 issues not found in the standard review, adjust the verdict and confidence accordingly.

## Full Review Mode (`--full`)

When `--full` is present, run **all** additional review passes in parallel after the standard review completes:

1. Devil's Advocate (as described above)
2. JIRA Completeness Verification (described below)
3. Code Simplification Review (described below)
4. Codex Review (described below) — **only if available** (see detection below)

All passes can be spawned simultaneously since they are independent of each other.

### JIRA Completeness Verification

#### 1. Extract JIRA IDs

Scan these sources (in order) for JIRA ticket references matching the pattern `AG-\d+` or `ST-\d+`:

1. **Branch name** — e.g., `ag-12345/fix-tooltip` or `ST-6789-update-utils`
2. **PR title and description** — from `gh pr view` or `$PR_TITLE`
3. **Commit messages** — from `git log` of the PR's commits

Collect all unique ticket IDs found. The pattern match is case-insensitive (both `ag-12345` and `AG-12345` should match). Normalise to uppercase for the sub-agent (e.g., `AG-12345`).

#### 2. Spawn the JIRA Completeness Sub-agent

Use the Agent tool to spawn a sub-agent with:

- The full contents of `agents/jira-completeness.md` (co-located in this skill's directory) as instructions.
- The extracted JIRA IDs.
- A brief PR summary (from the standard review or PR metadata).
- The list of changed files and diff stats.
- The `--json` flag state.

#### 3. Merge JIRA Findings

- Combine JIRA findings (prefixed with `[JIRA]`) with the standard review and Devil's Advocate findings.
- In Markdown mode, add a `## JIRA Completeness` section after `## Devil's Advocate Findings` (or after `## Findings` if Devil's Advocate is not separately flagged).
- In JSON mode, merge the JIRA findings into the `findings` array. Additionally, include the `jira_summary` object as a top-level field in the JSON output.
- If no JIRA IDs were found at all, include a P1 finding noting the PR has no associated JIRA ticket.

#### 4. Update the Verdict

If the JIRA verification reveals significant scope mismatches (PR does substantially different work than the ticket describes) or a missing JIRA link, factor this into the confidence score. JIRA hygiene findings alone (missing components, wrong status) should not change the code correctness verdict but should appear in `required_actions`.

### Code Simplification Review

#### 1. Spawn the Simplification Sub-agent

Use the Agent tool to spawn a sub-agent that performs the `/simplify` skill's analysis on the files changed by this PR. The sub-agent prompt should:

- List the files changed in the PR (from `git diff --name-only`).
- Instruct the agent to read those files and review the **changed sections** for opportunities to simplify — reuse existing utilities, reduce duplication, improve clarity, or eliminate unnecessary complexity.
- Instruct the agent to **report findings only, not make edits** — this is a review, not an auto-fix.
- Pass the `--json` flag state so output format matches.

The sub-agent should focus on the same concerns as the `/simplify` skill: reuse, quality, and efficiency. It should not flag style issues handled by linters or raise concerns about code it hasn't read.

#### 2. Merge Simplification Findings

- Combine simplification findings (prefixed with `[SIMPLIFY]`) with other findings.
- In Markdown mode, add a `## Simplification Opportunities` section after the JIRA section (or after whatever the last preceding section is).
- In JSON mode, merge findings into the `findings` array with the `[SIMPLIFY]` title prefix.
- Deduplicate against standard review findings — if the standard review already flagged the same issue (e.g., duplicated logic), keep the standard review version.

#### 3. Verdict Impact

Simplification findings are advisory and should not change the code correctness verdict or confidence score. They appear as P2 or P3 suggestions in `required_actions` only if they represent genuine quality concerns (e.g., copy-pasted logic that should be extracted).

### Codex Review (Optional)

This pass is **conditional** — it only runs when the Codex review skill is available in the current session.

#### 1. Detect Availability

Check the system-reminder skill list in the current conversation for the skill `codex:review`. If it is **not** listed, skip this entire section silently — do not warn, log, or mention its absence.

#### 2. Invoke the Codex Review

If `codex:review` is available, invoke it using the **Skill tool** with the PR number as the argument:

```
Skill: codex:review
Args: {PR_NUMBER}
```

Invoke this in parallel with the other sub-agent spawns (Devil's Advocate, JIRA, Simplification) in the same message. The Codex review skill is responsible for its own prompting and diff retrieval.

#### 3. Merge Codex Findings

- Prefix all Codex-originated findings with `[CODEX]` in the title.
- In Markdown mode, add a `## Codex Review` section after `## Simplification Opportunities` (or after whatever the last preceding section is).
- In JSON mode, merge Codex findings into the `findings` array with the `[CODEX]` title prefix.
- Deduplicate against findings from all other passes — if both the standard review (or any other pass) and Codex flag the same file and line for the same issue, keep the higher-priority version and note it was flagged by both.

#### 4. Verdict Impact

If the Codex review surfaces P0 or P1 issues not found by any other pass, adjust the verdict and confidence accordingly. P2/P3 Codex findings are advisory and do not change the verdict on their own.
