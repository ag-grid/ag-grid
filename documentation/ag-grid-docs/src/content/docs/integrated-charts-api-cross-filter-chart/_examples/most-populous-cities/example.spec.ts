import { ensureGridReady, expect, gridApiHandle, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Most Populous Cities creates two cross-filter charts on firstDataRendered:
    //   - a 'column' chart (cities per country) in #barChart
    //   - a 'bubble' chart (latitude vs longitude) in #bubbleChart
    // Cross-filter interactions are only pixel-addressable on the chart canvas, so this
    // asserts chart creation/types (observable via getChartModels + canvases) and the
    // documented grid setup.
    test.eachFramework('creates the two documented cross-filter charts', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = await gridApiHandle(page);

        await expect(page.locator('#barChart canvas').first()).toBeVisible();
        await expect(page.locator('#bubbleChart canvas').first()).toBeVisible();

        const models = (await api.evaluate((api) => api.getChartModels())) ?? [];
        expect(models).toHaveLength(2);
        const chartTypes = models.map((m) => m.chartType).sort();
        expect(chartTypes).toEqual(['bubble', 'column']);

        await expect(page.getByTestId('ag-header-cell:colId=city')).toContainText('City');
        await expect(page.getByTestId('ag-header-cell:colId=country')).toContainText('Country');
        await expect(page.getByTestId('ag-header-cell:colId=longitude')).toContainText('Longitude');
        await expect(page.getByTestId('ag-header-cell:colId=latitude')).toContainText('Latitude');
        await expect(page.getByTestId('ag-header-cell:colId=population')).toContainText('Population');

        expect(await api.evaluate((api) => api.getFilterModel())).toEqual({});
    });
});
