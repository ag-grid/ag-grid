---
targets: ['*']
name: testing
description: 'Full testing reference for AG Grid — behavioural vs package test layers, regression-test coverage, the complete runner flag reference (behave.sh / benches.sh / docs-e2e.sh), Vitest patterns, async waiting patterns (waitFor vs asyncSetTimeout), and GridRows/GridColumns snapshots. Use when writing or modifying tests, choosing a test layer, debugging a flaky or timing-dependent test, or looking up a test-runner command.'
---

# Testing Guide

The reference behind the testing rule (`.rulesync/rules/testing.md`, loaded beside every test file), which holds the rules: choosing a layer, files sharing one window per worker, waiting, when a change needs a test, regression tests, speed and the harness's defaults. Read it first; this page adds the suites' layout, the runners, the waiting traps, patterns, the `ag-test-utils` helpers and snapshots.

## The suites

- **Behavioural** (`testing/behavioural/`), the primary suite: the unit under test is a behaviour, not a function or file; fakes over mocks (happy-dom plus `mockGridLayout` for layout); the grid driven only through its public API and the DOM, as a user would. It runs **without per-file isolation**: one window and module graph per worker, reset at each file's end (the rule says what that asks of a test). `*.isolated.test.ts(x)` files run in the isolated `behavioural-isolated` project.
- **Package tests**, `packages/*/src/**/featureName.test.ts` beside the source, for pure logic. Each package project keeps per-file isolation.
- Also under `testing/`: `ag-test-utils` (harnesses, polyfills, `GridRows`), `e2e` (Playwright grid specs), `accessibility`, `csp`, `module-size*`, the Angular, React and Vue package tests (`testing/angular-tests` still uses Jest), and `shared` (the Vitest config helpers, thresholds, setup file and slow-tests reporter).
- **Config**: the project list and root config are `vitest.workspace.ts` and `vitest.config.ts` at the repo root; each project keeps its own `vitest.config.ts`. Runner-global options (reporters, `outputFile`, coverage, `sequence`) must be set in the root config: Vitest ignores them in a project config. Project options (pool, environment, `setupFiles`) do not cascade from the root, so each package project gets them from `unitProjectTestConfig` in `testing/shared/vitest/shared.ts`.

## The unit suite: `./behave.sh`

One multi-project Vitest run of the package unit tests (`ag-stack`, `ag-grid-community`, `ag-grid-enterprise`, `locale`) and the `behavioural` and `behavioural-isolated` projects, no Nx needed. Run it in the background and from the repo root, as the rule's Running section says. Every script takes `--help`.

```bash
./behave.sh                                         # the whole unit suite
./behave.sh "cell-editing-regression"               # files matching a pattern, in every project
./behave.sh "cell-editing-regression" -t "should handle"   # a test by name (positional patterns and -t: Vitest has no --testPathPattern)
./behave.sh --project behavioural                   # one project: ag-stack, ag-grid-community, ag-grid-enterprise, locale, behavioural, behavioural-isolated
./behave.sh --project all                           # every workspace project, incl. docs and ag-website-shared
./behave.sh --watch
```

### Reading a run

