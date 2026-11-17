# Pitfalls and Patterns Reference

Situational entries for `example.spec.ts` tests, picked through the index in `SKILL.md`, which holds the core conventions and the deterministic waits.

## Common Pitfalls

### Pitfall 1: Strict Mode Violations (Multiple Matching Elements)

All of a row's cells, pinned columns included, render inside one `.ag-row` in `.ag-grid-scrolling-container`: there are **no** pinned-left/centre/pinned-right row fragments. Rows are still split across *vertical* containers (the main scrolling container plus `stickyTop`/`stickyBottom`, `pinnedTop`/`pinnedBottom`). Some rows, especially **grand total rows** and **pinned rows**, appear in both a pinned/sticky container and the main container, so the same test ID matches 2+ elements. A row can also duplicate briefly mid-animation (a sort moving it a long way) until the grid settles.

**Fix:** Use `.first()` on locators for rows that may be duplicated across containers:

```typescript
// BAD - may match 2 elements for grand total / pinned rows
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze')).toContainText('35');

// GOOD - disambiguates
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze').first()).toContainText('35');
```

**When to use `.first()`:** Always use it for grand total rows (`rowGroupFooter_ROOT_NODE_ID`) and any pinned rows. Regular group rows and data rows typically don't need it.

### Pitfall 2: Footer Row Text

A group row's auto group cell shows its key and child count (`'Netherlands (4)'`). Group footer rows display `"Total {groupName}"` in the auto group column. Grand total rows display just `"Total"` (with no group name).

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

### Pitfall 3: Expanding Group Rows

To expand a collapsed group, click the contracted icon:

```typescript
await agIdFor.autoGroupContracted('row-group-country-Netherlands').click();
```

### Pitfall 4: Aggregation Display Values

- **`sum`**: displays the raw number (e.g., `'35'`).
- **`avg`**: the display may be a long decimal (e.g., `'1.2580645161290323'`). Use `toContainText` with a stable prefix (e.g., `'1.258'`) rather than matching the full number.
- **`count`**: returns an object whose `toString()` outputs the count.
- **Custom aggFuncs**: check the implementation in `main.ts` to understand the return value.
- **Custom `IAggFuncResult` wrappers** (a class with `value`, `toNumber()` and `toString()`): on a column whose data type is number or bigint (inferred from the data, or `cellDataType`), the cell formats the wrapper's `toNumber()` (else its `value`), **not** `toString()`: a `RangeResult` whose `toString()` returns `(7).toFixed(2)` renders `7`, not `7.00`. Without a number data type, and for `count`, it shows `toString()` (`packages/ag-grid-community/src/columns/dataTypeService.ts`). Compute the expected value accordingly, verify it against the running grid, and flag doc prose that says otherwise to the user.

### Pitfall 5: Use `toContainText` over `toHaveText` for Robustness

`toContainText` matches part of the text, so it survives formatting changes; add `{ useInnerText: true }` for auto group cells with nested elements.

### Pitfall 6: Blank Cells

When group rows have blank/empty aggregation cells (e.g., when `groupSuppressBlankHeader` is not set and a footer row is showing), assert with `toHaveText('')` for truly empty cells.

### Pitfall 7: Tree Data Filler Nodes

Path-based tree data (`getDataPath`) creates **filler nodes** for path segments with no data entry (`Desktop` when only `['Desktop', 'file.txt']` exists). A filler's row ID is built from its path, one level-and-key pair per level (`packages/ag-grid-enterprise/src/treeData/treeGroupStrategy.ts`), so `agIdFor` works on it like on any row:

```typescript
await agIdFor.autoGroupContracted('row-group-0-Documents-1-Work').click(); // Documents/Work
await expect(agIdFor.cell('row-group-0-Desktop', 'size')).toContainText('1.98 MB'); // an aggregate on a filler
```

Leaf data rows keep sequential IDs (`'0'`, `'1'`, ...) in data-array order (or their `getRowId`), provided group nodes (a path, no leaf data) get IDs too, and self-referential tree data uses its ID field.

To find a group by its label instead, filter rows by the displayed group value:

```typescript
const findGroupRow = (name: string) =>
    page
        .locator('.ag-row')
        .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
        .first();

await findGroupRow('Desktop').locator('.ag-group-contracted').click(); // expand
await findGroupRow('Desktop').locator('.ag-group-expanded').click(); // collapse
await expect(findGroupRow('Desktop').locator('[col-id="size"]')).toContainText('1.98 MB'); // a cell by col-id
```

**Duplicate group names:** the same folder name can sit at several paths (`ProjectAlpha` under `Desktop` and under `Documents/Work`): a label locator needs `.first()` or a uniquely named group, while the path-built IDs tell them apart.

### Pitfall 8: Virtual Scrolling Hides Off-Screen Rows

Rows outside the viewport are **not in the DOM**, so a locator for an off-screen row times out. Scroll the grid's viewport, `.ag-grid-viewport`, before asserting, and group assertions by scroll position:

```typescript
const viewport = page.locator('.ag-grid-viewport');
await viewport.evaluate((el) => (el.scrollTop = 600)); // specific position
await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight)); // bottom
```

To scroll by an offset, `scrollGridRelative('element' | 'wheel', page, { x?, y?, xStep?, yStep? })` from `@utils/grid/test-utils` sets the viewport's scroll or turns the mouse wheel (on Firefox and WebKit the wheel falls back to the element).

