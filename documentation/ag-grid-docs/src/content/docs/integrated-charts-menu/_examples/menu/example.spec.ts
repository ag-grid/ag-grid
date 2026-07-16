import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example auto-creates a range chart on first data rendered. The Chart Menu appears in the
    // chart's top-right corner and, by default, offers Edit Chart, Advanced Settings, Link/Unlink
    // and Download Chart.
    test.eachFramework('Chart Menu shows the default items', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The auto-created chart puts a chart range on the grid cells.
        await expect(page.locator('.ag-cell-range-chart').first()).toBeVisible();

        // Open the Chart Menu.
        await page.locator('.ag-chart-menu-toolbar-button').first().click();

        // Default menu items are displayed (Advanced Settings only shows on AG Charts Enterprise,
        // which this example uses).
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Edit Chart' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Advanced Settings' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Unlink from Grid' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Download Chart' })).toBeVisible();
    });

    // Selecting "Unlink from Grid" unlinks the chart: the chart range disappears from the grid and
    // the menu now offers "Link to Grid".
    test.eachFramework('Unlink from Grid removes the chart range', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-cell-range-chart').first()).toBeVisible();

        await page.locator('.ag-chart-menu-toolbar-button').first().click();
        await page.locator('.ag-menu-option-text', { hasText: 'Unlink from Grid' }).click();

        // The chart range is removed from the grid once unlinked.
        await expect(page.locator('.ag-cell-range-chart')).toHaveCount(0);

        // Re-opening the menu now offers the reverse action.
        await page.locator('.ag-chart-menu-toolbar-button').first().click();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Link to Grid' })).toBeVisible();
    });
});
