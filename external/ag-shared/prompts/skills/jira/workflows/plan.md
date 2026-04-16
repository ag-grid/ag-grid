# JIRA Ticket Planning Workflow

Use this workflow when the user is **planning** JIRA ticket creation — i.e., drafting a plan that will be reviewed and adjusted before execution. The goal is to embed the correct field values and description template into the plan so the user can see and override the defaults before any API calls are made.

## Step 0: Detect Product and Ticket Type

1. Read the appropriate product file (from the `products/` subdirectory of this skill) based on the repository context.
2. Determine the ticket type from the user's description using the same mapping as `create.md`:

| Type | Issue Type | Track Value |
|------|-----------|-------------|
| **Bug** | `"Bug"` | `"Bug"` |
| **Feature** | `"Task"` | `"Feature Request"` |
| **Improvement** | `"Task"` | `"Improvement"` |
| **Tech-debt** | `"Task"` | `"Housekeeping"` |
| **Docs** | `"Task"` | `"Doc change"` |

## Step 1: Load the Description Template

Read the appropriate template file (from the `templates/` subdirectory):

- **Bug / Improvement task**: `templates/bug.md`
- **Feature / Tech-debt / Docs**: `templates/feature-task.md`

## Step 2: Output the Plan

Structure the plan with two sections: **Fields** (the API parameters) and **Description** (the ticket body using the template). Fill in every value you can derive from context; mark unknowns with `[TODO: ...]` so the user knows what to fill in.

### Plan structure

```markdown
## Action: Create JIRA Ticket

### Fields
- **Cloud ID:** 1565837d-d6d1-4228-bcb2-4cb74df700f2
- **Project:** <from product file, e.g. AG>
- **Type:** <issueTypeName, e.g. Bug>
- **Summary:** <[Prefix] concise title>
- **Component:** <from product file, e.g. Charts>
- **Track:** <track value, e.g. Bug> (customfield_10501)
- **Priority:** <High | Medium | Low — default Medium>
- **Affects Version:** <version if known, or [TODO: test in browser]>

### Description

<Paste the filled-in template here, using the exact TC-based or numbered-list format from the template file. Do not use free-form ## headers.>

### Issue Links (if any)
- **Link type:** <e.g. Problem/Incident, Blocks, Relates>
- **Direction:** <this ticket "is caused by" / "blocks" / "relates to"> <OTHER-TICKET>
```

### Important

- **Use the template format exactly.** The description must follow the TC-based (bug) or numbered-list (feature) template structure — not free-form markdown with `##` headers.
- **Track is not Component.** Track values are: Bug, Feature Request, Improvement, Housekeeping, Doc change. Component values come from the product file (e.g., Charts, Grid).
- **Include all required fields.** The plan must specify every field needed for `mcp__atlassian__createJiraIssue` so execution doesn't need to discover them at runtime.
- **Mark gaps explicitly.** If information is missing (e.g., reproduction URL, affected version), use `[TODO: ...]` rather than omitting the field. This lets the user decide whether to fill it in or remove it.

## Why This Matters

Plans are an intermediate artifact that the user reviews and adjusts before execution. If the plan contains wrong defaults (e.g., a non-existent Track value), the user approves bad data. Execution then follows the plan faithfully, leading to API errors or incorrectly filed tickets. By embedding the correct defaults in the plan, the user can make informed adjustments and the execution step becomes straightforward.
