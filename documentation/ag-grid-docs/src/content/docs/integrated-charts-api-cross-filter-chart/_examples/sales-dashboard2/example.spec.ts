import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Sales Dashboard #2 creates three cross-filter charts on firstDataRendered:
    //   - a 'line' chart (Quarterly Sales) in #lineChart
    //   - a 'donut' chart (Sales by Representative) in #donutChart
    //   - an 'area' chart (Handsets Sold) in #areaChart
    // Cross-filter interactions are only pixel-addressable on the chart canvas, so this
    // asserts chart creation/types (observable via getChartModels + canvases) and the
    // documented grid setup.
    test.eachFramework('creates the three documented cross-filter charts', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);

        await expect(page.locator('#lineChart canvas').first()).toBeVisible();
        await expect(page.locator('#donutChart canvas').first()).toBeVisible();
        await expect(page.locator('#areaChart canvas').first()).toBeVisible();

        const models = (await api.getChartModels()) as any[];
        expect(models).toHaveLength(3);
        const chartTypes = models.map((m) => m.chartType).sort();
        expect(chartTypes).toEqual(['area', 'donut', 'line']);

        await expect(page.getByTestId('ag-header-cell:colId=salesRep')).toContainText('Sales Rep');
        await expect(page.getByTestId('ag-header-cell:colId=handset')).toContainText('Handset');
        await expect(page.getByTestId('ag-header-cell:colId=sale')).toContainText('Sale Price');
        await expect(page.getByTestId('ag-header-cell:colId=saleDate')).toContainText('Sale Date');
        await expect(page.getByTestId('ag-header-cell:colId=quarter')).toContainText('Quarter');

        expect(await api.getFilterModel()).toEqual({});
    });
});
