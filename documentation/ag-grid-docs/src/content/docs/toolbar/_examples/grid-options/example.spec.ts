import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Toolbar presets switch correctly', async ({ page }) => {
        await waitForGridContent(page);

        const toolbarItems = page.locator('.ag-toolbar-item');

        // Initial state is Full (row group panel + find + quick filter = 3 items)
        await expect(toolbarItems).toHaveCount(3);

        // Find Only (1 item)
        await page.locator('button', { hasText: 'Find Only' }).click();
        await expect(toolbarItems).toHaveCount(1);

        // Quick Filter Only (1 item)
        await page.locator('button', { hasText: 'Quick Filter Only' }).click();
        await expect(toolbarItems).toHaveCount(1);

        // Back to Full
        await page.locator('button', { hasText: 'Full' }).click();
        await expect(toolbarItems).toHaveCount(3);
    });
});
