import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Full width rows render custom content', async ({ page }) => {
        await expect(page.locator('.notes-full-width-row').first()).toContainText('Usain Bolt');
        await expect(page.locator('.notes-full-width-row').nth(1)).toContainText('Allyson Felix');
    });

    test.eachFramework('Hovering a noted full width row shows the note popup', async ({ page }) => {
        const fullWidthRow = page.locator('.notes-full-width-row').first();
        await fullWidthRow.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to a full width row. In this grid, full width notes resolve to the first displayed column.'
        );
    });
});
