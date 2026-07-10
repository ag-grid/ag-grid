# Pitfalls and Patterns Reference

Situational reference for writing `example.spec.ts` tests. Read the pitfalls relevant to what your example does (grouping, tree data, aggregation, virtual scrolling, sorting, selection). The core conventions and the deterministic-waits principle live in `SKILL.md` — read that first.

## Common Pitfalls

### Pitfall 1: Strict Mode Violations (Multiple Matching Elements)

AG Grid renders rows in multiple viewport containers (pinned left, centre, pinned right, plus sticky rows). Some rows — especially **grand total rows** and **pinned rows** — can appear in multiple containers, causing the same test ID to match 2+ elements.

**Fix:** Use `.first()` on locators for rows that may be duplicated across containers:

```typescript
// BAD - may match 2 elements for grand total / pinned rows
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze')).toContainText('35');

// GOOD - disambiguates
await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'bronze').first()).toContainText('35');
```

**When to use `.first()`:** Always use it for grand total rows (`rowGroupFooter_ROOT_NODE_ID`) and any pinned rows. Regular group rows and data rows typically don't need it.

### Pitfall 2: Footer Row Text

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
- **Custom `IAggFuncResult` wrappers**: a custom aggFunc may return a wrapper object (a class implementing `IAggFuncResult` with `value`, `toNumber()`, and `toString()`). **The group cell displays the wrapper's numeric `value` (via `toNumber()`), NOT `toString()`.** For example a `RangeResult` whose `toString()` returns `(7).toFixed(2)` still renders as `7`, not `7.00`. Compute expected values as the raw numeric `value` and assert with `toContainText('7')`. Do not trust doc prose that claims `toString`/`toFixed` drives the display — verify against the running grid, and flag the doc/behaviour mismatch to the user.

### Pitfall 5: Use `toContainText` over `toHaveText` for Robustness

Prefer `toContainText` for cell value assertions — it handles partial matching and is more resilient to formatting changes. Use `{ useInnerText: true }` for auto group cells that contain nested elements.

### Pitfall 6: Blank Cells

When group rows have blank/empty aggregation cells (e.g., when `groupSuppressBlankHeader` is not set and a footer row is showing), assert with `toHaveText('')` for truly empty cells.

### Pitfall 7: Tree Data Filler Nodes Have Unknown Row IDs

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

### Pitfall 8: Virtual Scrolling Hides Off-Screen Rows

AG Grid uses virtual scrolling — rows not in the viewport are **not in the DOM**. Locators will timeout if the target row is off-screen.

**Fix:** Scroll `.ag-body-viewport` before asserting. Group assertions by scroll position.

```typescript
const viewport = page.locator('.ag-body-viewport');
await viewport.evaluate((el) => (el.scrollTop = 600)); // specific position
await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight)); // bottom
```

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

### Pitfall 10: Retrying Assertions — Use `.toPass()`, Not `expect.poll()`

The custom `expect` from `@utils/grid/test-utils` wraps Playwright's `expect`, and the wrapper does **not** expose the static `expect.poll()` method. When you need to retry a value you read from the page (a console message, a computed order, a `scrollTop`), wrap the assertion block in `await expect(callback).toPass()` — it re-runs the callback until it passes or times out. This is the deterministic replacement for sleeping before an assertion (see the deterministic-waits principle in `SKILL.md`).

```typescript
// Retry until the console has logged the expected message
await expect(() => {
    expect(messages.some((m) => m.includes('8 medals won!'))).toBe(true);
}).toPass();

// Async callback — re-read grid state each attempt
await expect(async () => {
    expect(isDescending(await valuesByRowIndex(page))).toBe(true);
}).toPass();
```

For a single value that has already settled, a synchronous read + assert is fine:

```typescript
const scrollAfter = await viewport.evaluate((el) => el.scrollTop);
expect(scrollAfter).toBeGreaterThan(scrollBefore);
```

### Pitfall 11: Sorting Group Rows and the Double-Click Trap

To verify that sorting reorders group (or data) rows by a column's value, click the header cell and assert the target row's **position** via its `row-index` attribute on `agIdFor.rowNode(rowId)`:

```typescript
const usGroup = agIdFor.rowNode('row-group-country-United States');
await agIdFor.headerCell('total').click(); // ascending
await expect(usGroup).not.toHaveAttribute('row-index', '0');
await agIdFor.headerCell('total').click(); // descending
await expect(usGroup).toHaveAttribute('row-index', '0'); // the max value floats to the top
```

Pick a row with a **unique** extreme value (e.g. the single country with the largest aggregate) so its top/bottom position is unambiguous — ties make position assertions flaky.

**Double-click trap:** two `headerCell(...).click()` calls in quick succession are interpreted as a **double-click**, so the second sort direction never registers. Between successive header clicks wait for the row re-render to settle with `waitForRowAnimations(page)` — do **not** use a fixed `waitForTimeout` (see the deterministic-waits principle in `SKILL.md`):

```typescript
import { waitForRowAnimations } from '@utils/grid/test-utils';

await agIdFor.headerCell('total').click();
await expect(usGroup).not.toHaveAttribute('row-index', '0'); // asserting on the first sort also settles it
await waitForRowAnimations(page); // deterministic gap so the next click isn't a double-click
await agIdFor.headerCell('total').click();
```

Sorting works on aggregated values too, including custom `IAggFuncResult` wrappers (sorted by `toNumber()`).

### Pitfall 12: Cover Every Behaviour the Example Demonstrates, With Interactions

Cover **each** distinct behaviour the example is there to show — not just one. Use the example's doc prose plus the controls/features in `main.ts` as the coverage checklist: every button, every configured feature, every interaction the page calls out earns its own test. A multi-feature example (e.g. a filter with a mini-filter, select-all, and a value formatter) needs multiple interactions; a single-feature example needs the one. Tie the count to what the docs teach for that example, so rich examples get thorough coverage without gold-plating trivial ones.

A test that only reads static cell values is the weakest form — always drive the behaviour where an interaction is possible:

- **Expand a group** to reveal its leaf rows or sub-groups, then assert a leaf/child value (proves grouping sits above real data, and that sub-groups recompute independently). Leaf rows use sequential IDs (`'0'`, `'1'`, …) in original data order — assert a leaf becomes visible only after expanding: `await expect(agIdFor.cell('0', 'total')).not.toBeVisible();` then click, then assert.
- **Sort** by the feature's column and assert the reordering (Pitfall 11).
- **Filter / toggle each control** and assert the aggregate or row set updates.

Give each behaviour its own `test.eachFramework(...)` block with a descriptive name rather than piling everything into one monolithic test — separate blocks read as a coverage list and fail independently.

## Example Test Patterns

### Pattern: Row Grouping with Aggregation and Totals

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

### Pattern: Aggregation with Sort and Expand Interactions

Value assertions plus the interactions from Pitfalls 11–12. Expected values are computed from the source dataset (here `olympic-winners.json`). Note the deterministic `waitForRowAnimations` between successive header clicks instead of a fixed timeout.

```typescript
import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

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
        await waitForRowAnimations(page); // deterministic gap so the next click isn't a double-click
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

### Pattern: Tree Data with Filler Nodes

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
