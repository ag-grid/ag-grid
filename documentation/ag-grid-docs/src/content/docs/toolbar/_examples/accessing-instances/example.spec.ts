import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('External buttons toggle toolbar items via getToolbarItemInstance', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar.locator('.ag-toolbar-item.ag-toolbar-button')).toHaveCount(2);

        const externalColumns = page.getByRole('button', { name: 'Toggle Columns Panel' });
        await externalColumns.click();
        await expect(page.locator('.ag-column-tool-panel')).toBeVisible();

        await externalColumns.click();
        await expect(page.locator('.ag-column-tool-panel')).toBeHidden();
    });
});