- **The first line is the log path**, `▶ tmp/_behave-output/<id>/output.log`: stdout and stderr, colours stripped, written live. No `▶` means nothing ran. Beside it sit `command`, `status` and, for `./behave.sh` only, Vitest's `result.json` (kept for the 50 newest runs); `latest` links the newest run, and runs older than a week are pruned. `--no-log` turns capture off; under `CI` nothing is captured.
- **`--quiet`, the usual choice**, prints the paths, the summary and every failure (the lines each script's `failRe`/`summaryRe` patterns in `scripts/gate/gates/*.mjs` mark), and hides a test's own `console.log`; a hand-written `--log-grep '×|FAIL|Tests '` is a worse, Vitest-only spelling of it. `./checks.sh` is quiet already. **`--log-tail N`** and **`--log-grep RE`** (a regex, else a substring) print part of the log at the end; both imply `--quiet`, keep the run's exit status, and combine (`--log-grep RE --log-tail 5` prints the last 5 matches). Keep `--log-grep` for what `--quiet` hides: a probe's output, or Vitest's `Errors  N error` line, an error thrown outside any test (an unhandled rejection, a late timer), which fails the run with no failed test to show for it.
- **Checking on a run**: `--async-status [id]` (exit 0 passed, 1 failed, 3 still running; takes an id or any path holding one, and defaults to the run still going, else the newest), `--wait [id] [secs]` (the same default; `latest` is the newest run started, not the one still going; a bare number is the timeout; it blocks the shell, so give the tool call a timeout above `secs`), `--kill [id]` (the run and every process it spawned). `--async` detaches the run, and nothing wakes an agent when it ends: use it only where the harness has no background mode, then poll with `--async-status` or block with `--wait`.
- **`--bail 1` by habit** in a fix-one-error loop: it stops at the first failure and skips the remaining reporting (`--bail N` for N). With `--reporter=json --outputFile=…` the file stays valid and the tests never run are `pending`, so read `success`, not `numPassedTests`.
- **A red run reports for far longer than it runs**: printing a grid DOM node has no practical bound. `--no-diff` (env `AG_NO_DIFF=1`) gives names and messages only, for a suite failing wholesale: get the failing list first, then re-run one file with diffs on; `--diff-lines N` (env `AG_DIFF_LINES`, default 80, 0 unbounded) caps each diff; `--stack-trace-len N` (env `AG_STACK_TRACE_LEN`, default 40) shortens stacks, never below 20: Vitest finds a `toMatchInlineSnapshot` by walking the stack, and a shorter one fails every inline snapshot with "Couldn't infer stack frame".
- `behave.sh` turns colour off for an agent or a pipe. The shared setup (`testing/shared/vitest/output.setup.ts`) sets `DEBUG_PRINT_LIMIT` to 1000 for every unit project (testing-library's default is 7000), so a failed query prints a slice of the grid.

### `--slowest N`: where the time went

Default 5 (env `AG_SLOWEST_TESTS`, 0 silences it). Each table lists only entries above a minimum set in `testing/shared/vitest/timings.ts`, so a healthy run prints little:

- **Slowest tests** and **slowest files**: read a file by its per-test rate (its time divided by its test count, the `ms/test` column), not its total. The `SLOW FILE` limit judges a file by its own CPU time and waits instead, hooks included, so a fixture moved into `beforeAll` still counts.
- **Idle**: files ranked by off-CPU milliseconds, above 1 s locally (env `AG_WAITING_MIN_MS`). Idle time is usually a fixed timer the test waits out, which a fix can remove; but `eventLoopUtilization` counts every event-loop wait, so worker RPC and inline-snapshot writes land here too. Ranked by the absolute time, as 3 s inside a 10 s file is still 3 s.
- **Worker time**: total worker-seconds, the parallel factor against wall time, and the split between `load` (collecting each file and running its setup files; the grid itself is imported once per worker) and `tests`. Load is a per-file constant, so an extra file is never free; once the parallel factor reaches the core count, wall time only falls by spending fewer worker-seconds. Read the figure off a run: any number written here goes stale.

## Other runners

- **Benchmarks**: `./benches.sh`, in headless Chromium; `.rulesync/rules/benchmarks.md` holds the flags, comparison runs and how to write one.
- **One package through Nx**: `yarn nx test ag-grid-community -- "featureName" -t "should handle"` (`--` forwards the file pattern and `-t` to Vitest).
- **Docs e2e**: `./docs-e2e.sh` (Playwright against the docs site, chromium): `"toolbar"` for files, `--grep "Quick filter"` for a test, `--all-browsers`, `--framework reactFunctionalTs`, `--ui`. Through Nx: `yarn nx test:e2e ag-grid-docs` (there is no `e2e` target).
- **Grid e2e**: `./grid-e2e.sh` builds the UMD bundles (Nx-cached), installs its browsers and runs Playwright from `testing/e2e`: `--all-browsers`, or `--project=firefox "enterprise" --grep "row group"` (one browser, files matching `enterprise`, tests matching `row group`). A spec mounts its grid with `const grid = await mountGrid(page, { enterprise: true, options: () => ({ columnDefs: [...], rowData: [...] }) })`: `options` is a function, serialised into the page, so it cannot close over spec variables; `grid.withApi((api) => ...)` runs code against the grid API in the page. Drive the grid with `page.mouse` and `page.keyboard`, and wait with web-first `expect` (`toPass` for input whose effect spans frames, such as a Firefox wheel scroll).

## Waiting for async grid updates

The rule holds the basics (`waitFor`, never a fixed sleep, `asyncSetTimeout(0)` for one tick, `act` in React). The traps:

### The sleep that looks safe

A fixed sleep before a call that already polls, or before a raw state read, looks like a safety margin and is not one:

```typescript
async function openEditDialogViaMenu(api: GridApi, colKey: string): Promise<void> {
    showColumnMenu(api, colKey);
    await asyncSetTimeout(10); // redundant: clickColumnMenuItem already polls
    await clickColumnMenuItem('Edit Calculated Column');
    await asyncSetTimeout(1); // a guess gating whatever the caller asserts next
}
```

Delete both: the first only adds latency, and a trailing sleep in a helper silently becomes its callers' synchronisation; the caller polls its own assertion instead. Most nonzero delays already in the suite are `asyncSetTimeout(1)`: judge each by what follows it, and if the next line reads async state, it needs `waitFor`. A real timer window the grid debounces on (as `waitForMissingModuleReports` from `ag-test-utils` waits on) keeps its delay with `// eslint-disable-next-line no-restricted-syntax -- <the window it waits on>`.

### Negative assertions

`waitFor` cannot prove "this never happened": a poll for something already true passes on its first tick. When the assertion is that a call was not made, or no second event came, the fixed delay is the window in which the unwanted call would arrive, and replacing it with `waitFor` removes the check. Poll a positive signal first, and fall back to the window only when none exists:

```typescript
// Preferred: poll a positive signal, then assert the negative over the settled state.
await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
expect(errorSpy).not.toHaveBeenCalled();

// Fallback: nothing positive follows the event that must not arrive.
await waitFor(() => expect(events.length).toBeGreaterThan(0)); // the first, expected event
// eslint-disable-next-line no-restricted-syntax -- window in which a second, redundant columnEverythingChanged would arrive
await asyncSetTimeout(10);
expect(events).toHaveLength(1);
```

The signal must provably land after the thing ruled out; one that can settle first shrinks the window towards zero and is worse than the sleep.

### Proving a wait is needed

Delete it and see the test still pass, at whole-file scope at least, never under `-t "<one test>"`: a filter skips the tests that ran before, so it changes what has already happened when the assertion fires. A green `-t` run proves nothing about a wait.

### The poll that was already true

After a mutation, check what the polled condition was before it: if already true, `waitFor` resolves at once, the assertion never sees the new state, and the test passes for any implementation. This bites "state survives a rebuild" tests, where the state asserted after is the state that held before. Gate on what can only be true after the mutation (a new instance, a changed count, a new column), then assert; a synchronous mutation costs the gate nothing, and the gate keeps the assertion able to fail if the work is later deferred.

```typescript
const groupBeforeRebuild = api.getProvidedColumnGroup(openedIds[0]);
api.setGridOption('columnDefs', makeDefs());
await waitFor(() => expect(api.getProvidedColumnGroup(openedIds[0])).not.toBe(groupBeforeRebuild));
expect(openGroupIds(api)).toEqual(openedIds);
```

### Test IDs land on a debounce

Test IDs exist only when `setupAgTestIds()` (from `ag-grid-community`, like `agTestIdFor`) ran before the grid was created. `TestIdService` stamps `data-testid` in a debounced pass off grid events, so a new cell has no test ID until a macrotask has passed. Gating a `*ByTestId` query on another condition does not cover it (`waitFor` yields no macrotask when its callback passes at once): poll the lookup itself.

```typescript
const cellOfRow = (rowIndex: number) => getByTestId(gridDiv, agTestIdFor.cell(`ROW_${rowIndex}`, 'sunshine'));

await waitFor(() => {
    expect(gridDiv.querySelector('.ag-range-handle')).toBeTruthy();
    for (let i = 0, len = rowData.length; i < len; ++i) {
        cellOfRow(i);
    }
});
```

## Regression tests in this suite

The rule holds the method (a test per path, red first, the separating input, refactor on green). Here:

- Merging tests onto one grid can weaken what they prove, because state left by one case carries into the next. Run each merge; a case passing only from a fresh grid is a finding about the code, and keeps its own grid with the reason in a comment.
- Snapshot bodies are generated (`./behave.sh --update-grid-rows`), never hand-written. Regenerating a stale snapshot and accepting whatever comes out is the same mistake: check the diff is the change you meant.
- For any early return, name what the function does after it that a caller depends on: if the skipped work is the function's purpose, the guard is the bug. `AbstractHeaderCellCtrl.shouldStopEventPropagation` crashed on an unguarded `focusSvc.focusedHeader!`; an early `return false` stopped the crash and also skipped `suppressHeaderKeyboardEvent`, the method's purpose. Its test configured `suppressHeaderKeyboardEvent: () => false`, indistinguishable from the guard's `false`, so it could never fail. A callback returning `true` separates them and shows the right fix: fall back to the cell's own `column` and `rowCtrl.rowIndex`, what the focus service would have stored.

## Patterns

- Name a test by the behaviour it expects. Cover the boundaries and error paths the change introduces, and critical paths thoroughly; aim for meaningful coverage, not 100%.
- Arrange, act, assert; `it.each` for a plain input-to-expected table; for complex cases a record of named `{ input, expected }` examples looped into one `it` each.
- Clean up in `afterEach`, ending spies with `vi.restoreAllMocks()` (the rule says why).
- Merge tests that differ only in assertions into one test with sequential assertions.
- Review similar tests when adding one, for a consistent verification pattern; follow the ESLint rules and the conventions in `.rulesync/rules/grid-code-conventions.md`.
- Register each module a test uses; to find an API's module, grep the method under `packages/*/src` or read `moduleName=` in the `error #200` URL. Benchmarks too.

## The harness: happy-dom and `ag-test-utils`

Everything below is exported from `ag-test-utils` (`testing/ag-test-utils/src`). The utilities grow with the tests: when they miss a scenario a new test needs, fix them rather than working around the gap.

- **Layout**: `mockGridLayout` is on in every behavioural file and its options reset at each file's end. `mockGridLayout.useRealOffsetDimensions = true` sources `offset*`/`client*` from the mocked rects (page-key navigation, sticky rows: read those from `.ag-grid-sticky-top-rows-container`); `elementHeightOverride` sizes one element (wrapped text driving auto height). Set back between tests in a file that needs both states.
- **ResizeObserver**: `mockGridLayout` installs one that reports its mocked sizes; `triggerResizeObservers(el)` reports a size it cannot see (one a test set). The grid handles the callback on the next frame, so poll the result.
- **Pickers**: AgSelect and AgRichSelect open on `mousedown`, so `.click()` does nothing: `openPicker(root)` or `firePointerLikeClick(el)`. A rich-select row is picked from its `clientY`: `selectRichSelectRow(label)`, unscrolled lists only.
- **Virtual lists** (AgRichSelect, the set filter list, the advanced filter builder) render only the rows in their viewport: assert on the values fed in, or the `aria-setsize`, not on the rendered row count; `nudgeVirtualList(selector)` makes one re-render against the mocked height. AgSelect is not virtualised.
- **Filters**: `ColumnFilterHarness`, `FloatingFilterHarness`, `FilterDom` (snapshots of a filter's DOM; rejects `'empty'`), `AdvancedFilterHarness` and `AdvancedFilterBuilderHarness` (its first render has no drag source: `forceReRender()` first). `installFilterLayoutMock(height)` sizes filter lists. Set `debounceMs: 0` in filter params, and treat an element under a `.ag-hidden` ancestor as hidden.
- **Pointer and drag**: `DragEventDispatcher` (header and panel drags) and `RowDragDispatcher` drive the grid's real drag service; `initPointerEventPolyfill()` adds pointer events (`RowDragDispatcher` installs it). happy-dom has no `DragEvent` (`ensureDragEvent` stands in), and `'onpointerdown' in el` is true there, so the grid listens for pointer events: press a cell with `fireGridPointerDown`, not a bare `mousedown`.
- **Grids**: `gridsManager.createGridAndWait` waits for `firstDataRendered` with no timeout, so a grid that never renders hangs the test until Vitest's timeout. Between grids in one test, `gridsManager.reset()` clears the once-only warnings and missing-module reports; `getGridElement(api)` returns a grid's DOM root.
- **SSRM selection**: read it with `api.getServerSideSelectionState()`; its plain and grouped shapes differ, so never hand-type one.
- **React**: a change to a cell or row ctrl's rendering lifecycle gets a React test under `<StrictMode>` that unmounts, remounts and re-renders (`row-span-auto-height-react.test.tsx` is the precedent).

## GridRows and GridColumns snapshots

Prefer them to raw API assertions in behavioural tests: readable inline snapshots of the grid, generated by the runner. Write the placeholder `''`, then fill it:

```typescript
import { GridColumns, GridRows } from 'ag-test-utils';

await new GridRows(api, 'description').check(''); // rendered rows: values, grouping, selection
await new GridColumns(api, 'description').checkColumns(''); // column state: visibility, order, pinning, pivot
expect(api.getDisplayedRowCount()).toBe(3); // a return value, payload or count a snapshot cannot show
```

```bash
./behave.sh --update-grid-rows                    # update all (--update-grid-rows=dry previews)
./behave.sh --update-grid-rows "column-lookup"    # matching files only
```

- **`check` validates every rendered cell** as well as comparing the diagram: a cell missing or covered by a span, its text, editor and checkbox state. The harness registers what it needs by default.
- **The argument is required**: omitted, the spec type-check fails and, outside update mode, the call throws. `'empty'` asserts no displayed rows; `true` (prints the diagram) and `'skip-snapshot'` compare nothing, though the cell validation still runs, so neither ships in a finished test: grep for them before finishing.
- **A failing check retries** at 10, 50 and 100 ms and, when a retry passes, warns `GridRows flaky check at <file:line> … passed only after Nms of retries` on stderr. That warning is a race in the test: wait on the state the check needs before calling it, never wrap `check` in `waitFor` (two nested polls hide the race). `AG_NO_RETRY=1 ./behave.sh <file>` turns the retries off, to prove a fix.
