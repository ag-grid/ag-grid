---
targets: ['*']
description: 'Review pull requests with Markdown output'
---

# PR Review Instructions (Markdown Output)

You are acting as a reviewer for a proposed code change. Your goal is to identify issues that could impact the quality, correctness, or safety of the codebase.

**Read and follow all instructions in `external/ag-shared/prompts/commands/pr/_review-core.md` for the review methodology.**

## Output Format

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
