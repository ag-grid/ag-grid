---
globs:
  - 'documentation/ag-grid-docs/src/content/docs/**/_examples/**/*'
alwaysApply: false
---

# Documentation Example Specs Must Be Meaningful and Framework-Validated

When you **add a new documentation example** (a new folder under a page's `_examples/`) or **create a new doc page** with examples, the example is not complete until its `example.spec.ts` asserts the behaviour the example demonstrates and passes in every framework the example has pages for. The placeholder spec only proves the grid mounts, so it does not stay (one exception, below).

**Invoke the `docs-e2e-tests` skill** ([SKILL.md](../skills/docs-e2e-tests/SKILL.md)): it reads the page's `index.mdoc` and the example source, writes assertions for that behaviour (not only that the grid loads), and runs the spec in every framework.

A behaviour that needs a real browser but is not what a docs example demonstrates (an arbitrary configuration, or an enterprise feature) belongs in `testing/e2e` instead: see *Choosing a layer* in `testing.md`.

**Exception: style-only examples.** An example whose only purpose is styling (CSS rules or theming API parameters) keeps the placeholder `example.spec.ts`, since styles are not tested (`testing.md`): a test may check the classes applied to the grid, never the computed style. This is the only case where the placeholder may stay.
