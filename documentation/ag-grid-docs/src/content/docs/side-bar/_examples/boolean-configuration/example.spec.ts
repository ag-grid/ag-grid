import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Default side bar shows Columns and Filters with Columns open', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar: true => default side bar with Columns and Filters tool panels.
        const sideButtons = page.locator('.ag-side-button');
        await expect(sideButtons).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        // Columns panel is open by default.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
    });

    test.eachFramework('Clicking Filters button opens the Filters panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-side-button').filter({ hasText: 'Filters' }).click();

        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toHaveCount(0);
    });
});
