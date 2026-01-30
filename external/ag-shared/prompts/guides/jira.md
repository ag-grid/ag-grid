---
targets: ['*']
description: 'Guidelines for searching and creating JIRA tickets in AG products'
---

# JIRA Guide

This guide covers working with JIRA tickets in AG products (Charts and Grid).

**Product scope**: AG Charts (for AG Grid, change component to "Grid" and prefix to "[Grid]").

## Quick Reference

-   **Search**: Project `AG`, Component `Charts`, Status `Needs Review` for review
-   **Summary prefix**: `[Charts]` or `[Grid]`
-   **Required fields**: Summary, Description, Component, Track

## Creating Tickets

Use the `jira-create` skill for guided ticket creation. It will:

1. Help you choose the right ticket type
2. Load the appropriate template
3. Guide you through required fields

## Required Fields

| Field       | API Name            | Format                                 |
| ----------- | ------------------- | -------------------------------------- |
| Project     | `projectKey`        | `"AG"`                                 |
| Type        | `issueTypeName`     | `"Bug"` or `"Task"`                    |
| Summary     | `summary`           | `"[Charts] Title"` or `"[Grid] Title"` |
| Description | `description`       | See templates                          |
| Component   | `components`        | `[{"name": "Charts"}]` (ID: 11061)     |
| Track       | `customfield_10501` | See track values below                 |

## Track Values (`customfield_10501`)

| Value           | ID    | Use For                |
| --------------- | ----- | ---------------------- |
| Bug             | 10401 | Bug fixes              |
| Feature Request | 10400 | New features           |
| Improvement     | 10403 | Enhancements           |
| Housekeeping    | 10404 | Tech-debt, refactoring |
| Doc change      | 10402 | Documentation updates  |

Format: `[{"value": "Bug"}]` or `[{"id": "10401"}]`

## Description Formatting

-   Use plain numbered lists: `1. Item` (not `#` wiki markup)
-   Indent sub-items with 4 spaces: `    1. Sub-item`
-   **End numbered items with periods**
-   Bold: `**text**`
-   Code: backticks
-   URLs: `[text](url)` for clickability
-   Empty sections: Just `N/A`
-   No comments - all info in description

## Bug Tickets

**Template**: `templates/jira-bug-template.md`

**Additional fields:**

-   `versions` (Affects Version): `[{"name": "31.0.0"}]`
-   Priority: `{"name": "Medium"}` (default for bugs)

**Version testing**: Test in browser (not code analysis). Charts v9 = Grid v31 (offset +22).

When creating bug tickets, test affected versions **from the browser** (not by analysing code):

1. Use the reproduction Plunker and change AG Charts version
2. Binary search versions to find when the bug was introduced
3. Set `versions` field to earliest affected version

## Feature/Task Tickets

**Template**: `templates/jira-template.md`

Sections: Requirements, Problem, Use cases, API Design, Breaking changes, Acceptance criteria.

## Troubleshooting

### Discovering Required Fields

```javascript
mcp__atlassian__getJiraIssueTypeMetaWithFields({
    cloudId: '1565837d-d6d1-4228-bcb2-4cb74df700f2',
    projectIdOrKey: 'AG',
    issueTypeId: '10105', // Task
});
```

### Common Errors

-   **"Track is required"**: Add `customfield_10501`
-   **"Components is required"**: Add `components` array
-   **Unknown field IDs**: Use metadata API above

## Related

-   Create tickets: `skills/jira-create/SKILL.md`
-   Estimate tickets: `skills/estimate-jira/SKILL.md`
-   Bug template: `templates/jira-bug-template.md`
-   Feature template: `templates/jira-template.md`
