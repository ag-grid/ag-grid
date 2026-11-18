---
targets: ['*']
name: docs-e2e-tests
description: 'Write or update Playwright example.spec.ts tests for AG Grid documentation examples, then run them with docs-e2e.sh to verify. Use when asked to write, add, extend, or fix e2e/Playwright tests for a docs page or a specific example, or when a docs example needs meaningful (non-placeholder) test assertions.'
---

# Write / Update Example Spec Tests

Write or extend Playwright `example.spec.ts` tests for the examples on a documentation page.

If the user names a doc page (e.g., `aggregation-total-rows`) or a path, work through all its examples. If the user names a specific example, focus on that example only.

## Prerequisites

- **The docs dev server must be serving** (`yarn nx dev`): specs run against `https://localhost:<PORT>` (`PORT` from `.env.local` or `.env`, default 4610), so a stopped server fails every spec in a way that looks like a broken example. `node_modules/.cache/ag-watch-status.json` reports the package build watch (`STARTING`, `RUNNING`, `BUILDING`, `IDLE`, `STOPPED`), not whether the site answers on its port: check that with `curl -sk -o /dev/null -w '%{http_code}' https://localhost:4610/` (200), and otherwise start `yarn nx dev` and wait for it to answer.
- Playwright browsers: `npx playwright install --with-deps chromium` from `documentation/ag-grid-docs/`.

## STEP 1: Discover and Plan

### 1a. Locate the doc page

The page directory is `documentation/ag-grid-docs/src/content/docs/<page>/`; the argument may be the page name, a path fragment or the full path.

### 1b. Read the index.mdoc

Read the page's `index.mdoc` for its topic, its `{% gridExampleRunner title="…" name="…" /%}` tags (`name` is the folder under `_examples/`), and what the prose says each example demonstrates: that prose decides what to test.

### 1c. Enumerate all examples

Each subdirectory of the page's `_examples/` is one example.

### 1d. Read example source code

Read every file in each example folder: `main.ts` (column definitions, grid options such as `getRowId`, the data source, controls that call the grid API, custom `aggFunc`/`valueFormatter`/`cellRenderer`), `data.ts`, `index.html` (controls outside the grid), `styles.css`, `exampleConfig.json` (`supportedFrameworks`, `usesWebWorker`), the component files at the folder root (`<name>_typescript.ts`, `<name>_reactFunctionalTs.tsx`, `<name>_vue3.ts`, `<name>.component_angular.ts`) and per-framework overrides under `provided/<framework>/`.

If the example fetches remote data (e.g., from `ag-grid.com/example-assets/`), read the corresponding file from `documentation/ag-grid-docs/public/example-assets/` to understand the data shape and calculate expected values. A run against a deployed site gets the copy published on `www.ag-grid.com`, so an edit to the file reaches it only once released.

Data built with `Math.random()` is seeded: assert explicit values (Pitfall 13).

### 1e. Check for existing tests

For each example, check whether `example.spec.ts` is still the placeholder: a `PLACEHOLDER` comment, or only `ensureGridReady`/`waitForGridContent`/`clickAllButtons`.

### 1f. Build the plan

Create a plan listing each example that needs a test written or updated. For each example include:

- **Example name** and path
- **What it demonstrates** (from index.mdoc context + source code analysis)
- **Key behaviours to verify**: one test block per behaviour the doc prose and the controls in `main.ts` call out, each driven by an interaction where one is possible (Pitfall 12).
- **Data expectations**: expected cell values, group names, aggregation results (calculated from source data)
- **Status**: new test, replacing placeholder, or extending existing test

Present this plan to the user before proceeding. Wait for approval.

## STEP 2: Write Tests With a Subagent

For each example in the approved plan, have a subagent (Agent tool) write `example.spec.ts`, giving it the Test Reference and Deterministic sections below, the pitfall entries that apply (index below), the example's source, the planned behaviours, a neighbouring `example.spec.ts` for style and the doc prose for the example. It returns the file; you write it to disk.

## STEP 3: Run the Tests

From the repo root, **in the background** (`AGENTS.md` Quick Reference: never a test script in the foreground locally):

```bash
./docs-e2e.sh "docs/<page>/_examples/<example>/"
```

