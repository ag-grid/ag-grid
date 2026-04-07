# JIRA Ticket Creation Workflow

## Step 0: Determine Ticket Type

Ask the user which type of ticket they need:

| Type | Issue Type | Track Value | Use When |
|------|-----------|-------------|----------|
| **Bug** | `"Bug"` | `"Bug"` | Customer-reported bug |
| **Feature** | `"Task"` | `"Feature Request"` | New capability requested |
| **Improvement** | `"Task"` | `"Improvement"` | Internally reported bug |
| **Tech-debt** | `"Task"` | `"Housekeeping"` | Refactoring, cleanup, infrastructure |
| **Docs** | `"Task"` | `"Doc change"` | Documentation updates only |

Each ticket has exactly **one** track value. Never set multiple track values on a single ticket.

### Improvement Tasks

An "improvement task" is a hybrid: it uses the **bug template** (TC-based format) for the description but is filed as a **Task** with **Improvement** track — not as a Bug.

Use this when the user specifically asks for an improvement task or when behaviour is suboptimal but not strictly broken — e.g. a missing interaction, a poor default, or an inconsistency that needs a concrete reproduction to describe.

## Step 1: Load Appropriate Template

Based on ticket type, read the relevant template (in the `templates/` subdirectory of this skill):

- **Bug tickets and Improvement tasks**: Read `templates/bug.md`.
- **Feature/Tech-debt/Docs**: Read `templates/feature-task.md`.

## Step 2: Gather Information

**For Bug and Improvement tickets, collect:**

- [ ] Reproduction URL (Plunker, CodeSandbox, etc.).
- [ ] Steps to reproduce (numbered list).
- [ ] Actual vs Expected behaviour.
- [ ] Affected versions (test from end-user perspective in browser — see product file; required for Bug, optional for Improvement).
- [ ] Root cause analysis (if known).

**For Feature tickets, collect:**

- [ ] Requirements statement (what, not how).
- [ ] Current behaviour and problem.
- [ ] Use cases.
- [ ] API design (if applicable).
- [ ] Acceptance criteria.

When the user provides requirements that differ from existing PRDs or design documents, the user's stated requirements take precedence. Confirm requirements with the user before drafting — do not assume PRD content is final.

**For Tech-debt tickets, collect:**

- [ ] Context (why this work is needed).
- [ ] Problem statement.
- [ ] Proposed solution.
- [ ] Acceptance criteria.

## Subtask Rules

When creating a **Sub-task** (issue type `"Sub-task"` with a `parent` field):

1. **Track is always `Housekeeping`** — the parent ticket carries the feature/bug track. Subtasks are internal work items.
2. **No "split from" issue link** — the parent field already provides this relationship. Do not create a redundant "Work item split" link.
3. **Description format** — trivial or placeholder subtasks use bold headings + bullets. Subtasks with full requirements detail use the numbered template from `templates/feature-task.md`.
4. **fixVersion from user input** — when the user provides a version number (e.g., `35.3`) alongside priority/status, this is the **fixVersion** (`fixVersions: [{"name": "35.3.0"}]`), not story points. Append `.0` if the user gives a two-part version.

## Step 3: Create the Ticket

Use the `mcp__atlassian__createJiraIssue` tool. Substitute component, prefix, and project from the product file.

### Choose content format

Pick the format **before** writing the description — it determines how you structure the entire payload:

| Description mentions other JIRA tickets? | Format | Why |
|------------------------------------------|--------|-----|
| **Yes** (dependencies, related work, parent context) | `contentFormat: "adf"` | Only ADF supports `inlineCard` Smart Links. Markdown cannot render them. |
| **No** (standalone bug report, no cross-references) | `contentFormat: "markdown"` | Simpler to write; no ticket references to render. |

Most feature, subtask, and tech-debt tickets reference other tickets, so **ADF is the common case**. See the "Description Formatting" section for the `inlineCard` syntax.

### API call structure

```json
{
    "cloudId": "1565837d-d6d1-4228-bcb2-4cb74df700f2",
    "projectKey": "<from product file>",
    "issueTypeName": "Bug|Task",
    "summary": "[<Prefix>] Clear, concise title",
    "description": "<formatted description — ADF document or markdown string>",
    "contentFormat": "<adf or markdown — see table above>",
    "additional_fields": {
        "components": [{ "name": "<from product file>" }],
        "priority": { "name": "Medium" },
        "customfield_10501": [{ "value": "Bug|Feature Request|Improvement|Housekeeping|Doc change" }]
    }
}
```

**For Bug and Improvement tickets, also include:**

```json
{
    "additional_fields": {
        "versions": [{ "name": "<affected version>" }]
    }
}
```

Bug descriptions should be concise: test cases + notes only. Do not add acceptance criteria sections.

**For feature requests:** Do not include rationale or justification in the description. Rationale belongs in the linked PRD/design document, not in the ticket itself. The ticket should state **what** the feature is and its acceptance criteria, not **why** a particular approach was chosen. Link to the design document in the "Design Documents" section.

