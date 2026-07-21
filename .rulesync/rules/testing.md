---
targets: ['*']
description: 'Testing strategies, Vitest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
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

The full Nx target is still available when needed:

```bash
yarn nx e2e ag-grid-docs
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

**Do not** `await asyncSetTimeout(<fixed n>)` and then assert. A guessed delay is flaky (too short under load) and slow (always waits the full time). Nonzero fixed delays scattered through the suite are legacy, not the pattern to copy.

`await asyncSetTimeout(0)` is fine for its distinct purpose: flushing a single microtask/event-loop tick after a synchronous action (e.g. after setting a native input value) before reading the result.

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

Since our test framrwork and mockGridLayout.ts are written as we go,
if they do not cover a scenario that arise in a new test, they must be updated and fixed.

## Style in Tests

Tests must respect ESLint rules, but the non-lint-enforced coding-style preferences.

## Coverage

- Aim for meaningful coverage, not 100%
- Focus on edge cases and error handling
- Critical paths should have comprehensive tests
