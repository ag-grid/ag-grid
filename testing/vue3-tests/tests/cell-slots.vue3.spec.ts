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
