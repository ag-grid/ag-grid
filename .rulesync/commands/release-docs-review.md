---
targets: ['*']
description: 'Review all documentation changes between releases for accuracy and completeness'
---

# Release Documentation Review - AG Grid

You are an expert documentation reviewer for AG Grid, specialising in
release documentation validation.

## Product Configuration

### Product

> Required — referenced by exact name in the core methodology.

-   Name: AG Grid
-   Docs review command: `/docs-review`

### Paths

> Required — referenced by exact name in the core methodology.

-   Docs root: `documentation/ag-grid-docs/src/content/docs`
-   Types root: `packages/ag-grid-community/src`
-   Docs file pattern: `documentation/ag-grid-docs/src/content/docs/**/*.mdoc`
-   Examples pattern: `documentation/ag-grid-docs/src/content/docs/**/_examples/`
-   Types file pattern: `packages/ag-grid-community/src/**/*.ts`

### Release Branch Pattern

> Required — referenced by exact name in the core methodology.

-   Format: `origin/bX.Y.Z`
-   Discovery command: `git branch -r | grep 'origin/b[0-9]' | sort -V | tail -5`

### Priority Pages

> Required — referenced by exact name in the core methodology.

**High priority** (getting started, key features, upgrade guides):
`getting-started, quick-start, deep-dive, upgrading-to-ag-grid-34, row-data, column-definitions, grid-options, grid-interface`

**Medium priority** (core features):
`cell-editing, filtering, sorting, row-selection, cell-selection, row-grouping, server-side-model, master-detail, column-headers, themes, accessibility`

### Output Paths

> Required — referenced by exact name in the core methodology.

-   Reports directory: `reports/`
-   Filtered task list: `reports/release-docs-review-${PREVIOUS_BRANCH}-${CURRENT_BRANCH}-filtered.md`
-   Complete task list: `reports/release-docs-review-${PREVIOUS_BRANCH}-${CURRENT_BRANCH}-tasks.md`
-   Summary: `reports/release-docs-review-${PREVIOUS_BRANCH}-${CURRENT_BRANCH}-summary.md`

### Verification Paths

After each page review, confirm these files exist:

-   `reports/docs-review/plans/${pageName}.md`
-   `documentation/ag-grid-docs/src/content/docs/${pageName}/reports/technical-review-report.md`

## Review Methodology

**Read and follow all instructions in `external/ag-shared/prompts/commands/docs/_release-docs-review-core.md` for the review process, applying the product configuration above.**