- **Filter by `docs/<page>/_examples/<example>/`.** Playwright matches the argument as an unanchored regex against the spec's path, so a bare folder name also runs same-named examples on other pages (folder names repeat across pages) and every name containing it; a leading `/` makes it a regex literal whose slashes are dropped, so `/<page>/_examples/<example>/` also runs `<example>-selectively`. Never a glob with `**/`.
- **One run validates every framework** the example has pages for (its `exampleConfig.json` `supportedFrameworks`, when set), in chromium, except the production React build (`reactFunctionalTs`): `--all-variants` adds it, and CI always runs it.
- `--grep "<test name>"` runs one test, `--all-browsers` adds firefox and webkit, and `--framework <name>` runs one CI shard's framework: `typescript`, `vanilla`, `reactFunctionalTs` (both React builds: every example on the production one, plus the tests naming `reactFunctionalTs_Dev`), `reactFunctionalTs_Dev` (only the tests naming it), `angular` or `vue3` (validated against `ALL_FRAMEWORKS` in `documentation/ag-grid-docs/src/utils/grid/test/exampleFrameworks.ts`). Every flag: `./docs-e2e.sh --help`.

## STEP 4: Iterate

Fix a failure, then re-run only the failures with `--last-failed`, which reads Playwright's `.last-run.json` from the previous run. Keep the same `--framework` and browser flags so the failure set stays the same:

```bash
./docs-e2e.sh "docs/<page>/_examples/<example>/"   # records the failures
./docs-e2e.sh --last-failed                     # re-runs only those; repeat until green
```

### Interpreting Failures

- **Strict mode violation (resolved to N elements):** `.first()` on the locator (Pitfall 1).
- **Timeout waiting for an element:** the row may need expanding or scrolling into view (Pitfall 8), or its row ID is wrong (Row ID Conventions).
- **Expected text not found:** recalculate the value from the source data, checking the `aggFunc` logic; for a long decimal, `toContainText` with a shorter prefix (Pitfall 4).

## Writing Deterministic (Non-Flaky) Tests

These tests run in every framework and browser, so timing is the main source of flakiness. **Never wait for grid state with a fixed `page.waitForTimeout(...)`**: it is too short (flaky) or too long (slow), and encodes the race instead of removing it. Wait on a signal:

- **Web-first assertions retry** (`toContainText`, `toBeVisible`, `toHaveAttribute`, ...) until they pass or time out: assert the end state directly.
- **`waitForRowAnimations(page)`** after an action that reorders or re-renders rows (sort, transaction, group expand): it flushes a frame and waits until no container holds duplicate ("zombie") rows. It is also the gap between two header clicks, so they are not read as a double-click (Pitfall 11).
- **Retry a value read off the page** (console messages, computed order, `scrollTop`) with `expect.poll(...)` or `expect(async () => { ... }).toPass()` (Pitfall 10).
- **`ensureGridReady(page)` / `waitForGridContent(page)`** gate the initial load: call them before interacting.

A fixed wait is acceptable only for a deliberate debounce with no observable signal, with a comment naming it.

## Definition of Done

- Every targeted example has an `example.spec.ts` with meaningful assertions, no placeholder.
- `./docs-e2e.sh "docs/<page>/_examples/<example>/" --all-variants` is green: every framework the example has pages for, in chromium.
- Each behaviour the example's doc prose calls out has its own test block, driven by an interaction where possible (Pitfall 12).
- No fixed `waitForTimeout` for grid state; starting values asserted explicitly, never read back off the page (Pitfall 13).
- Style follows the neighbouring `example.spec.ts` files.

---

## Test Reference

Pass these core conventions to the subagent; pull situational entries from `reference/pitfalls-and-patterns.md` through the index at the end.

### Imports

```typescript
import { expect, test } from '@utils/grid/test-utils';
```

The same module exports the helpers named in this skill (`ensureGridReady`, `waitForGridContent`, `waitForRowAnimations`, `expectRowIdAtIndex`, `clickHeaderToSort`, `scrollGridRelative`, `gridApiHandle`, `gridEventLog`, `recreateGrid`, `waitForChartModels`) and `expectConsistentFrameworkDom(page, options?)`: an opt-in snapshot that the grid DOM is structurally the same in every framework, for examples where a wrapper's DOM drift would be a regression (`includeText: false` for volatile text).

### Test Structure

```typescript
test.agExample(import.meta, () => {
    test.eachFramework('Test Name', async ({ agIdFor, page }) => {
        // Test body - runs against each framework of the run that the example has pages for
    });
});
```

### `agIdFor` Locator Helpers

The `agIdFor` object wraps AG Grid test IDs into Playwright locators. Key methods:

**Rows and Cells:**

- `agIdFor.rowNode(rowId)`: a row
- `agIdFor.cell(rowId, colId)`: a cell
- `agIdFor.autoGroupCell(rowId)`: shorthand for `cell(rowId, 'ag-Grid-AutoColumn')`

