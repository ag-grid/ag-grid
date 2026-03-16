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

**For Tech-debt tickets, collect:**

- [ ] Context (why this work is needed).
- [ ] Problem statement.
- [ ] Proposed solution.
- [ ] Acceptance criteria.

## Step 3: Create the Ticket

Use the `mcp__atlassian__createJiraIssue` tool. Substitute component, prefix, and project from the product file:

```json
{
    "cloudId": "1565837d-d6d1-4228-bcb2-4cb74df700f2",
    "projectKey": "<from product file>",
    "issueTypeName": "Bug|Task",
    "summary": "[<Prefix>] Clear, concise title",
    "description": "Formatted description from template",
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

1. Open and preview https://plnkr.co/edit/abc123.

2. Hover the mouse over the rightmost edge of any bar in the bar chart.

    - **Actual:** No tooltip appears when the cursor is within ~2px of the bar edge.
    - **Expected:** Tooltip should appear consistently across the full bar area.

**Notes**

-   Root cause: Hit-testing uses bar bounds without accounting for stroke width offset.
-   Regression: Introduced in v9.3.0 (works correctly in v9.2.1).
```

## Completion Checklist

**Cannot mark complete until ALL checked:**

- [ ] Correct ticket type selected.
- [ ] Template format followed.
- [ ] All required fields populated.
- [ ] Summary starts with correct product prefix.
- [ ] Track field set correctly.
- [ ] For Bug and Improvement tickets: Affects Version included.
- [ ] For Bug and Improvement tickets: Bug template used (reproduction steps, actual/expected).
- [ ] URLs pasted as raw URLs (not markdown links).

## Critical Rules

1. **Always use templates** — Don't improvise description formats.
2. **Test bugs in browser** — Not by analysing code.
3. **End numbered items with periods** — JIRA formatting requirement.
4. **No comments** — Put all information in the description.
5. **No rationale in feature requests** — State **what** and acceptance criteria, not **why**.
6. **Improvement = internally reported bug** — Always use the bug template for Improvement tickets, not the feature/task template.
