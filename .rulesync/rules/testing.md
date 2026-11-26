---
targets: ['*']
description: 'Testing strategies, Vitest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
---

# Testing

What every test must follow. The `/testing` skill holds the runner flags, the async-waiting traps, test patterns, the `ag-test-utils` helpers (pickers, virtual lists, filters, drags, ResizeObserver) and snapshots.

## Choosing a layer

**Default to a behavioural test** in `testing/behavioural/`: it drives the whole grid through the public `GridApi` and the DOM, in happy-dom. A package `*.test.ts` is for pure logic only (formatter, comparator, parser). A test of internals (casting to `as any` for private state, hand-building `beans`/`gos`/`ctrlsSvc`, calling a private method, asserting on a spied internal method) passes even when the real path never runs. Search `testing/behavioural` for a harness first (`DragEventDispatcher` drives real header drags) and extend it rather than dropping to a unit test.

happy-dom has no layout engine, so the suite mocks one: `mockGridLayout` (`testing/ag-test-utils/src/polyfills/`, on in every behavioural file) gives elements sizes, rects and scroll sizes, enough for row and column virtualisation and scroll position. Search those polyfills before deciding a behaviour needs a browser, and extend them when a test needs a little more. Pick by what the behaviour depends on:

| Write a | When | Where |
| --- | --- | --- |
| Behavioural test (default) | Grid logic through `GridApi` and the DOM, layout the mocks model included | `testing/behavioural/` |
| Playwright e2e spec, as well | Real browser input, CSS layout or native controls the mocks cannot model (typing in an `<input>`, wheel scrolling, popup positioning), or Firefox and WebKit behaviour | `testing/e2e/e2e/*.spec.ts` |
| Docs-example spec | What a docs example demonstrates, in every framework | `example.spec.ts` beside the example (`docs-example-specs.md`) |

An e2e spec builds its grid with `mountGrid(page, { enterprise?, options: () => ({ ... }) })` (`testing/e2e/src/mountGrid.ts`; `options` is a function serialised into the page) from the UMD bundle in a blank page: the local build by default, `<site>/files/<package>/dist/` with `--url <site>` (or `BASE_URL`), such as a dev server or `https://grid-staging.ag-grid.com`. The enterprise bundle registers every enterprise module, so a spec cannot test a partial registration. E2E is **not in the PR CI**: the `Grid E2E Tests` workflow runs it nightly on Chromium, Firefox and WebKit and reports to Slack, so run `./grid-e2e.sh --all-browsers` before relying on a new spec.

## Files share one window per worker

The `behavioural` project runs **without per-file isolation**: each worker imports the grid once and keeps one window, document and module graph across the files it runs. At each file's end `testing/behavioural/vitest.setup.ts` destroys the grids left on the page, empties the body, restores real timers and stubbed globals, and resets the grid's module registry, logging and keyboard mode. It then fails the file if it left a DOM prototype, a DOM class, `window`, `document`, `navigator` or `console` changed, naming the property, and puts it back.

- Patch a shared object with `definePropertyForFile` or `onFileEnd` from `ag-test-utils`, which undo it at the file's end, or restore it yourself in `afterAll`; never leave a bare top-level `Object.defineProperty` in place.
- Keep tests independent: each sets up what it reads, never relying on what an earlier test or file left on the page.
- End a spy with `vi.restoreAllMocks()`: `vi.clearAllMocks()` and `vi.resetAllMocks()` leave it installed.
- A file needing a fresh module graph (`vi.mock`, import order, the licence key) is named `*.isolated.test.ts(x)` and runs in the `behavioural-isolated` project. The package projects and the benchmarks keep per-file isolation.

## Wait, don't sleep

**Poll async grid updates with `waitFor`** (`@testing-library/dom`). Never `await asyncSetTimeout(n)` and then assert: a guessed delay is flaky and slow, and the `no-restricted-syntax` ESLint rule in `testing/behavioural/eslint.config.mjs` flags every `asyncSetTimeout(n)` with `n > 0`.

```typescript
api.setGridOption('rowData', ATHLETES);
await waitFor(() => expect(panel.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
```

`asyncSetTimeout(0)` flushes one tick after a synchronous action; `asyncSetTimeout(1)` is the same call (Node clamps 0 to 1 ms). In a React suite, flush inside `act`: `waitFor` and `userEvent` are act-aware, a bare flush is not, and an update landing after a synchronous `act(...)` closed warns "An update to RowComp inside a test was not wrapped in act(...)".

```typescript
const flush = async () => { await act(async () => { await asyncSetTimeout(0); }); };
```

