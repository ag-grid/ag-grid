# AG Charts Example Guide

This index describes which AG Charts example documents to load and when.

## Core Documents

| Document | Purpose | When to Load |
|----------|---------|-------------|
| `chart-construction.md` | Axes, modules, container, controls, updates | Always for new examples |
| `quality-rules.md` | Styling rules, formatters, deprecated APIs | Always when editing examples |
| `enterprise-features.md` | Enterprise vs community matrix | When deciding imports/CDN |
| `validation.md` | Build and validate commands | Before committing |
| `examples-guide.md` | Repo paths, guidelines, validation, Plnkr integration | When working with example infrastructure |
| `framework-patterns.md` | Framework transformation technical reference | When debugging framework generation issues |

## Progressive Feature Modules

Feature modules live in `features/` and provide deep guidance on specific chart features. Load based on need.

| Tier | Files | When to Load |
|------|-------|-------------|
| **Tier 1 — Essentials** | `tooltips.md`, `theme-overrides.md` | Always for quality work |
| **Tier 2 — Enhancement** | `axes.md`, `legends.md`, `data-labels.md` | When improving visual hierarchy, readability, or layout |
| **Tier 3 — Advanced** | `enterprise.md`, `segmentation.md`, `reference-lines.md`, `recent-features.md` | When PREVis identifies specific advanced needs |

## Critical Rules

These five rules apply to **every** AG Charts example. Internalise them before reading sub-documents.

1. **No hardcoded colours or fonts.** Never set `fill`, `stroke`, `color`, `fontSize`, `fontWeight`, or `fontFamily`. The theme handles all visual styling.

2. **Object-based axes syntax (v13+).** Use `axes: { x: { type: 'category' }, y: { type: 'number' } }` — not the legacy array syntax. Always specify `type` on every axis.

3. **Root-level formatters.** Prefer `formatter: { y: ..., x: ... }` at the options root so axes, labels, and tooltips share one definition. Only nest formatters when they genuinely differ.

4. **Tooltip `heading` required.** When using a custom tooltip `renderer`, always include `heading` in the return object to prevent empty lines. `heading` is the primary label at the top (category name for pie/donut, x-axis value for cartesian); `title` is the series name.

5. **Specific chart option types.** Use `AgCartesianChartOptions` for cartesian charts and `AgPolarChartOptions` for polar charts. Hierarchy charts (treemap, sunburst) use generic `AgChartOptions`. Financial charts use `AgFinancialChartOptions`.
