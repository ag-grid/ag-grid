import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom toolbar items drive filters and tool panels', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        const checkboxes = toolbar.locator('input[type="checkbox"]');
        const radios = toolbar.locator('input[type="radio"]');
        await expect(checkboxes).toHaveCount(2);
        await expect(radios).toHaveCount(3);

        await checkboxes.nth(0).check();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeVisible();

        await toolbar.getByLabel('Columns').check();
        await expect(page.locator('.ag-column-panel')).toBeVisible();

        // Closing the panel via the side bar tab keeps the radio in sync via getToolbarItemInstance
        await page.getByRole('tab', { name: 'Columns' }).click();
        await expect(toolbar.getByLabel('None')).toBeChecked();
    });
});
