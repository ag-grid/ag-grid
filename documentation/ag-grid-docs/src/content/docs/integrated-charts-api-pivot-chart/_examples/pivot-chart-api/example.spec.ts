import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The example runs in pivot mode and creates a pivot chart via gridApi.createPivotChart()
        // into the #myChart container on first data rendered.
        const chart = page.locator('#myChart .ag-chart');
        await expect(chart).toBeVisible();
        await expect(page.locator('#myChart .ag-charts-canvas').first()).toBeVisible();
    });
});
