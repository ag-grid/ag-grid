import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders a custom combination chart into an external container', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The customCombo chart is created on first data render into the #myChart container.
        await expect(page.locator('#myChart .ag-charts-canvas')).toHaveCount(1);

        // Chart is placed outside the grid popup, so no chart dialog is used.
        await expect(page.locator('.ag-dialog .ag-chart')).toHaveCount(0);

        // suppressChartRanges=true means the grid shows no chart range highlight cells.
        await expect(page.locator('.ag-cell-range-chart')).toHaveCount(0);
    });
});
