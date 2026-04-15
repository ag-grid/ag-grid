import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Toolbar presets switch correctly', async ({ page }) => {
        await waitForGridContent(page);

        const toolbarItems = page.locator('.ag-toolbar-item');

        // Initial state is Full (7 items)
        await expect(toolbarItems).toHaveCount(7);

        // Compact (6 items)
        await page.locator('button', { hasText: 'Compact' }).click();
        await expect(toolbarItems).toHaveCount(6);

        // Minimal (3 items)
        await page.locator('button', { hasText: 'Minimal' }).click();
        await expect(toolbarItems).toHaveCount(3);

        // Back to Full
        await page.locator('button', { hasText: 'Full' }).click();
        await expect(toolbarItems).toHaveCount(7);
    });
});
