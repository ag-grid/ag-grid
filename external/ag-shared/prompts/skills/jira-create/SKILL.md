---
targets: ['*']
name: jira-create
description: Create JIRA tickets following AG project conventions. Guides you through bug reports, feature requests, and tech-debt tickets with proper formatting and required fields. Use when user asks to "create a JIRA", "file a bug", or "write up a ticket".
---

# JIRA Ticket Creation Skill

This skill guides you through creating properly formatted JIRA tickets for AG Charts (and AG Grid - patterns are similar, just change component to "Grid").

## When to Use This Skill

Activate this skill when the user requests:

-   "Create a JIRA ticket for this bug"
-   "File a bug report"
-   "Write up a feature request"
-   "Create a tech-debt ticket"
-   "Log this issue in JIRA"

## Prerequisites

-   Access to Atlassian MCP server for JIRA creation
-   Clear understanding of the issue or feature to document

## Workflow

### Step 0: Determine Ticket Type

Ask the user which type of ticket they need:

| Type            | Track Value         | Use When                                    |
| --------------- | ------------------- | ------------------------------------------- |
| **Bug**         | `"Bug"`             | Something is broken or behaving incorrectly |
| **Feature**     | `"Feature Request"` | New capability requested                    |
| **Improvement** | `"Improvement"`     | Enhancement to existing feature             |
| **Tech-debt**   | `"Housekeeping"`    | Refactoring, cleanup, infrastructure        |
| **Docs**        | `"Doc change"`      | Documentation updates only                  |

### Step 1: Load Appropriate Template

**Based on ticket type, read the relevant template:**

-   **Bug tickets**: Read `templates/jira-bug-template.md`
-   **Feature/Improvement/Tech-debt/Docs**: Read `templates/jira-template.md`

For detailed field values and formatting rules, read `guides/jira.md`.

### Step 2: Gather Information

**For Bug tickets, collect:**

-   [ ] Reproduction URL (Plunker, CodeSandbox, etc.)
-   [ ] Steps to reproduce (numbered list)
-   [ ] Actual vs Expected behaviour
-   [ ] Affected versions (test from end-user perspective in browser)
-   [ ] Root cause analysis (if known)

**For Feature/Improvement tickets, collect:**

-   [ ] Requirements statement (what, not how)
-   [ ] Current behaviour and problem
-   [ ] Use cases
-   [ ] API design (if applicable)
-   [ ] Acceptance criteria

**For Tech-debt tickets, collect:**

-   [ ] Context (why this work is needed)
-   [ ] Problem statement
-   [ ] Proposed solution
-   [ ] Acceptance criteria

### Step 3: Create the Ticket

Use the `mcp__atlassian__createJiraIssue` tool with this structure:

```json
{
    "cloudId": "1565837d-d6d1-4228-bcb2-4cb74df700f2",
    "projectKey": "AG",
    "issueTypeName": "Bug|Task",
    "summary": "[Charts] Clear, concise title",
    "description": "Formatted description from template",
    "additional_fields": {
        "components": [{ "name": "Charts" }],
        "priority": { "name": "Medium" },
        "customfield_10501": [{ "value": "Bug|Feature Request|Improvement|Housekeeping|Doc change" }]
    }
}
```

**For bug tickets, also include:**

```json
{
    "additional_fields": {
        "versions": [{ "name": "31.0.0" }]
    }
}
```

## Required Fields Reference

| Field           | API Name            | Required | Notes                                          |
| --------------- | ------------------- | -------- | ---------------------------------------------- |
| Project         | `projectKey`        | Yes      | Always `"AG"`                                  |
| Issue Type      | `issueTypeName`     | Yes      | `"Bug"` or `"Task"`                            |
| Summary         | `summary`           | Yes      | Start with `[Charts]` or `[Grid]`              |
| Description     | `description`       | Yes      | Use template format                            |
| Component       | `components`        | Yes      | `[{"name": "Charts"}]` or `[{"name": "Grid"}]` |
| Track           | `customfield_10501` | Yes      | See track values above                         |
| Priority        | `priority`          | No       | Defaults to Medium                             |
| Affects Version | `versions`          | No       | Required for bugs                              |
| Labels          | `labels`            | No       | Use `["tech-debt"]` for tech-debt tickets      |

## Completion Checklist

**Cannot mark complete until ALL checked:**

-   [ ] Correct ticket type selected
-   [ ] Template format followed
-   [ ] All required fields populated
-   [ ] Summary starts with `[Charts]` or `[Grid]`
-   [ ] Track field set correctly
-   [ ] For bugs: Affects Version included
-   [ ] URLs formatted as markdown links

## Critical Rules

1. **Always use templates** - Don't improvise description formats
2. **Test bugs in browser** - Not by analysing code
3. **Format URLs as markdown links** - `[text](url)` for clickability
4. **End numbered items with periods** - JIRA formatting requirement
5. **No comments** - Put all information in the description

## Product Notes

This skill is designed for **AG Charts**. For **AG Grid** tickets:

-   Change component to `[{"name": "Grid"}]`
-   Change summary prefix to `[Grid]`
-   Version offset: Grid version = Charts version + 22

## Related Documentation

-   Full field reference: `guides/jira.md`
-   Bug template: `templates/jira-bug-template.md`
-   Feature template: `templates/jira-template.md`
-   Estimation skill: `skills/estimate-jira/SKILL.md`
