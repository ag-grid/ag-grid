import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example charts average daily temperatures on a line chart with a time axis, and
    // offers a button to switch the `date` column between a time axis and a category axis.
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented columns: a date (ISO formatted) and an average temperature.
        await expect(agIdFor.cell('0', 'date')).toContainText('2019-01-01');
        await expect(agIdFor.cell('0', 'avgTemp')).toContainText('8.27');

        // A line chart is created over the date + avgTemp range.
        const models = await waitForChartModels(gridApi);
        expect(models[0].chartType).toBe('line');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // The `date` column starts on a time axis (Date values default to time, no explicit type).
        const dateColBefore = await gridApi.getColumnDef('date');
        expect(dateColBefore?.chartDataType).toBeUndefined();

        // Clicking the toggle switches the `date` column onto a category axis.
        const axisBtn = page.locator('#axisBtn');
        await expect(axisBtn).toHaveText('Category');
        await axisBtn.click();
        await expect(axisBtn).toHaveText('time');

        const dateColAfter = await gridApi.getColumnDef('date');
        expect(dateColAfter?.chartDataType).toBe('category');
    });
});
