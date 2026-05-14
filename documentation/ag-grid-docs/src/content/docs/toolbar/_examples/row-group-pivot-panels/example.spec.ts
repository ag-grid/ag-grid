import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Row group and pivot panels render in toolbar', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator('.ag-column-drop-horizontal')).toHaveCount(2);
        await expect(toolbar.locator('.ag-toolbar-button-wrapper')).toHaveCount(1);
    });
});
