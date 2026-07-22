import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('SideBarDef renders on the left with Filters open by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // position: 'left'
        await expect(page.locator('.ag-side-bar.ag-side-bar-left')).toBeVisible();

        // Both configured tool panel buttons are present.
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        // defaultToolPanel: 'filters'
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });

    test.eachFramework('Clicking Columns opens the Columns panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-side-button').filter({ hasText: 'Columns' }).click();

        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
    });
});
