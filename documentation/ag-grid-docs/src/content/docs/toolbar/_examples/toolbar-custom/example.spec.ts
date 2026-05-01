import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tool panel radio toggles tool panels', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        const radios = toolbar.locator('input[type="radio"]');
        await expect(radios).toHaveCount(3);

        await toolbar.getByLabel('Columns').check();
        await expect(page.locator('.ag-column-tool-panel')).toBeVisible();

        await toolbar.getByLabel('Filters').check();
        await expect(page.locator('.ag-filter-panel')).toBeVisible();

        await toolbar.getByLabel('None').check();
        await expect(page.locator('.ag-filter-panel')).toBeHidden();
        await expect(page.locator('.ag-column-tool-panel')).toBeHidden();
    });
});
