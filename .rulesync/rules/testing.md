---
targets: ['*']
description: 'Testing strategies, Vitest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
---

# Testing — Quick Reference

For the full guide — runner flag reference, Vitest patterns, the complete async-waiting playbook, and snapshot usage — load the `/testing` skill.

## Choosing a layer

**Default to a behavioural test.** Behavioural tests in `testing/behavioural/` are the primary suite: they drive the full grid as a black box through the public `GridApi`. A package `*.test.ts` is only for pure logic (formatter, comparator, parser) with no grid-integration surface.

**Signs you're testing internals — write a behavioural test instead:** casting to `as any` for private state, hand-building `beans`/`gos`/`ctrlsSvc`, calling a private method to reach a branch, or spying on an internal method as the assertion. Such tests pass even when the real code path never runs.

Search `testing/behavioural` for an existing harness before assuming a behaviour can't be black-box tested (e.g. `DragEventDispatcher` drives real header drags); extend the harness rather than dropping to a unit test.

## Wait, don't sleep

**Poll async grid updates with `waitFor`** (from `@testing-library/dom`). **Never** `await asyncSetTimeout(<fixed n>)` and then assert — a guessed delay is flaky and slow. A `no-restricted-syntax` ESLint rule in `testing/behavioural/eslint.config.mjs` flags every `asyncSetTimeout(n)` where `n > 0`.

```typescript
api.setGridOption('rowData', ATHLETES);
await waitFor(() => expect(panel.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
```

`asyncSetTimeout(0)` is fine for flushing a single tick after a synchronous action. `asyncSetTimeout(1)` is the *same call* — Node clamps 0 to 1ms — so it buys nothing.

The skill covers the traps that make a `waitFor` unfalsifiable or a sleep load-bearing — negative assertions, polls that were already true, test IDs landing on a debounce, and sleeps that only look like safety margins — plus how to prove a wait is genuinely necessary. **Load it before converting any timing-dependent test.**

## Regression tests: cover every reproduction path

A bug rarely has one trigger. Enumerate the reproduction paths named in the ticket and add a test for each — a programmatic API call, a panel drag and a tool-panel drop are three tests, not one. Test the plural case, not just N=1, and assert the observable end state for every path.

## Commands

- `./behave.sh` — the whole unit suite (package + behavioural) via the Vitest workspace.
- `./benches.sh` — behavioural benchmarks in headless Chromium.
- `./docs-e2e.sh` — Playwright E2E against the docs site. The Nx target is `test:e2e`; there is **no** `e2e` target.

All three take `--help` and resolve only from the repo root — prefix with `cd "$(git rev-parse --show-toplevel)" &&` if the shell may have moved. `./behave.sh` does not type-check; run `yarn nx run ag-behavioural-testing:build:test` before committing. Some suites take minutes — allow a five-minute timeout and collect the exit status rather than treating silence as success.

## Key practices

- Prefer `GridRows` / `GridColumns` inline snapshots over raw API assertions where practical; update with `./behave.sh --update-grid-rows`.
- Repetition is fine in tests — prefer inline setup over shared factories. Do not flag duplicated test *setup* in review; **do** flag duplicated test *cases*.
- **Register the module before using a grid API.** Tests build their own module lists, so an unregistered API logs `error #200` and **no-ops silently**. A passing test prints no `error #200`.
