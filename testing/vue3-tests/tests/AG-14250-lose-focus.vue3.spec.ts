import { expect, test } from '@playwright/test';

test('focus is maintained when tabbing between cells', async ({ page }) => {
    test.setTimeout(10_000);

    await page.goto('/ag-14250');

    // Wait for data to load (fetched from remote endpoint)
    const firstCell = page.getByRole('gridcell').first();
    await firstCell.waitFor();

    // Double-click the first cell to enter edit mode
    await firstCell.dblclick();

    // Clear and type new value
    const editor = page.locator('.ag-cell-inline-editing input');
    await expect(editor).toBeVisible();
    await editor.fill('100');

    // Tab to next cell (age column)
    await editor.press('Tab');

    // Verify the age cell (value 23) is now in edit mode
    const editingCell = page.locator('.ag-cell-inline-editing');
    await expect(editingCell).toBeVisible();

    const editingInput = editingCell.locator('input');
    await expect(editingInput).toBeFocused();
    await expect(editingInput).toHaveValue('23');
});
