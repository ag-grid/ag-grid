import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example demonstrates configuring numeric timestamps to use a time axis by setting
    // `chartDataType: 'time'` on the column, plotted as an area chart of CPU usage over time.
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented columns: a numeric timestamp and its CPU usage.
        await expect(agIdFor.cell('0', 'timestamp')).toContainText('1600983900792');
        await expect(agIdFor.cell('0', 'cpuUsage')).toContainText('99');

        // An area chart is created over the timestamp + cpuUsage range (the timestamp column is
        // configured with chartDataType: 'time' so the horizontal axis is a time axis).
        const models = await waitForChartModels(gridApi);
        expect(models[0].chartType).toBe('area');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();
    });
});
