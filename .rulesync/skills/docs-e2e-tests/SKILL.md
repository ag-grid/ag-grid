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
- **Key behaviours to verify** — specific assertions to make **and interactions to perform**. Do not stop at static cell values: for every example that supports it, plan at least one interaction (expand a group to a leaf/sub-group, sort by the feature's column, toggle a control) that exercises the behaviour the docs describe (see Pitfall 12).
- **Data expectations** — expected cell values, group names, aggregation results (calculated from source data)
- **Status** — new test, replacing placeholder, or extending existing test

Present this plan to the user before proceeding. Wait for approval.

## STEP 2: Write Tests Using Playwright Expert

For each example in the approved plan, use the **playwright-expert** subagent (via the Agent tool) to write the `example.spec.ts` file. Provide the subagent with:

1.  The full test utilities reference (from the "Test Reference" section below)
2.  The example's source code (main.ts, data.ts, etc.)
3.  The specific behaviours to test from the plan
4.  Any existing `example.spec.ts` files from neighbouring examples as style reference
5.  The doc page context explaining what the example demonstrates

The subagent should write the test file and return it. You then write it to disk.

## STEP 3: Run the Tests

Run each spec with the `docs-e2e.sh` helper from the **repository root**:

```bash
./docs-e2e.sh "<example-folder-name>" --framework typescript
```

**Important:**

- Run from the repo root — `docs-e2e.sh` handles the working directory and Playwright config for you.
- Use the example folder name as the filter (e.g., `"aggregation-overview"`), NOT a glob pattern with `**/` (Playwright treats `*` as regex).
- Start with `--framework typescript` for a quick single-framework check.
- To run a single test by name, append `--grep "<test-name>"`.
- To test all frameworks, drop the `--framework` flag; to test all browsers, add `--all-browsers`.

## STEP 4: Iterate

If a test fails, diagnose the failure, fix it, and re-run. When several tests (or several frameworks/browsers) fail at once, re-run **only the failures** with `--last-failed` instead of the whole suite — this is much faster to loop on:

```bash
./docs-e2e.sh "<example-folder-name>" --framework typescript   # initial run records failures
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

- **Strict mode violation (resolved to N elements):** Use `.first()` on the locator (see Pitfall 1 in Test Reference).
- **Timeout waiting for element:** The row may not be visible — check if it needs expanding, scrolling, or if the row ID is correct.
- **Expected text not found:** Recalculate expected values from the data source. Check aggFunc logic carefully.

## Definition of Done

- Every targeted example has an `example.spec.ts` with meaningful assertions (no placeholders).
- All tests pass with `--framework typescript` against chromium.
- Assertions cover the behaviours described in the documentation for each example.
- Where the example supports it, tests exercise at least one interaction (expand/sort/filter/toggle), not just static cell values (see Pitfall 12).
- Tests follow existing conventions (see nearby `example.spec.ts` files for style).

---

## Test Reference

This section provides the full reference for writing tests. Include this when delegating to the playwright-expert subagent.

### Imports

```typescript
import { expect, test } from '@utils/grid/test-utils';
```

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

### Common Pitfalls

#### Pitfall 1: Strict Mode Violations (Multiple Matching Elements)

AG Grid renders rows in multiple viewport containers (pinned left, centre, pinned right, plus sticky rows). Some rows — especially **grand total rows** and **pinned rows** — can appear in multiple containers, causing the same test ID to match 2+ elements.

**Fix:** Use `.first()` on locators for rows that may be duplicated across containers:

```typescript
// BAD - may match 2 elements for grand total / pinned rows
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze')).toContainText('35');

// GOOD - disambiguates
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze').first()).toContainText('35');
```

**When to use `.first()`:** Always use it for grand total rows (`rowGroupFooter_ROOT_NODE_ID`) and any pinned rows. Regular group rows and data rows typically don't need it.

#### Pitfall 2: Footer Row Text

Group footer rows display `"Total {groupName}"` in the auto group column. Grand total rows display just `"Total"` (with no group name).

```typescript
// Group footer
await expect(agIdFor.autoGroupCell('rowGroupFooter_row-group-country-Netherlands')).toContainText('Total Netherlands', {
    useInnerText: true,
});

// Grand total footer
await expect(agIdFor.autoGroupCell('rowGroupFooter_ROOT_NODE_ID').first()).toContainText('Total', {
    useInnerText: true,
});
```

#### Pitfall 3: Expanding Group Rows

To expand a collapsed group, click the contracted icon:

```typescript
await agIdFor.autoGroupContracted('row-group-country-Netherlands').click();
```

#### Pitfall 4: Aggregation Display Values

- **`sum`**: displays the raw number (e.g., `'35'`).
- **`avg`**: the display may be a long decimal (e.g., `'1.2580645161290323'`). Use `toContainText` with a stable prefix (e.g., `'1.258'`) rather than matching the full number.
- **`count`**: returns an object whose `toString()` outputs the count.
- **Custom aggFuncs**: check the implementation in `main.ts` to understand the return value.
- **Custom `IAggFuncResult` wrappers**: a custom aggFunc may return a wrapper object (a class implementing `IAggFuncResult` with `value`, `toNumber()`, and `toString()`). **The group cell displays the wrapper's numeric `value` (via `toNumber()`), NOT `toString()`.** For example a `RangeResult` whose `toString()` returns `(7).toFixed(2)` still renders as `7`, not `7.00`. Compute expected values as the raw numeric `value` and assert with `toContainText('7')`. Do not trust doc prose that claims `toString`/`toFixed` drives the display — verify against the running grid, and flag the doc/behaviour mismatch to the user.

#### Pitfall 5: Use `toContainText` over `toHaveText` for Robustness

Prefer `toContainText` for cell value assertions — it handles partial matching and is more resilient to formatting changes. Use `{ useInnerText: true }` for auto group cells that contain nested elements.

#### Pitfall 6: Blank Cells

When group rows have blank/empty aggregation cells (e.g., when `groupSuppressBlankHeader` is not set and a footer row is showing), assert with `toHaveText('')` for truly empty cells.

#### Pitfall 7: Tree Data Filler Nodes Have Unknown Row IDs

Path-based tree data (`getDataPath`) creates **filler nodes** for intermediate path segments that have no data entry (e.g., `Desktop` when only `['Desktop', 'file.txt']` exists in data). These filler nodes have auto-generated row IDs that are not predictable — you **cannot** use `agIdFor` helpers for them.

**Fix:** Use page-level locators to find filler group rows by their displayed group value text:

```typescript
const findGroupRow = (name: string) =>
    page
        .locator('.ag-row')
        .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
        .first();

// Expand/collapse filler nodes via DOM class selectors
await findGroupRow('Desktop').locator('.ag-group-contracted').click(); // expand
await findGroupRow('Desktop').locator('.ag-group-expanded').click(); // collapse
```

**When `agIdFor` DOES work for tree data:** Data rows (leaf nodes) still get sequential IDs (`'0'`, `'1'`, etc.) based on their index in the original data array. Provided group nodes (explicit entries with a path but no leaf data) also get IDs. Self-referential tree data rows use their provided ID field values.

**Duplicate group names:** Some datasets have the same folder name at multiple paths (e.g., `ProjectAlpha` under both `Desktop` and `Documents/Work`). Always use `.first()` on the locator or pick uniquely-named groups for assertions.

#### Pitfall 8: Virtual Scrolling Hides Off-Screen Rows

AG Grid uses virtual scrolling — rows not in the viewport are **not in the DOM**. Locators will timeout if the target row is off-screen.

**Fix:** Scroll `.ag-body-viewport` before asserting. Group assertions by scroll position.

```typescript
const viewport = page.locator('.ag-body-viewport');
await viewport.evaluate((el) => (el.scrollTop = 600)); // specific position
await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight)); // bottom
```

When testing scroll-related behaviour (e.g., `ensureIndexVisible`), the default viewport (1280x720) may be too tall. Shrink it: `await page.setViewportSize({ width: 1280, height: 300 });`

#### Pitfall 9: Selection State and Checkbox Classes

To verify row selection, check the `.ag-row-selected` class on the row element. To verify checkbox indeterminate state (partial selection), check `.ag-indeterminate` on the checkbox wrapper:

```typescript
// Row selection
await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-selected/);

