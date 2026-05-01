import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Quick filter and export menu render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator(':scope > .ag-toolbar-input')).toHaveCount(1);
        await expect(toolbar.locator(':scope > .ag-toolbar-button')).toHaveCount(1);
    });
});
