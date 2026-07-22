import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example demonstrates a time-axis combination chart: rain as grouped columns and
    // pressure/temp as lines, all plotted against a time axis built from the `date` column.
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented columns with the ISO date formatter and numeric series.
        await expect(agIdFor.cell('0', 'date')).toContainText('2021-01-01');
        await expect(agIdFor.cell('0', 'rain')).toContainText('0.22');
        await expect(agIdFor.cell('0', 'pressure')).toContainText('1011.6');
        await expect(agIdFor.cell('0', 'temp')).toContainText('2.1');

        // A combination chart is created over the date + rain + pressure + temp range, with the
        // date column (chartDataType: 'time') providing the time axis.
        const models = await gridApi.getChartModels();
        expect(models).toHaveLength(1);
        expect(models![0].chartType).toBe('customCombo');

        // Rain is a grouped column while pressure and temp are lines.
        const seriesChartTypes = models![0].seriesChartTypes ?? [];
        const typeByColId = Object.fromEntries(seriesChartTypes.map((s) => [s.colId, s.chartType]));
        expect(typeByColId).toMatchObject({
            rain: 'groupedColumn',
            pressure: 'line',
            temp: 'line',
        });

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();
    });
});
