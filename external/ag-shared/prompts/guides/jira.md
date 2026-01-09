---
targets: ['*']
description: 'Guidelines for searching and creating JIRA tickets in AG products'
---

# JIRA Guide

This guide covers working with JIRA tickets in AG products.

## JIRA Ticket Search Guidelines

-   When searching for JIRA tickets using the MCP server `atlassian`, filter by the `AG` project.
-   Use the component appropriate for the product you're working on (e.g., `Grid` for ag-grid, `Charts` for ag-charts).
-   When searching for JIRA tickets that need review, we're usually interested in tickets with a status of `Needs Review`.

## JIRA Ticket Creation Guidelines

When creating JIRA tickets in the AG project, ensure the following required fields are set:

### Required Fields

-   **Track** (`customfield_10501`): REQUIRED. Choose one:
    -   `"Housekeeping"` - for tech-debt, refactoring, or infrastructure work
    -   `"Feature Request"` - for new features
    -   `"Bug"` - for bug fixes
    -   `"Improvement"` - for enhancements to existing features
    -   `"Doc change"` - for documentation updates
-   **Components**: REQUIRED. Set to the appropriate component for your product:
    -   For ag-grid: `[{"name": "Grid"}]`
    -   For ag-charts: `[{"name": "Charts"}]`
-   **Summary**: REQUIRED. Clear, concise title with appropriate prefix (e.g., `[Grid]` or `[Charts]`)
-   **Description**: REQUIRED. See format guidelines below

### Optional but Recommended Fields

-   **Priority**: Set appropriately (`"Critical"`, `"High"`, `"Medium"`, `"Low"`, `"None"`)
-   **Labels**: Use `["tech-debt"]` for technical debt tickets
-   **Fix versions**: Set target release version if known

### Description Format

Keep descriptions concise (10-15 lines of content max) with clear sections:

```markdown
## Context

Brief background on why this work is needed

## Problem

What issue or limitation exists

## Proposed Solution

High-level approach to address the problem

## Acceptance Criteria

-   Simple, testable criteria (not "Success Criteria")
-   Use bullet points with action verbs
-   Keep focused on outcomes
```

### Linking Tickets

-   Link to design documents using `docs.ag-grid.com` URLs (not gists or GitHub links)
-   To link issues: Add comments to both tickets mentioning each other (e.g., "Relates to AG-12345")
-   The direct issue linking API may not work reliably via MCP

### Example: Tech-Debt Ticket

```json
{
    "projectKey": "AG",
    "issueTypeName": "Task",
    "summary": "[Grid] Revisit column definition update architecture",
    "description": "## Context\n\n...\n\n## Problem\n\n...\n\n## Proposed Solution\n\n...\n\n## Acceptance Criteria\n\n- Design alternative approaches\n- Prototype and benchmark\n- Maintain current functionality",
    "additional_fields": {
        "components": [{ "name": "Grid" }],
        "labels": ["tech-debt"],
        "priority": { "name": "Low" },
        "customfield_10501": [{ "value": "Housekeeping" }]
    }
}
```
