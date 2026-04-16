---
targets: ['*']
name: jira
description: >-
  Whenever the user asks to create a JIRA ticket, file a bug, log an issue,
  write up a ticket, split out a ticket, split off a feedback point, extract
  from a ticket, estimate a ticket, size effort, analyse a JIRA issue, do
  product analysis, or link tickets — ALWAYS invoke this skill first. Also
  invoke when **planning** ticket creation — e.g., drafting a plan that includes
  a "create JIRA ticket" step, or when in plan mode discussing what ticket to
  file. The skill provides field defaults (Track values, component mappings,
  description templates) that must be embedded in the plan so the user can
  review and adjust them before execution. Without this skill, plans and ticket
  creation will use wrong field values and fail. Covers all ticket types: Bug,
  Task, Feature Request, Improvement, Housekeeping, Doc change. Does NOT cover:
  reading tickets, checking status, adding comments, transitioning status,
  searching issues, or assigning tickets — those use Atlassian MCP tools
  directly. Does NOT cover: analysing source code, estimating code performance,
  or reviewing pull requests.
context: fork
---

# JIRA Skill

Unified skill for creating, estimating, and analysing JIRA tickets across AG products.

## Step 0: Verify Atlassian MCP Connection

Before doing anything else, verify the Atlassian MCP is available by calling `mcp__atlassian__atlassianUserInfo`. If the tool is not available, returns an error, or the MCP server is not connected:

**Hard stop.** Output the following and do not proceed:

```
Cannot proceed — Atlassian MCP is not connected.

This skill requires the Atlassian MCP server to interact with JIRA.
Please ensure the MCP connection is configured and active, then retry.
```

Do not attempt to work around the missing connection or produce partial results.

## Product Detection

Detect the product from the repository context:

- **AG Charts**: repos containing `ag-charts-community` — read `products/charts.md`
- **AG Grid**: repos containing `ag-grid-community` — read `products/grid.md`
- **AG Studio**: repos containing `ag-studio-core` or with project key `ST` — read `products/studio.md`

Read the appropriate product file **before** proceeding with any workflow.

## Workflow Routing

Based on user intent, read the corresponding workflow file (in the `workflows/` subdirectory of this skill):

| Intent | Keywords | Workflow |
|--------|----------|----------|
| **Plan** | In plan mode, drafting a plan that includes JIRA ticket creation | `workflows/plan.md` |
| **Create** | "create a JIRA", "file a bug", "write up a ticket", "log this issue", "split out", "split off", "extract from ticket" | `workflows/create.md` |
| **Estimate** | "estimate", "size", "analyse complexity", "how long", "effort" | `workflows/estimate.md` |
| **Analyse** | "analyse this issue", "product analysis", "UX analysis", "propose solutions" | `workflows/analyze.md` |

Read the workflow file, then follow its instructions.

## Critical: Pre-Creation Checklist

Before making ANY `createJiraIssue` API call, you MUST have read:

1. The **product file** (e.g., `products/charts.md`) — for component name, summary prefix, and version conventions.
2. The **workflow file** (e.g., `workflows/create.md`) — for the creation steps and completion checklist.
3. The **template file** (e.g., `templates/bug.md`) — for the exact description format.

Do not rely on training data or prior knowledge for JIRA field values or description format. The templates and workflows are the source of truth.

## Shared Reference

### Atlassian Cloud ID

All API calls use: `1565837d-d6d1-4228-bcb2-4cb74df700f2`

### Required Fields

| Field | API Name | Format |
|-------|----------|--------|
| Project | `projectKey` | `"AG"` (or `"ST"` for Studio) |
| Type | `issueTypeName` | `"Bug"` or `"Task"` |
| Summary | `summary` | `"[Product] Title"` (prefix from product file) |
| Description | `description` | See templates |
| Component | `components` | From product file |
| Track | `customfield_10501` | See track values below |

### Track Values (`customfield_10501`)

| Value | ID | Use For |
|-------|-----|---------|
| Bug | 10401 | Bug fixes |
| Feature Request | 10400 | New features |
| Improvement | 10403 | Enhancements |
| Housekeeping | 10404 | Tech-debt, refactoring |
| Doc change | 10402 | Documentation updates |

Format: `[{"value": "Bug"}]` or `[{"id": "10401"}]`

Each ticket has exactly **one** track value. Never set multiple track values on a single ticket.

### Description Formatting