### Example: Completed Bug Ticket

**Summary:** `[Charts] Tooltip not shown when hovering near bar edge`

**Description:**

```
**TC1 - Tooltip missing at bar boundary**

1. Open and preview [https://plnkr.co/edit/abc123](https://plnkr.co/edit/abc123).

2. Hover the mouse over the rightmost edge of any bar in the bar chart.

    - **Actual:** No tooltip appears when the cursor is within ~2px of the bar edge.
    - **Expected:** Tooltip should appear consistently across the full bar area.

**Notes**

-   Root cause: Hit-testing uses bar bounds without accounting for stroke width offset.
-   Regression: Introduced in v9.3.0 (works correctly in v9.2.1).
```

## Step 4: Post-Creation Steps

After the ticket is created, perform these steps as applicable:

**1. Set fixVersion (if provided)**

When the user provides a version number (e.g., `35.3`) alongside other ticket fields, set it as `fixVersions`. Append `.0` if the user gives a two-part version (e.g., `35.3` → `"35.3.0"`). This is never story points — it is always fixVersion.

If `fixVersions` couldn't be set during creation (e.g., field not on create screen), use `mcp__atlassian__editJiraIssue` to set it after creation.

**2. Transition to "To Do" (only if a fixVersion was provided)**

If the user specified a fix version, transition the ticket out of Backlog immediately:

```
mcp__atlassian__transitionJiraIssue
  cloudId: "1565837d-d6d1-4228-bcb2-4cb74df700f2"
  issueIdOrKey: "<new ticket key>"
  transitionId: "141"
```

If no fixVersion was set, leave the ticket in Backlog.

**3. Create issue links (if applicable)**

If this ticket was split off from another, or blocks/is blocked by another ticket, create the link using `mcp__atlassian__createIssueLink`. Do not put ticket references only in the description text — use a formal link.

**Exception:** Do not create "split from" links for subtasks — the parent field already provides this relationship.

For "split from" links on non-subtask tickets, see the "Issue Link Direction" section below for correct inward/outward usage.

## Completion Checklist

**Cannot mark complete until ALL checked:**

- [ ] Correct ticket type selected.
- [ ] Template format followed.
- [ ] All required fields populated.
- [ ] Summary starts with correct product prefix.
- [ ] Track field set correctly.
- [ ] For Bug and Improvement tickets: Affects Version included.
- [ ] For Bug and Improvement tickets: Bug template used (reproduction steps, actual/expected).
- [ ] URLs use explicit markdown link syntax `[url](url)` — bare URLs are not clickable in JIRA.
- [ ] JIRA ticket references in description use ADF `inlineCard` Smart Links — not markdown links or bare keys.
- [ ] If fixVersion was provided: ticket transitioned from Backlog to "To Do".
- [ ] Issue links created (if split-off or related tickets exist).

## Issue Link Direction

The "Work item split" link type has: **inward** = "split from", **outward** = "split to".

To express "NEW-TICKET split from PARENT-TICKET":
- `inwardIssue` = **PARENT-TICKET** (the source — "split from" points here)
- `outwardIssue` = **NEW-TICKET** (the new ticket — "split to" points here)

Think of it as: the **inward** issue is the one being referenced ("split **from** X"), and the **outward** issue is the one the link is being created on.

## Description Formatting

- **JIRA ticket references must be Smart Links:** When referencing other JIRA tickets in description text, use ADF `inlineCard` nodes — these render as expanded Smart Links showing the ticket title and icon. Neither bare ticket keys (`AG-1234`) nor markdown links (`[AG-1234](url)`) expand into Smart Links. To create Smart Links: submit the description using `contentFormat: "adf"` with `{"type": "inlineCard", "attrs": {"url": "https://ag-grid.atlassian.net/browse/AG-1234"}}` inline in paragraph content. This applies everywhere a ticket is mentioned: dependencies, notes, parenthetical references, etc.
- **Inline code for option names:** Always wrap API option names, property names, and programmatic values in backticks (e.g., `enableRtl`, `skipNullBars: true`, `bar`). This distinguishes code from prose and improves readability.
- **Series type references:** When referencing series types, use backtick-wrapped type values (e.g., `bar`) rather than informal names like "bar/column".

## Critical Rules

1. **Always use templates** — Don't improvise description formats.
2. **Test bugs in browser** — Not by analysing code.
3. **End numbered items with periods** — JIRA formatting requirement.
4. **No comments** — Put all information in the description.
5. **No rationale in feature requests** — State **what** and acceptance criteria, not **why**.
6. **Improvement = internally reported bug** — Always use the bug template for Improvement tickets, not the feature/task template.
7. **Inline code for options** — Always wrap API option/property names in backticks in descriptions.
8. **URLs must be explicit markdown links** — Bare URLs are NOT clickable in JIRA. Always write `[https://url](https://url)`, never just `https://url`.
9. **JIRA ticket references must be Smart Links** — Use ADF `inlineCard` nodes, not markdown links or bare keys. Only `inlineCard` renders as an expanded Smart Link with the ticket title.
