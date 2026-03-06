---
targets: ['*']
name: batch-plunkers
description: 'Create a batch of Plunkers with one sub-agent per Plunker'
context: fork
---

# Batch Plunkers

Create multiple Plunker examples in parallel. Each sub-agent follows the `/plunker` skill workflow; the main thread orchestrates and collects results.

**Usage:**

```
/batch-plunkers AG-16727
/batch-plunkers "Create 3 examples showing grouped bar nulls with skipNullBars"
/batch-plunkers (then provide a spec table when prompted)
```

## STEP 1: Parse Input into Assignments

Determine the input mode and extract individual Plunker assignments.

### Mode A: JIRA Ticket

Use Atlassian MCP to read the ticket. Extract acceptance criteria from the description. Each AC becomes one Plunker assignment. The assignment text is the AC verbatim plus any relevant context from the ticket description (API name, feature being tested, etc.).

### Mode B: General Direction

Parse the user's natural language into discrete Plunker assignments. Ask the user to confirm the breakdown before proceeding.

### Mode C: Spec Table

User provides a markdown table with columns `#, Title, Description`. Use as-is.

### Confirm Before Proceeding

In ALL modes, present the assignment list to the user for confirmation before proceeding:

```
I found N acceptance criteria. Here are the Plunker assignments:
1. [AC text] → Plunker: [brief plan]
2. [AC text] → Plunker: [brief plan]
...
Proceed? (Y/adjust)
```

Wait for user confirmation. Do NOT launch sub-agents until confirmed.

## STEP 2: Prepare Context and Launch Sub-Agents

### 2a. Read the Product Guide

Read all `*-guide.md` files in the sibling plunker skill directory (`../plunker/`). These contain the product-specific file templates, CDN URLs, styling requirements, and common issues. The guide content will be included in each sub-agent prompt.

### 2b. Determine CDN and Resolve Enterprise/Community Per-Assignment

Ask the user which CDN to use (staging vs versioned). Then resolve enterprise vs community **for each individual assignment** — not as a blanket setting. Use the "Enterprise-Only Features" table in the product guide to determine this:

-   If the assignment uses any enterprise-only series type (e.g. heatmap, candlestick, sankey), axis (e.g. ordinal-time), or plugin (e.g. annotations, zoom, navigator) → **enterprise**
-   Otherwise → **community**

Record the resolved CDN URL for each assignment so sub-agents don't waste time discovering this themselves.

### 2c. Launch Sub-Agents

Launch one `general-purpose` Task sub-agent per assignment, **all in a single message** so they run concurrently. Use `run_in_background: true` on each.

Each sub-agent prompt **MUST** include:

1. The assignment text and plunker number
2. **The full product guide content inline** (from Step 2a) — paste the entire guide text into the prompt so the sub-agent has it immediately without needing to read files
3. The **resolved CDN URL** for this specific assignment (enterprise or community, from Step 2b)
4. Any feature context from the JIRA ticket
5. The exact upload command with the absolute path to `plnkr.sh`
6. Instruction to output the resulting `URL=` line
7. **Explicit instruction not to re-read guide files or the plnkr.sh script** — all necessary context is already in the prompt

**Sub-agent prompt template:**

````
Create a Plunker for the following assignment:

**Assignment #{PLUNKER_NUMBER}:** {ASSIGNMENT}

**CDN URL:** {RESOLVED_CDN_URL}
**Package:** {PACKAGE_NAME}
{FEATURE_CONTEXT}

## Instructions

1. Create a working directory: `PLNKR_DIR=$(mktemp -d /tmp/plnkr-batch-{PLUNKER_NUMBER}-XXXXXX)`
2. If the assignment involves non-trivial APIs, verify them against `packages/ag-charts-types/src` before writing files
3. Write all files per the product guide below (index.html, main.js, ag-example-styles.css, package.json, and optionally data.js)
4. Upload: `bash "{ABSOLUTE_PATH_TO_PLNKR_SH}" upload "$PLNKR_DIR" --title "{TITLE}" --tags "ag-charts,qa"`
5. Report the URL= line from the upload output

**IMPORTANT:** The product guide and upload command are provided below — do NOT spend tool calls re-reading the guide files, SKILL.md, or plnkr.sh.

## Product Guide

{GUIDE_CONTENT}
````

Wait for **all** sub-agents to complete before proceeding to Step 3.

## STEP 3: Output Summary

Present results as a markdown table:

```
| # | Title | AC | URL | Status |
|---|-------|----|-----|--------|
| 1 | ... | AC-1 | https://plnkr.co/edit/... | OK |
| 2 | ... | AC-2 | https://plnkr.co/edit/... | OK |
| 3 | ... | AC-3 | - | FAILED: [reason] |
```

If any failed, suggest re-running with just the failed assignments by providing the exact `/batch-plunkers` invocation or spec table.

## Notes

- **Sub-agent autonomy**: Each sub-agent handles the full lifecycle — file creation, CSS sourcing, and API upload via `plnkr.sh`. The main thread only orchestrates and collects results.
- **Rate limiting**: If the Plunker API returns 429 for a sub-agent, it should retry once after a brief pause.
- **Rerunning failures**: Copy the failed assignments into a spec table and re-run with Mode C.
- **Token lifecycle**: `plnkr.sh` manages access tokens internally per invocation. No shared token setup needed.
