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
- Remaining positional argument — the PR number

Examples: `123`, `--json 123`, `123 --json`

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
