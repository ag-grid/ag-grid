import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom toolbar buttons render and open panels', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        // 7 custom buttons + 1 separator as configured in main.ts
        await expect(toolbar.locator('.ag-toolbar-item.ag-toolbar-button')).toHaveCount(7);
        await expect(toolbar.locator('.ag-toolbar-separator')).toHaveCount(1);

        // Opening and closing the filters panel via a custom button wires through to the grid API
        const filtersButton = toolbar.locator('button[aria-label="Filters Panel"]');
        await filtersButton.click();
        await expect(page.locator('.ag-filter-toolpanel')).toBeVisible();
        await filtersButton.click();
        await expect(page.locator('.ag-filter-toolpanel')).toBeHidden();
    });
});
