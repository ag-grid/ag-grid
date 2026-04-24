import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Built-in and action toolbar items render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        // rowGroupPanel + find + 2 action buttons + menu item as configured in main.ts
        await expect(toolbar.locator('.ag-toolbar-item')).toHaveCount(5);
        await expect(toolbar.locator('.ag-toolbar-panel')).toHaveCount(1);
        await expect(toolbar.locator('.ag-toolbar-find')).toHaveCount(1);
        await expect(toolbar.locator('.ag-toolbar-button')).toHaveCount(3);

        // Action button invokes its configured callback
        await toolbar.locator('.ag-toolbar-button', { hasText: 'Auto Size All' }).click();
    });
});
