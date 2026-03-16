---
targets: ['*']
name: jira
description: >-
  Whenever the user asks to create a JIRA ticket, file a bug, log an issue,
  write up a ticket, estimate a ticket, size effort, analyse a JIRA issue, do
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
| **Create** | "create a JIRA", "file a bug", "write up a ticket", "log this issue" | `workflows/create.md` |
| **Estimate** | "estimate", "size", "analyse complexity", "how long", "effort" | `workflows/estimate.md` |
| **Analyse** | "analyse this issue", "product analysis", "UX analysis", "propose solutions" | `workflows/analyze.md` |

Read the workflow file, then follow its instructions.

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
- URLs: Paste raw URLs directly (JIRA auto-links them); avoid `[text](url)` markdown links.
- Empty sections: Just `N/A`.
- No comments — all info in description.
- When creating tickets from analysis/research documents, distil to decisions and recommendations only. Do not reproduce full analysis in the description — link to the analysis document in the "Design Documents" section instead.
- Related tickets: Use formal JIRA issue links (not ticket keys in description text). When a fix resolves downstream bugs, use "Blocks" link type. Use `mcp__atlassian__createIssueLink` to create links after ticket creation.

### Templates

- **Feature/Task**: `templates/feature-task.md` (12-section numbered format)
- **Bug**: `templates/bug.md` (TC-based format)

Follow the exact structure from the template. Do not use free-form markdown headers (`##`), tables, or code blocks for top-level structure.

### Troubleshooting

**Discovering required fields:** Use `mcp__atlassian__getJiraIssueTypeMetaWithFields` with `cloudId`, `projectIdOrKey: 'AG'`, `issueTypeId: '10105'` (Task).

**Common errors:**

- **"Track/Components is required"**: Add `customfield_10501` and/or `components` array.
- **Ticket in Backlog instead of To Do**: Transition to "To Do" using transition ID `141` after creation.
- **Do not set `in_kanban` label**: Managed automatically — never add to `labels` field.