// Checkbox click on a group row (filler node)
await findGroupRow('Desktop').locator('.ag-checkbox-input').click();

// Indeterminate checkbox (some but not all descendants selected)
const checkbox = findGroupRow('Desktop').locator('.ag-checkbox-input-wrapper');
await expect(checkbox).toHaveClass(/ag-indeterminate/);
```

#### Pitfall 10: Custom `expect` Does Not Have `.poll()`

The custom `expect` from `@utils/grid/test-utils` does **not** support `expect.poll()`. Read values after the action settles and assert synchronously:

```typescript
const scrollAfter = await viewport.evaluate((el) => el.scrollTop);
expect(scrollAfter).toBeGreaterThan(scrollBefore);
```

#### Pitfall 11: Sorting Group Rows and the Double-Click Trap

To verify that sorting reorders group (or data) rows by a column's value, click the header cell and assert the target row's **position** via its `row-index` attribute on `agIdFor.rowNode(rowId)`:

```typescript
const usGroup = agIdFor.rowNode('row-group-country-United States');
await agIdFor.headerCell('total').click(); // ascending
await expect(usGroup).not.toHaveAttribute('row-index', '0');
await agIdFor.headerCell('total').click(); // descending
await expect(usGroup).toHaveAttribute('row-index', '0'); // the max value floats to the top
```

Pick a row with a **unique** extreme value (e.g. the single country with the largest aggregate) so its top/bottom position is unambiguous — ties make position assertions flaky.

**Double-click trap:** two `headerCell(...).click()` calls in quick succession are interpreted as a **double-click**, so the second sort direction never registers. Between successive header clicks add a short settle:

```typescript
await agIdFor.headerCell('total').click();
await expect(usGroup).not.toHaveAttribute('row-index', '0'); // asserting on the first sort also settles it
await page.waitForTimeout(300); // ...but still pause so the next click isn't a double-click
await agIdFor.headerCell('total').click();
```

Sorting works on aggregated values too, including custom `IAggFuncResult` wrappers (sorted by `toNumber()`).

#### Pitfall 12: Prefer Value + Interaction, Not Value Alone

A test that only reads static cell values is weaker than one that also drives the behaviour the docs describe. When the example supports it, add at least one interaction alongside the value assertions:

- **Expand a group** to reveal its leaf rows or sub-groups, then assert a leaf/child value (proves grouping sits above real data, and that sub-groups recompute independently). Leaf rows use sequential IDs (`'0'`, `'1'`, …) in original data order — assert a leaf becomes visible only after expanding: `await expect(agIdFor.cell('0', 'total')).not.toBeVisible();` then click, then assert.
- **Sort** by the feature's column and assert the reordering (Pitfall 11).
- **Filter / toggle a control** and assert the aggregate or row set updates.

Split distinct behaviours into separate `test.eachFramework(...)` blocks with descriptive names rather than one monolithic test.

### Example Test Patterns

#### Pattern: Row Grouping with Aggregation and Totals

```typescript
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        await expect(agIdFor.autoGroupCell('row-group-country-Netherlands')).toContainText('Netherlands (4)', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-Netherlands', 'bronze')).toContainText('4');
        await agIdFor.autoGroupContracted('row-group-country-Netherlands').click();
        await expect(agIdFor.autoGroupCell('rowGroupFooter_row-group-country-Netherlands')).toContainText(
            'Total Netherlands',
            { useInnerText: true }
        );
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze').first()).toContainText('35');
    });
});
```

#### Pattern: Aggregation with Sort and Expand Interactions

Value assertions plus the interactions from Pitfalls 11–12. Expected values are computed from the source dataset (here `olympic-winners.json`).

```typescript
test.agExample(import.meta, () => {
    test.eachFramework('Custom aggFunc aggregates the group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // range = max(total) - min(total): United States 8-1 => 7.
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('7');
    });

    test.eachFramework('Group rows sort by the aggregated value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States'); // unique max range (7)
        await agIdFor.headerCell('total').click();
        await expect(usGroup).not.toHaveAttribute('row-index', '0');
        await page.waitForTimeout(300); // avoid a double-click
        await agIdFor.headerCell('total').click();
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Expanding a group reveals its leaves', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'total')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });
});
```

#### Pattern: Tree Data with Filler Nodes

Combines filler node locators (Pitfall 7), scrolling (Pitfall 8), and cell value assertions on group rows.

```typescript
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const findGroupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Leaf data rows use agIdFor with data array index
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });

        // Aggregated values on filler group rows via col-id locator
        await expect(findGroupRow('Desktop').locator('[col-id="size"]')).toContainText('1.98 MB');

        // Scroll to reach off-screen groups, then assert
        const viewport = page.locator('.ag-body-viewport');
        await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight));
        await expect(findGroupRow('Downloads').locator('[col-id="size"]')).toContainText('4 MB');

        // Collapse/expand filler nodes and verify children hide/show
        await findGroupRow('Desktop').locator('.ag-group-expanded').click();
        await expect(agIdFor.autoGroupCell('0')).not.toBeVisible();
    });
});
```