When testing scroll-related behaviour (e.g., `ensureIndexVisible`), the default viewport (1280x720) may be too tall. Shrink it: `await page.setViewportSize({ width: 1280, height: 300 });`

### Pitfall 9: Selection State and Checkbox Classes

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

### Pitfall 10: Retrying a Value Read Off the Page

The custom `expect` from `@utils/grid/test-utils` forwards Playwright's statics, so retry a value read from the page (a console message, a computed order, a `scrollTop`) with `expect.poll(...)`, or retry a whole assertion block with `.toPass()`; both re-run until they pass or time out:

```typescript
await expect.poll(() => messages.some((m) => m.includes('8 medals won!'))).toBe(true);

await expect(async () => {
    expect(isDescending(await valuesByRowIndex(page))).toBe(true);
}).toPass();
```

A value that has already settled needs no retry: `expect(await viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(scrollBefore);`.

### Pitfall 11: Sorting Rows: Assert Which Row-Id Is at an Index, Not a Row's Row-Index

Sort with `clickHeaderToSort(agIdFor.headerCell(colId))`, which clicks the header's label: a click on the cell itself lands on its centre, where a narrow column's menu and filter buttons sit, and opens the menu instead. Then assert **which row-id occupies a fixed index** with `expectRowIdAtIndex(page, index, rowId, { not? })`, never a tracked row's `row-index`:

```typescript
import { clickHeaderToSort, expectRowIdAtIndex, waitForRowAnimations } from '@utils/grid/test-utils';

await clickHeaderToSort(agIdFor.headerCell('total')); // ascending: largest value drops to the bottom
await waitForRowAnimations(page);
await expectRowIdAtIndex(page, 0, 'row-group-country-United States', { not: true });

await clickHeaderToSort(agIdFor.headerCell('total')); // descending: largest value floats to the top
await waitForRowAnimations(page);
await expectRowIdAtIndex(page, 0, 'row-group-country-United States');
```

Pick a row with a **unique** extreme value (the single country with the largest aggregate): ties make position assertions flaky.

A sort moving a row a long way animates the outgoing row out, so for a moment the DOM holds two elements with that row-id (a strict-mode violation, worse under the React and Angular wrappers and on slow CI), and the moved row can be virtualised out (element not found). `expectRowIdAtIndex` reads the row-id at a fixed, always-rendered index inside a retry, which survives both (its JSDoc in `documentation/ag-grid-docs/src/utils/grid/test-utils.ts`).

**Double-click trap:** two header clicks in quick succession read as a **double-click**, so the second sort direction never registers: `waitForRowAnimations(page)` between them, never a fixed `waitForTimeout`.

Sorting works on aggregated values too, including custom `IAggFuncResult` wrappers (sorted by `toNumber()`).

### Pitfall 12: Cover Every Behaviour the Example Demonstrates, With Interactions

The example's doc prose and the controls and features in `main.ts` are the coverage checklist: every button, configured feature and interaction the page calls out gets its own test, so a multi-feature example (a filter with a mini-filter, select-all and a value formatter) needs several interactions and a single-feature example one.

A test that only reads static cell values is the weakest form: drive the behaviour wherever an interaction is possible.

- **Expand a group** to reveal its leaf rows or sub-groups, then assert a leaf or child value (this proves grouping sits above real data, and that sub-groups recompute independently). Assert the leaf hidden first: `await expect(agIdFor.cell('0', 'total')).not.toBeVisible();`, then click, then assert.
- **Sort** by the feature's column and assert the reordering (Pitfall 11).
- **Filter / toggle each control** and assert the aggregate or row set updates.

Give each behaviour its own `test.eachFramework(...)` block with a descriptive name: separate blocks read as a coverage list and fail independently.

### Pitfall 13: "Randomised" Example Data Is Seeded: Assert Explicit Values

An example that generates its rows with `Math.random()` is deterministic under test. The example generator rewrites every `Math.random()` call to `window.agRandom()` (`plugins/ag-grid-generate-example-files/src/executors/generate/executor.ts`), which the example runner seeds with a fixed seed before the example's script runs (`documentation/ag-grid-docs/public/example-runner/example-runner.js`), so the same rows appear on every run, in every framework. The one exception is an example with `usesWebWorker` set in its `exampleConfig.json`: the worker cannot reach `window.agRandom()`.

So never read the current value off the page and assert relative to it: that passes whatever the grid renders, a regression included.

```ts
// WRONG: reads the value it is supposed to be asserting, so the test cannot fail on a wrong value
const before = await cell.textContent();
await cell.dblclick();
await expect(editInput(page)).toHaveValue(before!.trim());

// RIGHT: the seeded data puts 118 in row 0 of the value column
await expect(cell).toContainText('£ 118');
await cell.dblclick();
await expect(editInput(page)).toHaveValue('118');
```

Get the expected value from a run, not by reasoning about the seed: write the assertion with the value you expect, run the spec, and take the real value from the failure message.

## Example Test Patterns

### Pattern: Aggregation with Sort and Expand Interactions

Value assertions plus the interactions from Pitfalls 11 and 12, with expected values computed from the source dataset (here `olympic-winners.json`).

```typescript
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

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

        // United States has the unique max range, so it drops to the bottom on ascending and
        // floats to the top on descending.
        await clickHeaderToSort(agIdFor.headerCell('total'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, 'row-group-country-United States', { not: true });
        await clickHeaderToSort(agIdFor.headerCell('total'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, 'row-group-country-United States');
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
