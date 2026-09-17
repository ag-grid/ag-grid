import { expect, test } from '@playwright/test';

test('cell slot renders custom content while other columns render normally', async ({ page }) => {
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
