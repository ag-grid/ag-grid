import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Built-in and action toolbar items render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        const toolbarItems = toolbar.locator(':scope > .ag-toolbar-item');
        const toolbarButtons = toolbar.locator(':scope > .ag-toolbar-button');

        await expect(toolbarItems).toHaveCount(5);
        await expect(toolbar.locator(':scope > .ag-toolbar-panel')).toHaveCount(1);
        await expect(toolbar.locator(':scope > .ag-toolbar-input')).toHaveCount(1);
        await expect(toolbarButtons).toHaveCount(3);
        // Separator between rowGroupPanel and the search input
        await expect(toolbar.locator(':scope > .ag-toolbar-separator')).toHaveCount(1);

        // Action button invokes its configured callback
        await toolbarButtons.filter({ hasText: 'Auto Size All' }).click();
    });
});
