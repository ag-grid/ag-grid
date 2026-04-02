---
name: example
description: >-
  MUST load before creating or modifying any AG Charts, AG Grid, or AG Studio
  code example — whether for gallery, docs, or Plunker. Contains required
  conventions that differ from training data. Also load when troubleshooting
  example issues (TypeScript errors, rendering problems) or asking about
  example file structure and patterns.
context: fork
---
# Example Construction

This skill provides the foundational patterns for building examples across all AG products. Load the appropriate product guide based on what you're working with.

## When to Use

- Creating or modifying any example (gallery, docs, or Plunker)
- Understanding construction patterns, module registration, or controls
- Troubleshooting example issues (TypeScript errors, rendering problems)
- Checking enterprise vs community feature requirements

## Product Detection

Determine which product guide to load:

- **AG Charts**: Working in `ag-charts-*` packages, chart-related examples, or user mentions charts
- **AG Grid**: Working in `ag-grid-*` packages, grid-related examples, or user mentions grid
- **AG Studio**: Working in `ag-studio-*` packages or user mentions studio

## Product Guides

Each product has an `index.md` in its guide directory that describes which documents to load and when, plus product-specific critical rules.

| Product | Guide Directory | Index | Status |
|---------|----------------|-------|--------|
| AG Charts | `.rulesync/skills/example/ag-charts/` | `index.md` | Complete |
| AG Grid | `.rulesync/skills/example/ag-grid/` | — | Placeholder |
| AG Studio | `.rulesync/skills/example/ag-studio/` | — | Placeholder |

After detecting the product, read its `index.md` first, then load sub-documents as directed.
