import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom toggles apply and clear column filters', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        const checkboxes = toolbar.locator('input[type="checkbox"]');
        await expect(checkboxes).toHaveCount(2);

        await checkboxes.nth(0).check();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeVisible();

        await checkboxes.nth(1).check();
        await expect(page.locator('.ag-header-cell[col-id="silver"] .ag-filter-active')).toBeVisible();

        await checkboxes.nth(0).uncheck();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeHidden();
    });
});
