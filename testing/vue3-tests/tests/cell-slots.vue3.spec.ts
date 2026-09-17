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

test('a slot never overrides a renderer from columnTypes or defaultColDef', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-precedence');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    await expect(page.locator('[data-testid="type-renderer"]')).toHaveText('TYPE:9.99');
    await expect(page.locator('[data-testid="default-renderer"]')).toHaveText('DEFAULT:100');
    await expect(page.locator('[data-testid="slot-should-not-render"]')).toHaveCount(0);
});

test('a slot respects a renderer supplied only via gridOptions, inherited through defaultColDef.type', async ({
    page,
}) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-precedence-inherited');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    await expect(page.locator('[data-testid="type-renderer"]')).toHaveText('TYPE:9.99');
    await expect(page.locator('[data-testid="slot-should-not-render"]')).toHaveCount(0);
});

test('a slot respects a renderer resolved from a trimmed, comma-separated column type', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-precedence-trim');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    await expect(page.locator('[data-testid="type-renderer"]')).toHaveText('TYPE:3');
    await expect(page.locator('[data-testid="slot-should-not-render"]')).toHaveCount(0);
});

test('slot precedence is re-evaluated when defaultColDef changes reactively', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/cell-slots-precedence-reactive');

    const firstCell = page.locator('.ag-cell').first();
    await firstCell.waitFor();

    await expect(page.locator('[data-testid="slot-cell"]')).toHaveText('SLOT:100');
    await expect(page.locator('[data-testid="default-renderer"]')).toHaveCount(0);

    await page.locator('#add-default-renderer').click();
    await expect(page.locator('[data-testid="default-renderer"]')).toHaveText('DEFAULT:100');
    await expect(page.locator('[data-testid="slot-cell"]')).toHaveCount(0);

    await page.locator('#remove-default-renderer').click();
    await expect(page.locator('[data-testid="slot-cell"]')).toHaveText('SLOT:100');
    await expect(page.locator('[data-testid="default-renderer"]')).toHaveCount(0);
});
