import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Side bar shows Columns and Filters, Columns open by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar: ['columns', 'filters-new']
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        // First panel ('columns') is open by default.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
    });

    test.eachFramework('Clicking Filters opens the new Filters panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-side-button').filter({ hasText: 'Filters' }).click();

        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-panel')).toBeVisible();
    });
});
