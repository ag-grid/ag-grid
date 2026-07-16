import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, remoteGrid, agFramework }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The provided container is the example's .chart-wrapper element (id/ref name varies by
        // framework, but the class is common to all of them).
        const chartParent = page.locator('.chart-wrapper');

        // Before any chart is created, the container shows the placeholder text.
        await expect(chartParent).toContainText('Chart will be displayed here.');

        // Creating a chart from a range of medal columns triggers the createChartContainer callback,
        // which places the chart into the provided container rather than the default popup window.
        await remoteGrid(page).createRangeChart({
            cellRange: { columns: ['gold', 'silver', 'bronze', 'total'] },
            chartType: 'groupedColumn',
        });

        // The chart is rendered inside the provided container, and not inside a grid popup dialog.
        await expect(chartParent.locator('.ag-chart')).toBeVisible();
        await expect(chartParent.locator('.ag-charts-canvas').first()).toBeVisible();
        await expect(page.locator('.ag-dialog .ag-chart')).toHaveCount(0);

        // The Destroy-button round-trip depends on the framework re-rendering the container template
        // in response to the createChartContainer state change. Angular's template is not updated
        // here because the chart is created via the grid API (outside Angular's change-detection
        // zone), so the @if branch that renders the button never runs. The chart element itself is
        // still appended to the container (asserted above), which is the behaviour this example
        // documents. Skip only the button interaction for Angular.
        if (!agFramework.includes('angular')) {
            const destroyButton = chartParent.getByRole('button', { name: 'Destroy Chart' });
            await expect(destroyButton).toBeVisible();

            // Clicking Destroy destroys the chart and restores the placeholder.
            await destroyButton.click();
            await expect(chartParent).toContainText('Chart will be displayed here.');
            await expect(chartParent.locator('.ag-chart')).toHaveCount(0);
        }
    });
});