**Group Expand/Collapse:**

- `agIdFor.groupContracted(rowId, colId)`: the expand icon of a collapsed group
- `agIdFor.groupExpanded(rowId, colId)`: the collapse icon of an expanded group
- `agIdFor.autoGroupContracted(rowId)` / `agIdFor.autoGroupExpanded(rowId)`: the same, in the auto group column

**Headers:**

- `agIdFor.headerCell(colId)`: header cell
- `agIdFor.headerGroupCell(colId)`: header group cell

**Full API:** See `packages/ag-grid-community/src/testing/testIdUtils.ts` for all available selectors.

### Row ID Conventions

| Row Type                     | ID Pattern                                  | Example                                          |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------ |
| Data row, no `getRowId`      | `0`, `1`, `2`, ... in data order            | `agIdFor.cell('0', 'name')`                      |
| Data row, with `getRowId`    | what `getRowId` returns                     |                                                  |
| Group row                    | `row-group-{field}-{value}`, nested levels appended | `'row-group-country-Australia-year-2004'` |
| Tree data filler (Pitfall 7) | `row-group-0-{key}-1-{key}...`, one pair per level | `'row-group-0-Documents-1-Work'`          |
| Group footer                 | `rowGroupFooter_{groupRowId}`               | `'rowGroupFooter_row-group-country-Netherlands'` |
| Grand total                  | `rowGroupFooter_ROOT_NODE_ID`               | `'rowGroupFooter_ROOT_NODE_ID'`                  |

### Reaching the Grid API

Prefer `agIdFor` locators and Playwright page interactions: they test what a user sees.

When the behaviour cannot be seen in the DOM (rows off-screen, a callback's arguments, a transaction's contents), use `gridApiHandle(page)`, never `(window as any).getGridApi`. It waits for the grid and returns a typed `JSHandle<GridApi>`; `api.evaluate((api, arg) => ...)` runs in the page, so pass Node-side values as `arg` and return plain data. Keep anything the page collects in a handle too, rather than on `window`:

```typescript
const applied = await page.evaluateHandle(() => [] as number[]);
const api = await gridApiHandle(page);
await api.evaluate((api, applied) => {
    api.setGridOption('isApplyServerSideTransaction', ({ transaction }) => {
        applied.push(transaction.update?.length ?? 0);
        return true;
    });
}, applied);
await expect.poll(async () => (await applied.jsonValue()).length).toBeGreaterThan(0);
```

To assert on grid events, record them with `gridEventLog(page)` and poll its entries:

```typescript
const log = await gridEventLog(page);
await log.record('cellValueChanged', ['newValue', 'oldValue']);
// ...edit a cell...
await expect.poll(() => log.entries()).toEqual([['cellValueChanged', { newValue: 100, oldValue: 5 }]]);
```

Asserting that an event did *not* fire needs a short `page.waitForTimeout` with a comment, as grid events reach listeners asynchronously. `recreateGrid(page, gridOptions)` and `waitForChartModels(page)` cover the remaining API needs.

### Pitfalls & Patterns Index

Read, and pass to the subagent, only the entries of `reference/pitfalls-and-patterns.md` that match the example.

| # | Pitfall | Read when the example… |
| - | ------- | ---------------------- |
| 1 | Strict mode violations (`.first()`) | has grand-total or pinned rows |
| 2 | Footer row text (`Total {group}`) | shows group/grand-total footers |
| 3 | Expanding group rows | has collapsible groups |
| 4 | Aggregation display values (incl. `IAggFuncResult`) | uses `aggFunc` / custom aggregation |
| 5 | `toContainText` over `toHaveText` | asserts any cell text (general) |
| 6 | Blank cells | has empty aggregation/footer cells |
| 7 | Tree data filler nodes (path-built row IDs) | uses `getDataPath` tree data |
| 8 | Virtual scrolling hides off-screen rows (`.ag-grid-viewport`, `scrollGridRelative`) | has more rows than fit the viewport |
| 9 | Selection state / checkbox classes | uses row selection or checkboxes |
| 10 | Retrying a value read off the page (`expect.poll`, `.toPass()`) | reads console messages / computed values off the page |
| 11 | Sorting rows: `clickHeaderToSort`, `expectRowIdAtIndex`, the double-click trap | asserts sort ordering via clicks |
| 12 | Prefer value + interaction, not value alone | supports any interaction (nearly all) |
| 13 | Randomised data is seeded: assert explicit values | generates any of its data with `Math.random()` |

**Worked pattern** (also in the reference file): aggregation with sort and expand interactions.
