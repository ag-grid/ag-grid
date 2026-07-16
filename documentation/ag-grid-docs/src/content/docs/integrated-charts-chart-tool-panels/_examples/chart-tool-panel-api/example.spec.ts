import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The chart is rendered into a container (not a popup) and the Chart Tool Panels are opened and
    // closed programmatically via `openChartToolPanel()` / `closeChartToolPanel()`.
    test.eachFramework('Open and close chart tool panels via the grid API', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tabbedMenu = page.locator('.ag-chart-tabbed-menu');

        // No tool panel is shown until it is opened programmatically.
        await expect(tabbedMenu).toHaveCount(0);

        // "Open Chart Tool Panel" opens the default (Chart) tab.
        await page.getByRole('button', { name: 'Open Chart Tool Panel', exact: true }).click();
        await expect(tabbedMenu).toBeVisible();
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Chart');
        await expect(page.locator('.ag-chart-settings-wrapper')).toBeVisible();

        // "Open Chart Tool Panel Customize tab" switches to the Customize (format) tab.
        await page.getByRole('button', { name: 'Open Chart Tool Panel Customize tab' }).click();
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Customize');
        await expect(page.locator('.ag-chart-format-wrapper')).toBeVisible();

        // "Close Chart Tool Panel" hides the tool panel.
        await page.getByRole('button', { name: 'Close Chart Tool Panel' }).click();
        await expect(tabbedMenu).not.toBeVisible();
    });
});
