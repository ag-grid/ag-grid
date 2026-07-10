---
targets: ['*']
name: docs-e2e-tests
description: 'Write or update Playwright example.spec.ts tests for AG Grid documentation examples, then run them with docs-e2e.sh to verify. Use when asked to write, add, extend, or fix e2e/Playwright tests for a docs page or a specific example, or when a docs example needs meaningful (non-placeholder) test assertions.'
---

# Write / Update Example Spec Tests

Write or extend Playwright `example.spec.ts` tests for the examples on a documentation page.

If the user names a doc page (e.g., `aggregation-total-rows`) or a path, work through all its examples. If the user names a specific example, focus on that example only.

## Prerequisites

- The dev server must be running (`yarn nx dev`). Check `node_modules/.cache/ag-watch-status.json` for status.
- Playwright browsers must be installed. If not, run: `npx playwright install --with-deps chromium` from `documentation/ag-grid-docs/`.

## STEP 1: Discover and Plan

### 1a. Locate the doc page

Find the doc page directory under `documentation/ag-grid-docs/src/content/docs/`. The user's argument may be:

- A page name: `aggregation-total-rows`
- A path fragment: `docs/aggregation-total-rows`
- A full path to the directory

### 1b. Read the index.mdoc

Read the page's `index.mdoc` to understand:

- **Page topic:** What feature area does this page document?
- **Example references:** Find all `{% gridExampleRunner ... %}` tags. Each has a `title` and `name` attribute. The `name` maps to a folder in `_examples/`.
- **Surrounding prose:** What does the documentation say each example demonstrates? This context is critical for knowing what to test.

### 1c. Enumerate all examples

List all subdirectories under the page's `_examples/` directory. Each subdirectory is one example.

### 1d. Read example source code

For **each** example, read:

- `main.ts` — the primary source. Understand:
    - **Column definitions** (fields, `rowGroup`, `aggFunc`, `valueGetter`, `cellRenderer`, etc.)
    - **Grid options** (`grandTotalRow`, `groupTotalRow`, `getRowId`, `rowSelection`, etc.)
    - **Data source** — inline data, `fetch()` URL, or `data.ts` import
    - **Interactive controls** — buttons, dropdowns, or other UI that trigger grid API calls
    - **Custom functions** — custom `aggFunc`, `valueFormatter`, `cellRenderer`, etc.
- `data.ts` (if present) — understand the data shape and sample values
- `styles.css` (if present) — any relevant custom styling
- `index.html` — check for external buttons/controls outside the grid

If the example fetches remote data (e.g., from `ag-grid.com/example-assets/`), read the corresponding file from `documentation/ag-grid-docs/public/example-assets/` to understand the data shape and calculate expected values.

### 1e. Check for existing tests

For each example, check if `example.spec.ts` already exists and whether it is:

- **Placeholder** — contains `PLACEHOLDER` comment or only calls `ensureGridReady`/`waitForGridContent`/`clickAllButtons`
- **Real test** — has meaningful assertions with `agIdFor`, `expect`, etc.

### 1f. Build the plan

Create a plan listing each example that needs a test written or updated. For each example include:

