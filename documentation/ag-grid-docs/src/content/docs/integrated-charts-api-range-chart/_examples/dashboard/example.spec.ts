import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders range charts into external dashboard containers', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Each chartContainer div receives a rendered chart (canvas) on first data render.
        await expect(page.locator('#chart1 .ag-charts-canvas')).toHaveCount(1);
        await expect(page.locator('#chart2 .ag-charts-canvas')).toHaveCount(1);
        await expect(page.locator('#chart3 .ag-charts-canvas')).toHaveCount(1);

        // Charts are placed outside the grid, so no popup chart dialog is used.
        await expect(page.locator('.ag-dialog .ag-chart')).toHaveCount(0);

        // Chart menu is hidden via getChartToolbarItems: [].
        await expect(page.locator('.ag-chart-menu-toolbar-button')).toHaveCount(0);
    });
});
