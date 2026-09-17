import { expect, test } from '@playwright/test';

test('a cellRenderer string matching a slot renders it, while other columns render normally', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    const nameCells = page.locator('.ag-cell[col-id="name"]');
    await expect(nameCells).toHaveCount(3);
    await expect(nameCells.nth(0)).toHaveText('Widget');
    await expect(nameCells.nth(1)).toHaveText('Gadget');
    await expect(nameCells.nth(2)).toHaveText('Gizmo');

    const slotCells = page.locator('[data-testid="slot-cell"]');
    await expect(slotCells).toHaveCount(3);
    await expect(slotCells.nth(0)).toHaveText('SLOT:9.99');
    await expect(slotCells.nth(1)).toHaveText('SLOT:19.5');
    await expect(slotCells.nth(2)).toHaveText('SLOT:100');

    // A single-root slot is used as its own cell content, with no extra wrapper element, matching
    // how any other Vue cellRenderer's own root becomes the cell's GUI (AG-14151).
    const priceCellHtml = await page.locator('.ag-cell[col-id="price"]').first().innerHTML();
    expect(priceCellHtml).toBe('<span class="slot-cell" data-testid="slot-cell">SLOT:9.99</span>');
});

test('multi-root slot content is not truncated', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-multi-root');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    const cells = page.locator('.ag-cell[col-id="label"]');
    await expect(cells).toHaveCount(2);
    await expect(cells.nth(0)).toContainText('Note: Alpha');
    await expect(cells.nth(1)).toContainText('Note: Beta');

    const strongEls = page.locator('[data-testid="multi-root-strong"]');
    await expect(strongEls).toHaveCount(2);
    await expect(strongEls.nth(0)).toHaveText('Alpha');
    await expect(strongEls.nth(1)).toHaveText('Beta');

    const emEls = page.locator('[data-testid="multi-root-em"]');
    await expect(emEls).toHaveCount(2);
    await expect(emEls.nth(0)).toHaveText('!');
    await expect(emEls.nth(1)).toHaveText('!');
});

test('two columns using the same cellRenderer string share the one matching slot', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-shared');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    const boundCells = page.locator('[data-testid="bound-cell"]');
    await expect(boundCells).toHaveCount(2);
    await expect(page.locator('.ag-cell[col-id="min"] [data-testid="bound-cell"]')).toHaveText('BOUND:1');
    await expect(page.locator('.ag-cell[col-id="max"] [data-testid="bound-cell"]')).toHaveText('BOUND:10');
});

test('a matching slot takes priority over a globally registered component of the same name', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-priority');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    await expect(page.locator('[data-testid="slot-cell"]')).toHaveText('SLOT:42');
    await expect(page.locator('[data-testid="registered-cell"]')).toHaveCount(0);
});

test('a v-if/v-else swap between two templates for the same slot is picked up, not left stale', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-swap');

    const cell = page.locator('.ag-cell[col-id="value"]').first();
    await expect(cell).toHaveText('Before:42');

    const otherCell = page.locator('[data-testid="other-cell"]').first();
    await expect(otherCell).toHaveText('Other:1');
    const mountCountBefore = await otherCell.getAttribute('data-mount-count');

    await page.locator('#toggle').click();
    await expect(cell).toHaveText('After:42');

    // The unrelated "other" column's slot didn't change, so its cellRenderer must not be
    // refreshed/remounted just because the "value" column's slot toggled.
    await expect(otherCell).toHaveAttribute('data-mount-count', mountCountBefore);
});

test('a slot matching a cellEditor name does not hijack the editor role', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-editor-scope');

    const cell = page.locator('.ag-cell[col-id="value"]').first();
    await cell.waitFor();
    await cell.dblclick();

    await expect(page.locator('[data-testid="real-editor"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="slot-should-not-be-used"]')).toHaveCount(0);
});

test('a slot swap is picked up when reached via a components alias or a cellRendererSelector', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-indirect-swap');

    const aliasCell = page.locator('.ag-cell[col-id="alias"]').first();
    const selectorCell = page.locator('.ag-cell[col-id="selector"]').first();
    await expect(aliasCell).toHaveText('Before:42');
    await expect(selectorCell).toHaveText('Before:42');

    await page.locator('#toggle').click();

    await expect(aliasCell).toHaveText('After:42');
    await expect(selectorCell).toHaveText('After:42');
});

test('a slot whose single root is a multi-root component keeps every DOM root', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-component-multi-root');

    const cell = page.locator('.ag-cell[col-id="value"]').first();
    await cell.waitFor();

    await expect(page.locator('[data-testid="component-root-a"]')).toHaveText('A:7');
    await expect(page.locator('[data-testid="component-root-b"]')).toHaveText('B:7');
});