- **Example name** and path
- **What it demonstrates** (from index.mdoc context + source code analysis)
- **Key behaviours to verify** — specific assertions to make **and interactions to perform**. Do not stop at static cell values, and do not stop at a single interaction. Enumerate every distinct behaviour the example is there to demonstrate — work through the doc prose that references it plus the controls/features in `main.ts` (each button, each configured feature, each interaction the page calls out) — and plan one test block per behaviour (expand a group to a leaf/sub-group, sort by the feature's column, toggle each control, apply each filter mode). The doc prose for that example is your coverage checklist: a multi-feature example needs multiple interactions, not one (see Pitfall 12).
- **Data expectations** — expected cell values, group names, aggregation results (calculated from source data)
- **Status** — new test, replacing placeholder, or extending existing test

Present this plan to the user before proceeding. Wait for approval.

## STEP 2: Write Tests Using Playwright Expert

For each example in the approved plan, use the **playwright-expert** subagent (via the Agent tool) to write the `example.spec.ts` file. Provide the subagent with:

1.  The core test reference (the "Test Reference" section below) **and** the situational pitfalls/patterns that apply to this example (from `reference/pitfalls-and-patterns.md` — see the index below)
2.  The example's source code (main.ts, data.ts, etc.)
3.  The specific behaviours to test from the plan
4.  Any existing `example.spec.ts` files from neighbouring examples as style reference
5.  The doc page context explaining what the example demonstrates
6.  The deterministic-waits principle below — tests must not be flaky

The subagent should write the test file and return it. You then write it to disk.

## STEP 3: Run the Tests

**First, confirm the dev server is serving.** The tests run against `https://localhost:4610`, so a stopped server makes every spec fail for environmental reasons that look like the example is broken. Read `node_modules/.cache/ag-watch-status.json`; if it is not serving, start it with `yarn nx dev` and wait for it to come up before running.

Run each spec with the `docs-e2e.sh` helper from the **repository root**:

```bash
./docs-e2e.sh "<example-folder-name>"
```

**Important:**

- Run from the repo root — `docs-e2e.sh` handles the working directory and Playwright config for you.
- **The default run already validates every framework.** With no `--framework` flag, `eachFramework` runs the spec against all frameworks (typescript, vanilla, reactFunctionalTs, angular, vue3) in chromium — one command is the full cross-framework check. You do **not** need a separate run per framework.
- Use the example folder name as the filter (e.g., `"aggregation-overview"`), NOT a glob pattern with `**/` (Playwright treats `*` as regex).
- To run a single test by name, append `--grep "<test-name>"`.
- To narrow to one framework while debugging a failure, use `--framework <name>` (valid: `typescript`, `vanilla`, `reactFunctionalTs`, `reactFunctionalTs_Dev`, `angular`, `vue3`).
- To test all browsers (not just chromium), add `--all-browsers`.

## STEP 4: Iterate

If a test fails, diagnose the failure, fix it, and re-run. When several tests (or several frameworks/browsers) fail at once, re-run **only the failures** with `--last-failed` instead of the whole suite — this is much faster to loop on:

```bash
./docs-e2e.sh "<example-folder-name>"   # initial run records failures
# ...fix a failing test...
./docs-e2e.sh --last-failed                                    # re-runs only what failed; repeat until green
```

`--last-failed` reads Playwright's `.last-run.json` from the previous run, so run it after an initial pass. Keep the same `--framework`/browser settings across passes so the failure set stays consistent.

Common fixes:

1.  Add `.first()` for strict mode violations.
2.  Correct expected values by recalculating from source data.
3.  Add an expand/scroll step if a row isn't visible.
4.  Use `toContainText` with a shorter substring for decimal values.

### Interpreting Failures

- **Strict mode violation (resolved to N elements):** Use `.first()` on the locator (see Pitfall 1 in the pitfalls reference).
- **Timeout waiting for element:** The row may not be visible — check if it needs expanding, scrolling, or if the row ID is correct.
- **Expected text not found:** Recalculate expected values from the data source. Check aggFunc logic carefully.

## Writing Deterministic (Non-Flaky) Tests

These tests run across every framework and all browsers, so timing-dependent flakiness is the main failure mode. **Never use a fixed `page.waitForTimeout(...)` to wait for grid state to settle.** A fixed sleep is either too short (flaky) or too long (slow), and it encodes a race rather than removing it. Use a deterministic signal instead:

- **Web-first assertions auto-retry.** `expect(locator).toContainText(...)`, `.toBeVisible()`, `.toHaveAttribute(...)` etc. already poll until they pass or time out. Assert the end state directly rather than sleeping then asserting.
- **Wait for row re-render / animations** after an action that reorders or re-renders rows (sort, transaction, group expand) with `waitForRowAnimations(page)`. It flushes a frame and waits until no container has duplicate ("zombie") rows. This is also the correct way to open the gap between two header clicks so they aren't read as a double-click (see Pitfall 11) — not a fixed timeout.
- **Retry a read-and-assert block** for values you pull off the page (console messages, computed ordering, `scrollTop`) with `await expect(callback).toPass()`. The custom `expect` does not expose `expect.poll()`; `.toPass()` is the idiom (see Pitfall 10).
- **`ensureGridReady` / `waitForGridContent`** gate the initial grid load — call them before interacting.

The only acceptable fixed wait is a deliberate, documented debounce where no observable signal exists — and even then, prefer a deterministic helper first. If you find yourself reaching for `waitForTimeout`, treat it as a smell and find the signal you're actually waiting for.

## Definition of Done

- Every targeted example has an `example.spec.ts` with meaningful assertions (no placeholders).
- All tests pass across every framework (typescript, vanilla, reactFunctionalTs, angular, vue3) in chromium — i.e. a default `./docs-e2e.sh "<example-name>"` run is green.
- Assertions cover the behaviours described in the documentation for each example.
- Every distinct behaviour the example's doc prose calls out has its own test block — not just one interaction (expand/sort/filter/toggle each behaviour the example demonstrates), and never value-only where an interaction is possible (see Pitfall 12).
- No fixed `page.waitForTimeout(...)` is used to wait for grid state — waits are deterministic (see "Writing Deterministic (Non-Flaky) Tests").
- Tests follow existing conventions (see nearby `example.spec.ts` files for style).

---

## Test Reference

The core conventions below apply to almost every test — include them when delegating to the playwright-expert subagent. Situational guidance (12 pitfalls + worked patterns) lives in `reference/pitfalls-and-patterns.md`; use the index at the end of this section to pull in only the parts relevant to your example.

### Imports

```typescript
import { expect, test } from '@utils/grid/test-utils';
```

Common helpers exported from the same module:

- `ensureGridReady(page)` / `waitForGridContent(page)` — gate the initial grid load before interacting.
- `waitForRowAnimations(page)` — deterministic wait after actions that reorder/re-render rows (sort, transaction, expand); also the correct gap between two header clicks (see the deterministic-waits principle). Prefer this over any fixed `waitForTimeout`.
- `expectConsistentFrameworkDom(page, options?)` — opt-in snapshot assertion that the grid DOM subtree is structurally consistent across frameworks, catching wrapper drift. Use it on examples where framework-specific DOM differences would be a real regression; disable text comparison for volatile data.

### Test Structure

```typescript
test.agExample(import.meta, () => {
    test.eachFramework('Test Name', async ({ agIdFor, page }) => {
        // Test body - runs against all frameworks
    });
});
```

### `agIdFor` Locator Helpers

The `agIdFor` object wraps AG Grid test IDs into Playwright locators. Key methods:

**Rows and Cells:**

- `agIdFor.rowNode(rowId)` — locator for a row
- `agIdFor.cell(rowId, colId)` — locator for a cell
- `agIdFor.autoGroupCell(rowId)` — shorthand for `cell(rowId, 'ag-Grid-AutoColumn')`

**Group Expand/Collapse:**

- `agIdFor.groupContracted(rowId, colId)` — the expand icon for a collapsed group
- `agIdFor.groupExpanded(rowId, colId)` — the collapse icon for an expanded group
- `agIdFor.autoGroupContracted(rowId)` — shorthand for auto group column
- `agIdFor.autoGroupExpanded(rowId)` — shorthand for auto group column

**Headers:**

- `agIdFor.headerCell(colId)` — header cell
- `agIdFor.headerGroupCell(colId)` — header group cell

**Full API:** See `packages/ag-grid-community/src/testing/testIdUtils.ts` for all available selectors.

### Row ID Conventions

AG Grid assigns row IDs based on row type:

| Row Type     | ID Pattern                    | Example                                          |
| ------------ | ----------------------------- | ------------------------------------------------ |
| Data row     | `0`, `1`, `2`, ...            | `agIdFor.cell('0', 'name')`                      |
| Group row    | `row-group-{field}-{value}`   | `'row-group-country-Netherlands'`                |
| Group footer | `rowGroupFooter_{groupRowId}` | `'rowGroupFooter_row-group-country-Netherlands'` |
| Grand total  | `rowGroupFooter_ROOT_NODE_ID` | `'rowGroupFooter_ROOT_NODE_ID'`                  |

### Avoid Remote Grid API

Avoid the use of `remoteGrid(page)`. Prefer using `agIdFor` locators and Playwright page interactions instead.

### Pitfalls & Patterns Index

Read the relevant entries from `reference/pitfalls-and-patterns.md` based on what your example does — don't load the whole file if only a couple apply. When delegating to the playwright-expert subagent, pass through just the entries that match.

| # | Pitfall | Read when the example… |
| - | ------- | ---------------------- |
| 1 | Strict mode violations (`.first()`) | has grand-total or pinned rows |
| 2 | Footer row text (`Total {group}`) | shows group/grand-total footers |
| 3 | Expanding group rows | has collapsible groups |
| 4 | Aggregation display values (incl. `IAggFuncResult`) | uses `aggFunc` / custom aggregation |
| 5 | `toContainText` over `toHaveText` | asserts any cell text (general) |
| 6 | Blank cells | has empty aggregation/footer cells |
| 7 | Tree data filler nodes (unknown row IDs) | uses `getDataPath` tree data |
| 8 | Virtual scrolling hides off-screen rows | has more rows than fit the viewport |
| 9 | Selection state / checkbox classes | uses row selection or checkboxes |
| 10 | Retrying assertions — `.toPass()`, not `expect.poll()` | reads console messages / computed values off the page |
| 11 | Sorting group rows & the double-click trap | asserts sort ordering via clicks |
| 12 | Prefer value + interaction, not value alone | supports any interaction (nearly all) |

**Worked patterns** (also in the reference file): row grouping with aggregation & totals; aggregation with sort + expand interactions; tree data with filler nodes.
