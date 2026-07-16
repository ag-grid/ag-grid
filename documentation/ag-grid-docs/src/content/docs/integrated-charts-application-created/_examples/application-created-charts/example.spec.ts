import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // A pre-defined range chart is created programmatically into the #myChart container on
        // first data rendered.
        const chart = page.locator('#myChart .ag-chart');
        await expect(chart).toBeVisible();
        await expect(page.locator('#myChart .ag-charts-canvas').first()).toBeVisible();

        // Stop the live updates to keep the DOM stable while asserting.
        await page.getByRole('button', { name: 'Stop' }).click();

        // The chart-type buttons dynamically update the existing chart via gridApi.updateChart().
        // The chart must remain rendered after switching type.
        await page.getByRole('button', { name: 'Line Chart' }).click();
        await expect(page.locator('#myChart .ag-charts-canvas').first()).toBeVisible();

        await page.getByRole('button', { name: 'Stacked Column Chart' }).click();
        await expect(page.locator('#myChart .ag-charts-canvas').first()).toBeVisible();
    });
});
