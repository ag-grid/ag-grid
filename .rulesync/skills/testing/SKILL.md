---
targets: ['*']
name: testing
description: 'Full testing reference for AG Grid — behavioural vs package test layers, regression-test coverage, the complete runner flag reference (behave.sh / benches.sh / docs-e2e.sh), Vitest patterns, async waiting patterns (waitFor vs asyncSetTimeout), and GridRows/GridColumns snapshots. Use when writing or modifying tests, choosing a test layer, debugging a flaky or timing-dependent test, or looking up a test-runner command.'
---

# Testing Guide

This guide covers testing strategies and best practices for the AG Grid codebase.

## Behavioural Tests — Primary Test Suite

Behavioural tests in `testing/behavioural/` are the primary test suite for AG Grid. They test the grid as a **black box**, instantiating the full grid to verify complex behaviours and features.

**Key principles:**

- The unit under test is a **behaviour**, not a function, class, method, or file
- **Avoid mocking** — prefer fakes instead (e.g., fake DOM)
- Test at the edges of the system to ensure real integration using public APIs

## Choosing a Test Layer

**Default to a behavioural test.** A package `*.test.ts` that instantiates a feature class directly is only for pure logic (formatter, comparator, parser) with no grid-integration surface. Anything that manifests through the running grid belongs in `testing/behavioural/`, driven via the public `GridApi`.

**These are signs you're testing internals — write a behavioural test instead:** casting to `as any` for private state, hand-building `beans`/`gos`/`ctrlsSvc`, calling a private method to reach a branch, or spying on an internal method as the assertion. Such tests pass even when the real code path never runs.

Search `testing/behavioural` for an existing harness before assuming a behaviour can't be black-box tested (e.g. `DragEventDispatcher` drives real header drags); extend the harness rather than dropping to a unit test.

`./behave.sh` runs the merged unit suite in a single Vitest workspace (`vitest.workspace.ts`): the package (London-school) `*.test.ts` files **and** the behavioural (Chicago-school) suite together, no Nx required. `yarn nx test <package>` still runs one package's tests on its own (retained for retrocompat).

## Regression Tests: Cover Every Reproduction Path

A bug rarely has one trigger. The same broken behaviour is usually reachable through several entry points — a programmatic API call, `applyColumnState`, a panel drag, a tool-panel drop — that run **different code paths** to the same end state. A fix that only patches the path in the ticket's first repro step can leave the others broken.

When writing regression tests for a bug fix:

- **Enumerate the reproduction paths named in the ticket, and add a test for each.** If the ticket says the bug reproduces via `addRowGroupColumns`, the Row Group Panel, and the Columns tool-panel drop zone, that is three tests, not one. Interactive entry points count — drive them with the real harness (`DragEventDispatcher` for header/panel drags) rather than skipping them because they're awkward to set up.
- **Test the plural case, not just N=1.** If the fix reorders, inserts, or buckets a *list* of things, cover adding two or three, not only one. Single-item cases often pass by coincidence (no reordering needed) while the multi-item case is where the logic actually bites.
- **Assert the observable end state for every path**, e.g. `getColumnOrder(...)`, not just that the operation didn't throw.

Before finishing, re-read the ticket's "Steps to reproduce" and confirm each distinct trigger has a corresponding test. A fix verified through only one of several documented triggers is not fully verified.

## Test Structure

### Directory Layout

```
testing/
├── accessibility/     # Accessibility compliance tests
├── behavioural/       # Grid behaviour verification
├── csp/               # Content Security Policy tests
├── module-size/       # Bundle size monitoring
├── performance/       # Performance regression tests
└── shared/            # Shared test utilities
```

### Package Tests

Unit and integration tests are co-located with source code:

```
packages/ag-grid-community/src/
├── feature/
│   ├── featureName.ts
│   └── featureName.test.ts
```

## Running Tests

### The merged unit suite (Vitest) — `./behave.sh`

`./behave.sh` is the single command for the whole unit suite: the package unit tests (`ag-stack`, `ag-grid-community`, `ag-grid-enterprise`, `locale`) plus the behavioural suite, run together through the Vitest workspace from the repo root. Watch mode is disabled by default:

```bash
# Run the whole unit suite (package + behavioural)
./behave.sh

# Filter by file pattern across every project
./behave.sh "cell-editing-regression"

# Run a specific test by name
./behave.sh "cell-editing-regression" -t "should handle"

# Run only one project (its vitest test.name), e.g. behavioural-only
./behave.sh --project behavioural

# Run every project in the workspace, incl. the node-env tooling suites (docs, ag-website-shared)
./behave.sh --project all

# Watch mode
./behave.sh --watch
```

