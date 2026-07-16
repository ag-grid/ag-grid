import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example customises `chartMenuItems`: it hides Edit Chart and Advanced Settings, and adds
    // a custom "Close Chart" item that destroys the chart via the chart ref.
    test.eachFramework('Chart Menu hides default items and adds a custom one', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The auto-created chart puts a chart range on the grid cells.
        await expect(page.locator('.ag-cell-range-chart').first()).toBeVisible();

        // Open the Chart Menu.
        await page.locator('.ag-chart-menu-toolbar-button').first().click();

        // Edit Chart and Advanced Settings are removed by the callback.
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Edit Chart' })).toHaveCount(0);
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Advanced Settings' })).toHaveCount(0);

        // The default link/unlink item is retained, and the custom "Close Chart" item is added.
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Unlink from Grid' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Close Chart' })).toBeVisible();
    });

    // The custom "Close Chart" action destroys the chart, which removes the chart range from the grid.
    test.eachFramework('Close Chart destroys the chart', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-cell-range-chart').first()).toBeVisible();

        await page.locator('.ag-chart-menu-toolbar-button').first().click();
        await page.locator('.ag-menu-option-text', { hasText: 'Close Chart' }).click();

        // Destroying the chart removes its range highlight from the grid and the chart menu button.
        await expect(page.locator('.ag-cell-range-chart')).toHaveCount(0);
        await expect(page.locator('.ag-chart-menu-toolbar-button')).toHaveCount(0);
    });
});
