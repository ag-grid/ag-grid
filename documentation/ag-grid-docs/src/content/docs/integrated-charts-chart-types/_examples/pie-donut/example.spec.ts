import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example demonstrates Pie / Donut integrated charts. A pie chart is created over the first
// four rows (period + individual); the Pie/Donut buttons swap the chart type, with the donut also
// charting an extra series (recurring), which the legend reflects.
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented category + series columns and first row of data.
        await expect(agIdFor.cell('0', 'period')).toContainText('Q1 2021');
        await expect(agIdFor.cell('0', 'recurring')).toContainText('485829');
        await expect(agIdFor.cell('0', 'individual')).toContainText('237438');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar [role="switch"]');

        // The chart starts as a pie over the first four periods (single series -> one legend item
        // per category).
        const initialModels = await gridApi.getChartModels();
        expect(initialModels).toHaveLength(1);
        expect(initialModels![0].chartType).toBe('pie');
        await expect(legend).toHaveCount(4);
        await expect(legend.nth(0)).toContainText('Q1 2021');

        // Donut button switches the chart type and adds the recurring series: the legend now lists
        // both series across the four periods (8 items).
        const buttons = page.locator('.button-container button');
        await expect(buttons).toHaveCount(2);
        await buttons.nth(1).click();
        await page.waitForTimeout(300);
        expect((await gridApi.getChartModels())![0].chartType).toBe('donut');
        await expect(legend).toHaveCount(8);
        await expect(legend.nth(0)).toContainText('Recurring revenue');
        await expect(legend.nth(4)).toContainText('Individual sales');

        // Pie button switches the chart type back to a pie.
        await buttons.nth(0).click();
        await page.waitForTimeout(300);
        expect((await gridApi.getChartModels())![0].chartType).toBe('pie');
    });
});