> `./behave.sh` does not type-check (Vitest strips types via esbuild). Before committing, run `yarn nx run ag-behavioural-testing:build:test` to type-check.
>
> `./behave.sh` and `./benches.sh` resolve only from the repository root, so an agent whose shell has changed directory — earlier in the same command, or carried over from a previous one — will not find them. Prefix with `cd "$(git rev-parse --show-toplevel)" &&` rather than hardcoding a machine-specific path.
>
> Some suites take several minutes; `testing/behavioural/src/charts/format-panel-options.test.ts` alone runs ~2.5 minutes. Allow a timeout of at least five minutes, and wait for the run to finish and report its exit status — if the runner detaches the command, collect the result rather than treating silence as success.
>
> The workspace membership and shared config live in `vitest.workspace.ts`, `vitest.config.ts`, and `vitest.shared.ts` at the repo root; each project keeps its own `vitest.config.ts`. Runner-global options (reporters, `onConsoleLog`, pool) must live in the **root** config — Vitest ignores them in a project config during a workspace run.

### Benchmarks

Behavioural benchmarks live in `testing/behavioural/` and run via `./benches.sh`. They run in a real headless Chromium (Playwright) by **default**, so layout-dependent work is measured against a real layout engine. Run `./benches.sh --help` for the full usage (it prints vitest's `bench --help` followed by benches.sh's own options).

```bash
# Run all benchmarks
./benches.sh

# Run specific benchmark file (positional arg forwarded to `vitest bench`)
./benches.sh "tree-data-path"

# Run a specific benchmark by name within matching files
./benches.sh "tree-data-path" -t "flattening"

# V8 CPU profile (node-only) — writes a .cpuprofile for method-cost analysis
./benches.sh --profile "tree-data-path"
```

For baseline/compare runs, `./benches.sh --bench-compare <base|test|compare|all|backup> [...]` forwards to `bench-compare.mjs` (e.g. `./benches.sh --bench-compare all --runs 3`).

### Per-package unit tests (Nx, retrocompat)

`./behave.sh` already covers these, but an individual package's tests can still be run on their own through Nx. Vitest takes positional file patterns and `-t` for test names — **not** jest's `--testPathPattern`/`--testNamePattern`:

```bash
# Run all tests for a package
yarn nx test ag-grid-community

# Run tests in files matching a pattern (forwarded to `vitest run`)
yarn nx test ag-grid-community -- "featureName"

# Run a specific test by name within matching files
yarn nx test ag-grid-community -- "featureName" -t "should handle"
```

(`testing/angular-tests` still uses Jest.)

### E2E Tests (Playwright)

E2E tests run via Playwright against the docs site. `./docs-e2e.sh` runs them directly from the repo root, bypassing Nx, and defaults to chromium only:

```bash
# Run all E2E tests (chromium)
./docs-e2e.sh

# Run tests matching a file pattern
./docs-e2e.sh "toolbar"

# Run a specific test by name
./docs-e2e.sh "toolbar" --grep "Quick filter"

# Run against all browsers
./docs-e2e.sh --all-browsers

# Run with a specific framework
./docs-e2e.sh --framework react

# Open Playwright UI mode
./docs-e2e.sh --ui
```

The Nx target is still available when needed. Note the target is `test:e2e` — there is **no** `e2e` target on `ag-grid-docs`:

```bash
yarn nx test:e2e ag-grid-docs
```

**Note:** Vitest does not support `--testPathPattern` or `--testNamePattern`. Use positional arguments for file matching and `-t` for test name filtering.

## Test Patterns

### Package Unit Tests (Vitest)

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('FeatureName', () => {
    let instance: FeatureName;

    beforeEach(() => {
        // Arrange - setup
    });

    afterEach(() => {
        // Cleanup
        vi.resetAllMocks();
    });

    describe('#methodName', () => {
        it('should handle expected case', () => {
            // Arrange
            const input = createInput();

            // Act
            const result = instance.methodName(input);

            // Assert
            expect(result).toBe(expected);
        });
    });
});
```

### Parameterised Tests

Use `it.each()` for testing multiple cases:

```typescript
it.each([
    ['case1', input1, expected1],
    ['case2', input2, expected2],
])('should handle %s', (_, input, expected) => {
    expect(functionUnderTest(input)).toBe(expected);
});
```

### Test Data Records

For complex test cases, use records:

```typescript
const EXAMPLES: Record<string, TestCase> = {
    BASIC: {
        input: {
            /* ... */
        },
        expected: {
            /* ... */
        },
    },
    EDGE_CASE: {
        input: {
            /* ... */
        },
        expected: {
            /* ... */
        },
    },
};

