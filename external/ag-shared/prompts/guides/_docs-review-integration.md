# Docs Review Integration Guide

This guide covers how to integrate the shared docs review methodology into any AG product repo (ag-grid, ag-studio, etc.).

## Architecture

The shared docs review uses an **inverted reference pattern** (same as PR reviews):

-   **Core files** (`external/ag-shared/prompts/commands/docs/_docs-review-core.md` and `_release-docs-review-core.md`): Generic workflow methodology, report structure, quality standards
-   **Thin wrappers** (plain files in each repo's `.rulesync/commands/`): Product configuration block + single reference line to the core

The LLM reads the product configuration first, then follows the core methodology, substituting product values at runtime. No build-time templating required.

## Prerequisites

-   The repo already uses `external/ag-shared/` as a git subrepo
-   The repo already uses rulesync and the `setup-prompts.sh` pipeline
-   No private prompts repo is required — all product-specific files are plain files in `.rulesync/`

## Step 1: Pull the Latest ag-shared

```bash
git subrepo pull external/ag-shared
```

This brings in the core files:

-   `external/ag-shared/prompts/commands/docs/_docs-review-core.md`
-   `external/ag-shared/prompts/commands/docs/_release-docs-review-core.md`

## Step 2: Create the Product Configuration Wrapper for `/docs-review`

Create `.rulesync/commands/docs-review.md` as a plain file. Sections marked with a "Required" note must be present — the core methodology references these by exact name.

```markdown
---
targets: ['*']
description: 'Review documentation pages for technical accuracy and example consistency'
---

# Documentation Review - [Product Name]

You are a technical documentation reviewer for [Product Name].

## Product Configuration

### Input Requirements
> Required — referenced by exact name in the core methodology.

User provides:
- Documentation page path: `[path to docs]/${pageName}/index.mdoc`
- Live dev URL: `[dev server URL]/${pageName}/`

### Orchestration Indicator
- Orchestrator script: `[path to orchestrator, if any]`

### File Resolution Rules
> Required — referenced by exact name in the core methodology.

Map documentation references to TypeScript definition files:

| If docs mention           | Then check file                          |
| ------------------------- | ---------------------------------------- |
| [Pattern for your product] | [Path to types package]                 |
| Interface name like `XxxOptions` | Search `[types path]/**/*`        |
| Generic config property   | `[path to main options file]`            |

### Implementation Resolution Rules
> Required — referenced by exact name in the core methodology.

Map features to source implementation files:

| Feature Category | Implementation Path Pattern |
| ---------------- | --------------------------- |
| [Your feature categories] | [Your source paths]    |

### Example Path Pattern
> Required — referenced by exact name in the core methodology.

`[docs path]/${pageName}/_examples/${exampleName}/`
- Required: `main.ts`
- Optional: `data.ts`, `styles.css`

### Exceptions File Path
`[docs path]/${pageName}/technical-review-exceptions.md`

### Output Paths
> Required — referenced by exact name in the core methodology.

- Review plans: `[plans path]/${pageName}.md`
- Reports: `[docs path]/${pageName}/reports/technical-review-report.md`
- Summary: `reports/docs-review/summary.md`

### Default Value Verification Hierarchy
> Required — referenced by exact name in the core methodology.
> Describe how default values are resolved in your product's architecture.
> For AG Charts this is: Module theme template -> @Property decorator -> TypeScript comments
> For AG Grid this might be: ColDef defaults -> GridOptions defaults -> etc.

### Product-Specific Conventions
- [List any API conventions specific to your product]
- [Known accepted patterns that should NOT be flagged]

## Review Methodology

**Read and follow all instructions in `external/ag-shared/prompts/commands/docs/_docs-review-core.md` for the review process, applying the product configuration above.**
```

## Step 3: Create the Product Configuration Wrapper for `/release-docs-review`

Create `.rulesync/commands/release-docs-review.md` as a plain file:

```markdown
---
targets: ['*']
description: 'Review all documentation changes between releases for accuracy and completeness'
---

# Release Documentation Review - [Product Name]

You are an expert documentation reviewer for [Product Name], specialising in
release documentation validation.

## Product Configuration

### Product
> Required — referenced by exact name in the core methodology.

- Name: [Product Name]
- Docs review command: `/docs-review`

### Paths
> Required — referenced by exact name in the core methodology.
- Docs root: `[path to docs content]`
- Types root: `[path to public types package]`
- Docs file pattern: `[docs root]/**/*.mdoc`
- Examples pattern: `[docs root]/**/_examples/`
- Types file pattern: `[types root]/**/*.ts`

### Release Branch Pattern
> Required — referenced by exact name in the core methodology.

- Format: `[your branch naming pattern, e.g. origin/bX.Y.Z]`
- Discovery command: `[shell command to list recent release branches]`

### Priority Pages
> Required — referenced by exact name in the core methodology.

**High priority** (getting started, key features, upgrade guides):
`[comma-separated list of high-priority page names]`

**Medium priority** (core features):
`[comma-separated list of medium-priority page names]`

### Output Paths
> Required — referenced by exact name in the core methodology.

- Reports directory: `reports/`
- Filtered task list: `reports/release-docs-review-${PREVIOUS}-${CURRENT}-filtered.md`
- Complete task list: `reports/release-docs-review-${PREVIOUS}-${CURRENT}-tasks.md`
- Summary: `reports/release-docs-review-${PREVIOUS}-${CURRENT}-summary.md`

### Verification Paths
After each page review, confirm these files exist:
- `[plans path]/${pageName}.md`
- `[docs path]/${pageName}/reports/technical-review-report.md`

## Review Methodology

**Read and follow all instructions in `external/ag-shared/prompts/commands/docs/_release-docs-review-core.md` for the review process, applying the product configuration above.**
```

## Step 4: Create Product-Specific Documentation Rules

The shared core handles the review workflow, but each product needs rules describing its documentation conventions. Create these in `.rulesync/rules/` (or `external/prompts/guides/`).

**Recommended supporting rules:**

These files are not referenced by the review core but provide context that improves review quality.

-   **`docs-pages.md`** — comprehensive guide to your documentation system: page types and standard structures, Markdoc/MDX component reference, content patterns, example integration conventions
-   **`docs-checklist.md`** — pre-submission quality checklist: content structure requirements, technical accuracy checks, example validation commands, framework compatibility checks

**Optional:**

-   **`playbook-docs.md`** — quick-reference workflow for docs changes
-   **`example-tester.md`** (sub-agent in `.rulesync/subagents/`) — if you want Full Mode interactive review (build, test, and validate examples). Without this, `/docs-review` operates in Adaptive/Degraded mode (static analysis only), which is still useful.

Use an existing product's versions as a reference for structure and level of detail.

## Step 5: Verify File Placement

Confirm the files are in the correct locations (all plain files, no symlinks needed):

```
.rulesync/
├── commands/
│   ├── docs-review.md           ← plain file (Step 2)
│   └── release-docs-review.md   ← plain file (Step 3)
└── rules/
    ├── docs-pages.md            ← plain file (Step 4)
    └── docs-checklist.md        ← plain file (Step 4)
```

## Step 6: Regenerate Tool Config

```bash
./external/ag-shared/scripts/setup-prompts/setup-prompts.sh
```

Verify the commands appear in `.claude/commands/`:

```bash
ls -la .claude/commands/docs-review.md .claude/commands/release-docs-review.md
```

## Step 7: Test

1. Run `/docs-review [path-to-a-docs-page]` and confirm the LLM reads both your wrapper and the core
2. Check that the report references your product's file paths (not another product's paths)
3. Run `/release-docs-review` with two release branches and confirm page discovery works with your paths

## Adoption Checklist

-   [ ] `git subrepo pull external/ag-shared` completed
-   [ ] `.rulesync/commands/docs-review.md` created as plain file with all REQUIRED sections
-   [ ] `.rulesync/commands/release-docs-review.md` created as plain file with all REQUIRED sections
-   [ ] `.rulesync/rules/docs-pages.md` created (or equivalent)
-   [ ] `.rulesync/rules/docs-checklist.md` created (or equivalent)
-   [ ] `setup-prompts.sh` run successfully
-   [ ] `/docs-review` tested on a real page
-   [ ] `/release-docs-review` tested between two branches

## Notes

-   **Batch orchestration**: The core methodology covers single-page and release-diff reviews. Batch orchestration across all pages is product-specific. Start with manual page-by-page invocation.
-   **Estimated adoption effort**: ~2-3 hours per repo.
-   **Section names are normative**: The core references wrapper sections by exact name. Renaming sections in either wrapper or core silently breaks cross-referencing.
