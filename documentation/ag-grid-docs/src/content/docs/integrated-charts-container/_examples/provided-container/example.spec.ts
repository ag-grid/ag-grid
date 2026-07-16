import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before any chart is created, the container shows the placeholder text.
        const chartParent = page.locator('#chartParent');
        await expect(chartParent).toContainText('Chart will be displayed here.');

        // Creating a chart from a range of medal columns triggers the createChartContainer callback,
        // which places the chart into #chartParent rather than the default popup window.
        await remoteGrid(page).createRangeChart({
            cellRange: { columns: ['gold', 'silver', 'bronze', 'total'] },
            chartType: 'groupedColumn',
        });

        // The chart is rendered inside the provided container...
        await expect(chartParent.locator('.ag-chart')).toBeVisible();
        await expect(chartParent.locator('.ag-charts-canvas').first()).toBeVisible();
        // ...alongside the example's Destroy button, and not inside a grid popup dialog.
        await expect(chartParent.locator('.chart-wrapper-close')).toHaveText('Destroy Chart');
        await expect(page.locator('.ag-dialog .ag-chart')).toHaveCount(0);

        // Clicking Destroy calls destroyChart() and restores the placeholder.
        await chartParent.locator('.chart-wrapper-close').click();
        await expect(chartParent).toContainText('Chart will be displayed here.');
        await expect(chartParent.locator('.ag-chart')).toHaveCount(0);
    });
});
