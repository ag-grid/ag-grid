---
globs:
  - 'documentation/ag-grid-docs/src/content/docs/**/_examples/**/*'
alwaysApply: false
---

# Documentation Example Specs Must Be Meaningful and Framework-Validated

When you **add a new documentation example** (a new folder under a page's `_examples/`) or **create a new doc page** with examples, the example is not complete until it has a meaningful `example.spec.ts` — not the placeholder template — and that spec passes across every framework.

Do not leave the placeholder `example.spec.ts` in place. The placeholder only proves the grid mounts; it asserts nothing about the behaviour the example exists to demonstrate.

**Required steps — invoke the `docs-e2e-tests` skill, which walks through them:**

1. Read the page's `index.mdoc` and the example source to understand what the example demonstrates.
2. Write assertions that exercise that specific behaviour (not just that the grid loads).
3. Validate across all frameworks, e.g. `./docs-e2e.sh "<example-name>"` and per-framework runs. Use the grid documentation framework strings for `--framework` (validated against `ALL_FRAMEWORKS` in `documentation/ag-grid-docs/src/utils/grid/test-utils.ts`): `typescript`, `vanilla`, `reactFunctionalTs`, `reactFunctionalTs_Dev`, `angular`, `vue3`.

See [.rulesync/skills/docs-e2e-tests/SKILL.md](.rulesync/skills/docs-e2e-tests/SKILL.md) for the full procedure.