- Use plain numbered lists: `1. Item` (not `#` wiki markup).
- Indent sub-items with 4 spaces: `    1. Sub-item`.
- **End numbered items with periods.**
- Bold: `**text**`.
- Code: backticks.
- **contentFormat**: Use `"markdown"` for all JIRA API calls. This accepts standard markdown syntax and converts it to JIRA's native ADF format.
- **URLs must use explicit markdown link syntax** — bare URLs will NOT become clickable links in JIRA. Always write `[https://example.com](https://example.com)` instead of just `https://example.com`. The URL should be visible as both the link text and the href (never hide it behind display text like `[Plunker](url)`).
- Empty sections: Just `N/A`.
- No comments — all info in description.
- When creating tickets from analysis/research documents, distil to decisions and recommendations only. Do not reproduce full analysis in the description — link to the analysis document in the "Design Documents" section instead.
- Related tickets: Use formal JIRA issue links (not ticket keys in description text). When a fix resolves downstream bugs, use "Blocks" link type. Use `mcp__atlassian__createIssueLink` to create links after ticket creation.

### Templates

- **Feature/Task**: `templates/feature-task.md` (12-section numbered format)
- **Bug**: `templates/bug.md` (TC-based format)

Follow the exact structure from the template. Do not use free-form markdown headers (`##`), tables, or code blocks for top-level structure.

### Reading JIRA Comments

To read comments on a ticket (e.g., for split-out workflows where you need to find a specific feedback point):

```
mcp__atlassian__getJiraIssue
  cloudId: "1565837d-d6d1-4228-bcb2-4cb74df700f2"
  issueIdOrKey: "AG-XXXXX"
  fields: ["comment"]
  expand: "renderedFields"
  responseContentFormat: "markdown"
```

**Warning:** The output is large (comments contain full ADF bodies). Pipe through Python/jq to extract text content. The `fetchAtlassian` ARI tool does **not** return comments — always use `getJiraIssue` with `fields: ["comment"]`.

### Ranking Issues (Agile API)

The Atlassian MCP tools **cannot** change issue rank. The `editJiraIssue` tool
silently ignores rank field updates — it returns success but the rank value is
unchanged. This is a known limitation of the standard JIRA REST API.

**Ranking requires the dedicated Agile REST API** called via `curl`:

```bash
source ~/.zshrc  # load JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN
curl -s -X PUT "${JIRA_URL}/rest/agile/1.0/issue/rank" \
  -H 'Content-Type: application/json' \
  -u "${JIRA_USERNAME}:${JIRA_API_TOKEN}" \
  -d '{
    "issues": ["PROJ-1", "PROJ-2", "PROJ-3"],
    "rankBeforeIssue": "PROJ-99",
    "rankCustomFieldId": 10120
  }'
```

Key facts:

-   **Rank custom field ID**: `10120` (`customfield_10120`, type
    `com.pyxis.greenhopper.jira:gh-lexo-rank`). This is instance-specific — not
    the common default `10019`. Discover it via
    `mcp__atlassian__getJiraIssueTypeMetaWithFields` and look for the field
    named "Rank".
-   **`issues` array preserves order**: `["A", "B", "C"]` with
    `rankBeforeIssue: "D"` results in A, B, C appearing in that order before D.
-   **Max 50 issues** per request.
-   **Success**: HTTP 204 (empty body). **Partial failure**: HTTP 207 with
    per-issue status.
-   **Auth**: Basic auth with `JIRA_USERNAME` (email) and `JIRA_API_TOKEN`
    (Atlassian API token from
    https://id.atlassian.com/manage-profile/security/api-tokens).
-   **Verify auth first**: `curl -s "${JIRA_URL}/rest/api/3/myself" -u
    "${JIRA_USERNAME}:${JIRA_API_TOKEN}"` — must return HTTP 200.
-   **Verify result**: Query with `ORDER BY rank ASC` via
    `${JIRA_URL}/rest/api/3/search/jql` to confirm the new ordering.

### Troubleshooting

**Discovering required fields:** Use `mcp__atlassian__getJiraIssueTypeMetaWithFields` with `cloudId`, `projectIdOrKey: 'AG'`, `issueTypeId: '10105'` (Task).

**Common errors:**

- **"Track/Components is required"**: Add `customfield_10501` and/or `components` array.
- **Ticket in Backlog instead of To Do**: Transition to "To Do" using transition ID `141` after creation.
- **Do not set `in_kanban` label**: Managed automatically — never add to `labels` field.