**Before converting a timing-dependent test, read the skill's waiting section**: negative assertions, polls that were already true, test IDs landing on a debounce, sleeps that only look like safety margins, and how to prove a wait is needed.

## Does this change need a test?

A test guards behaviour a user would notice if it broke: logic, state, events, keyboard and pointer interaction, API contracts. No test for:

- **Styling** (padding, colour, font, size, icons, theme parameters): asserting `paddingLeft === '12px'` restates the CSS and breaks on every design tweak. A style that decides what is visible, clickable or scrollable gets that outcome asserted, never the number.
- **Copy, docs and example text**: a docs-example spec covers only behaviour the example demonstrates.
- **Refactors**: the existing tests, passing unchanged, cover them.
- **Type-only and lint-only changes**: their gates cover them.
- **Behaviour already covered**: grep `testing/behavioural` and the e2e specs first.

A regression test is a few lines in the suite that owns the behaviour (`test-organisation.md`), not a new e2e spec for a one-property fix; one needing more setup than the fix calls for another layer or none. Delete a test that a legitimate refactor would break with no user-visible regression. A change without a test says why in its summary ("No test added: styling-only"); never add one to look thorough.

## Regression tests

- **A test per reproduction path** the ticket names, as each runs a different code path to the same end state: an API call, a panel drag and a tool-panel drop are three tests. Drive interactive entry points with the real harness (`DragEventDispatcher` for header and panel drags), never skipping them as awkward. Test several items as well as one (a single item often passes by coincidence), and assert each path's observable end state (`getColumnOrder(...)`), not only that nothing threw. Before finishing, re-read the ticket's steps to reproduce: each trigger has its test.
- **See it fail for the reason you expect**, at least once, while choosing the fix rather than as a closing gate: write it first (so the fix cannot bias the input you choose), or, when the fix already exists, apply the test before the patch or revert the patch to confirm red. A failure for the wrong reason (a typo'd selector, an unregistered module, a `waitFor` already true) proves nothing.
- **Pick the input that separates fixed from unfixed code.** A test green on both proves nothing; it misses a guard that stops a crash by skipping the work the function exists for.
- **Then refactor on green**, never skipped (simplify the fix, extract a harness, merge same-setup tests, add `GridRows`/`GridColumns`/`FilterDom` snapshots) with the tests unchanged: an assertion edited to keep passing is a behaviour change, and needs its own red step.

## Running

`./behave.sh` runs every unit project (package and behavioural) as one Vitest run. Every test script resolves only from the repo root: elsewhere call it by path (`../../behave.sh`), never through `cd "$(git rev-parse --show-toplevel)" &&`, which agent harnesses gate on. It does not type-check: `./checks.sh` does (its `build:test` covers the specs), so run both before committing. Locally, **always start them in the background** (the agent harness's background mode, which reports back when the run ends), never in the foreground, never piped (`| tail` reports the filter's exit status), and never wait with `sleep`. Under `CI` run them in the foreground.

```bash
./behave.sh --quiet                       # the whole unit suite; --quiet (summary and failures) is the usual choice
./behave.sh --quiet --bail 1 <path>...    # targeted: stop at the first failure
./checks.sh                               # type-check, lint and spec type-check, every project (quiet already)
./behave.sh --async --quiet               # only where the harness has no background mode: detaches, wakes nobody
./behave.sh --async-status                # then poll the run still going: exit 0 passed, 1 failed, 3 still running
./behave.sh --wait 600                    # or block up to 600 s on it (give the tool call a longer timeout)
```

Run one gate at a time: two at once starve the CPU, and React tests then overrun testing-library's 1 s `waitFor` timeout.

The first line printed is the log, `▶ tmp/_behave-output/<id>/output.log` (stdout and stderr, written live; `result.json` beside it; no `▶` means nothing ran): grep it during the run to stop early on a failure, and after it for the verdict, rather than running again. Every flag (`--no-diff`, `--slowest`, `--log-grep`, `--update-grid-rows`, `--kill`): `./behave.sh --help` and the skill. Other test scripts, each with `--help`: `./benches.sh [<file pattern>] [-t <name>]` (also `--profile`, `--bench-compare all`; the benchmarks rule, `.rulesync/rules/benchmarks.md`), `./docs-e2e.sh` (Nx target `test:e2e`; there is no `e2e` target), `./grid-e2e.sh` (chromium by default, `--all-browsers`, `--project=<name>`, `--url <site>`).

**A targeted run includes the tests guarding the change's surface**, as extra file filters: `./behave.sh tooltip main-internal react.test`. Add `main-internal` when an export or `AG_GRID_INTERNAL` annotation changes, `react.test` (the `*-react.test.tsx` files) when rendering or load timing changes.

## Speed

- **Every test's cost is measured, so design a new one to be cheap.** The suite's mean is ~40 ms. Locally a test costing over 2 s of its own CPU time and waits warns as a yellow `SLOW`, and over 5 s it **fails** as `TOO SLOW` (a busy machine does not trip either); CI only warns, at 15 s. A whole file is limited too, as it runs its tests one after another in one worker and a `beforeAll` fixture is charged to no test: over 5 s it warns as `SLOW FILE`, over 11 s it **fails** as `TOO SLOW FILE` (CI warns at 30 s). Thresholds: `testing/shared/vitest/timings.ts`. Run a new or changed file once and read its per-test times (`./behave.sh --quiet <file>` prints the warnings; `--slowest N` ranks tests, files and idle time). Keep the fixture small (the rows and columns the behaviour needs), share an expensive read-only fixture across a file's tests in `beforeAll` (a test that mutates it builds its own), and wait on state, never on time. **A slow test you meet is yours to fix**, whoever wrote it: a `SLOW` warning or a file far above its neighbours' per-test rate in a run you started gets fixed in that change (or, when large, its own), never left for the next run.
- **Never pass a timeout to `test()`**: `testing/shared/vitest/output.setup.ts` fails on measured cost, so an override only lets a slow test run to its failure. The time is the bug.
- **A slow test is usually waiting, not working**: check its CPU (`--slowest` ranks idle time) for a fixed timer it out-waits, a product timeout that fires only because happy-dom has no layout or CSS transitions, or a poll on a state reached later than one already assertable.
- **`FAST_TEST_TIMINGS` collapses a hard-coded grid delay in this suite only**: `packages/ag-stack/src/fastTestTimings.ts` exports `false`, which `testing/behavioural/vitest.config.ts` aliases to `true`. Branch where the delay is a constant: `const MIN_TOOLTIP_DELAY = FAST_TEST_TIMINGS ? 0 : 200`. Each read stays a ternary in the shipped bundle, so use it only where the delay costs the suite real time. A delay a grid option sets never goes behind it (set the option); lifting a floor helps only once the test asks for the small value; suites asserting the timing keep the real values.
- **Read a slow file by its per-test rate**, not its total: a high total at a normal rate is volume. Vitest parallelises across files, not within one, so split a long matrix into sibling files sharing a harness module, with `test.each` so a failure names its case: one of the few cases that outweighs extending the suite that owns the behaviour (`test-organisation.md`). Each extra file costs a fixed load (collecting it and running its setup files, ~0.3 s), so split only a file the `SLOW FILE` limit or its per-test rate flags.

## The harness

- **Grid events reach listeners asynchronously**, whether added with `api.addEventListener` or as an `on…` grid option: a spy read straight after an `api.*` call shows 0 calls, so `waitFor` it. Only `ALWAYS_SYNC_GLOBAL_EVENTS` (`gridPreDestroyed`, `fillStart`, `pasteStart`, `issueRaised`) arrive during the call.
- **`TestGridsManager` turns off row and column virtualisation, row animation and DOM reordering** (`suppressRowVirtualisation`, `suppressColumnVirtualisation`, `ensureDomOrder: true`). A test of virtualisation passes `suppressColumnVirtualisation: false` (or the row one) in its grid options; `ensureColumnVisible` and the other scroll APIs need `ScrollApiModule`.
- **Every grid warning and error throws**: the setup's `beforeEach` calls `enableDevValidations({ throwOn: <every severity> })` before each test. A test asserting a diagnostic opts out inside that test with `enableDevValidations({ suppress: [id] })`; in `beforeAll` the next `beforeEach` re-arms it. A passing test prints nothing: an expected warning is asserted through a spy, restored after.
- **Register the module before using a grid API.** Tests build their own module lists, and an unregistered API reports `error #200` and no-ops.
- **The global `expect` has Jest's types** (from `@testing-library/jest-dom`), which take no message: to pass one (`expect(v, 'why')`), `import { expect } from 'vitest'`, or `./checks.sh` fails the spec type-check.
- Prefer `GridRows`/`GridColumns` inline snapshots to raw API assertions: write `.check('')` and fill it with `./behave.sh --update-grid-rows` (the skill's snapshot section has the argument forms).
- Repetition is fine in tests: inline setup over shared factories, so each test reads top to bottom; only an expensive read-only fixture is shared, in `beforeAll` (Speed above). Flag duplicated test cases in review, not duplicated setup.