for (const [name, example] of Object.entries(EXAMPLES)) {
    it(`handles ${name}`, () => {
        expect(process(example.input)).toEqual(example.expected);
    });
}
```

### Waiting for Async Grid Updates

Much grid behaviour resolves asynchronously — set-filter values load after the panel attaches, reloads run off a debounce/microtask, and so on. To observe such an update, **poll the condition with `waitFor`** (from `@testing-library/dom`) so the test proceeds the moment the state is ready:

```typescript
import { waitFor } from '@testing-library/dom';

api.setGridOption('rowData', ATHLETES);
await waitFor(() => expect(panel.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
```

**Do not** `await asyncSetTimeout(<fixed n>)` and then assert. A guessed delay is flaky (too short under load) and slow (always waits the full time). Nonzero fixed delays scattered through the suite are legacy, not the pattern to copy. A `no-restricted-syntax` ESLint rule in `testing/behavioural/eslint.config.mjs` flags every `asyncSetTimeout(n)` where `n > 0`.

`await asyncSetTimeout(0)` is fine for its distinct purpose: flushing a single microtask/event-loop tick after a synchronous action (e.g. after setting a native input value) before reading the result.

**`asyncSetTimeout(1)` is the same call as `asyncSetTimeout(0)`.** Node clamps a `0` delay to 1ms, so a `(1)` buys no extra safety over a `(0)` — and no safety at all when the update needs more than one tick. Most of the suite's nonzero delays are spelled `(1)` for this reason. Judge such a site by what follows it, not by the number: if the next line reads async state, it needs `waitFor`.

#### The sleep that looks safe

A fixed sleep placed *before* a call that already polls internally, or before a raw state read, reads as a safety margin and is not one. Both shapes appear here:

```typescript
async function clickColumnMenuItem(name: string): Promise<void> {
    const menuItem = await waitFor(() => { /* ... */ }); // already polls
    menuItem.click();
}

async function openEditDialogViaMenu(api: GridApi, colKey: string): Promise<void> {
    showColumnMenu(api, colKey);
    await asyncSetTimeout(10); // redundant — the callee already polls
    await clickColumnMenuItem('Edit Calculated Column');
    await asyncSetTimeout(1); // a guess gating whatever the caller asserts next
}
```

Delete the first sleep: `clickColumnMenuItem` polls, so waiting before it adds latency and no determinism. Delete the second too, and have the caller poll its own assertion with `waitFor` — a trailing sleep in a helper silently becomes the caller's synchronisation, which is exactly the guess this section forbids.

A genuine timer window the grid debounces on (see `waitForMissingModuleReports`) is the rare exception. Keep the delay and add `// eslint-disable-next-line no-restricted-syntax -- <the window it waits on>`.

#### Negative assertions

`waitFor` cannot express "this never happened". It resolves the moment its callback stops throwing, so a poll for something that is already true passes on tick 0 and the test becomes unfalsifiable. When the assertion is that a call was *not* made, or that no *second* event arrived, the delay is not a guessed wait — it is the observation window, and converting it to a poll removes the coverage.

Look for a positive signal first, and only fall back to the window when none exists:

```typescript
// Preferred — poll a positive signal, then assert the negative over the settled state.
await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
expect(errorSpy).not.toHaveBeenCalled();

// Fallback — nothing positive follows the event that must not arrive.
await waitFor(() => expect(events.length).toBeGreaterThan(0)); // the first, expected event
// eslint-disable-next-line no-restricted-syntax -- window in which a second, redundant columnEverythingChanged would arrive
await asyncSetTimeout(10);
expect(events).toHaveLength(1);
```

A positive signal only works when it provably lands *after* the thing being ruled out. If it can settle first, it shrinks the window towards zero and is worse than the sleep it replaced — keep the window and say in the disable comment what it is observing.

#### Proving a wait is necessary

The way to show a delay is decoration is to delete it and see the test still pass — but **run that probe at whole-file scope at least, never under `-t "<single test>"`**. Vitest isolation changes what has already happened by the time the assertion fires, so a filtered run can pass on a gate that the full file genuinely needs. A green `-t` run is not evidence that a wait is unnecessary; it is evidence of nothing.

#### The poll that was already true

When the sleep you are replacing sits after a mutation, check what the polled condition evaluated to *before* that mutation. If it was already true, `waitFor` resolves on its first tick and the assertion never sees the new state — the test still passes, and it now passes for any implementation.

This bites hardest on "state survives a rebuild" tests, where the state asserted afterwards is the same state that held beforehand. Gate on a signal that can only be true post-mutation — the recreated object is a different instance, a count has changed, a new column has appeared — and then assert. The gate's job is to establish that the mutation landed, not to buy time: if the mutation is synchronous the gate resolves immediately and costs nothing, and it still keeps the assertion falsifiable if the work is later deferred.

```typescript
const groupBeforeRebuild = api.getProvidedColumnGroup(openedIds[0]);
api.setGridOption('columnDefs', makeDefs());
await waitFor(() => expect(api.getProvidedColumnGroup(openedIds[0])).not.toBe(groupBeforeRebuild));
expect(openGroupIds(api)).toEqual(openedIds);
```

#### Test IDs land on a debounce

`TestIdService` stamps `data-testid` attributes in a debounced pass off grid events, so a freshly rendered cell carries no test ID until a macrotask has elapsed. A sleep that a `*ByTestId` query depends on is therefore load-bearing, and gating on some *other* condition — the range handle existing, a row count, an API value — does not replace it: `waitFor` resolves without yielding a macrotask when its callback passes on the first tick.

Poll the lookup itself, so the gate covers what the test actually reads:

```typescript
const cellOfRow = (rowIndex: number) => getByTestId(gridDiv, agTestIdFor.cell(`ROW_${rowIndex}`, 'sunshine'));

await waitFor(() => {
    expect(gridDiv.querySelector('.ag-range-handle')).toBeTruthy();
    for (let i = 0, len = rowData.length; i < len; ++i) {
        cellOfRow(i);
    }
});
```

## Best Practices

1. **Test behaviour, not implementation** - Focus on what the code does, not how
2. **Keep tests independent** - Each test should be able to run in isolation
3. **Use descriptive names** - Test names should describe the expected behaviour
4. **Avoid test helpers that hide behaviour** - Repetition is fine in tests; prefer inline setup over a shared factory so each test reads top-to-bottom. Do not flag duplicated test setup (row data, grid options, column defs) in code review. **Do** flag duplicated test *cases* — i.e. tests that assert the same behaviour twice — within a file or across files, since they add no coverage.
5. **Merge tests that differ only in assertions** - Same setup → one test with sequential assertions. Avoids test-count bloat.
6. **Clean up after tests** - Reset mocks and state in `afterEach`
7. **Review similar tests** - When adding tests, check related tests for consistency
8. **Wait, don't sleep** - Poll async grid updates with `waitFor`; never assert after a fixed `asyncSetTimeout(n)` delay (see [Waiting for Async Grid Updates](#waiting-for-async-grid-updates)).
9. **Register the module before using a grid API** - Tests and benchmarks build their own module lists (not `AllCommunityModule`), so a `GridApi` method or feature whose module isn't registered logs `error #200` (`moduleName=…&reasonOrId=api.<method>`) and **no-ops silently**. Before using a new API, find its providing module (grep the method under `packages/*/src`, or read the `moduleName=` in the error URL) and register it. A passing test/bench prints no `error #200`.

## GridRows and GridColumns Snapshots

For behavioural tests, prefer `GridRows` and `GridColumns` snapshots over raw API assertions where practical. They produce inline snapshots that make the grid state visually readable and update automatically.

```typescript
import { GridColumns, GridRows } from '../test-utils';

// Snapshot grid rows (rendered cell values, grouping, selection state, etc.)
await new GridRows(api, 'description').check();

// Snapshot column state (visibility, order, pinning, pivoting, etc.)
await new GridColumns(api, 'description').checkColumns();
```

When behaviour cannot be captured by a snapshot — for example verifying a specific return value, event payload, or count — combine snapshots with targeted API checks:

```typescript
await new GridRows(api, 'after sort').check();
expect(api.getDisplayedRowCount()).toBe(3);
```

Update snapshots after intentional grid state changes:

```bash
./behave.sh --update-grid-rows # update all
./behave.sh --update-grid-rows "column-lookup"    # update matching files only
```

The test framework and `mockGridLayout.ts` are written as we go. If they do not cover a scenario that arises in a new test, update and fix them rather than working around the gap.

## Style in Tests

Tests must respect ESLint rules, and should follow the non-lint-enforced coding-style preferences too.

## Coverage

- Aim for meaningful coverage, not 100%
- Focus on edge cases and error handling
- Critical paths should have comprehensive tests
