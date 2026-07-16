import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Sales Dashboard #1 creates three cross-filter charts on firstDataRendered:
    //   - a 'column' chart (Quarterly Sales) in #columnChart
    //   - a 'pie' chart (Sales by Representative) in #pieChart
    //   - a 'bar' chart (Handsets Sold) in #barChart
    // Cross-filter interactions are only pixel-addressable on the chart canvas, so this
    // asserts chart creation/types (observable via getChartModels + canvases) and the
    // documented grid setup.
    test.eachFramework('creates the three documented cross-filter charts', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);

        // Each createCrossFilterChart call renders an AG Charts canvas into its container.
        await expect(page.locator('#columnChart canvas').first()).toBeVisible();
        await expect(page.locator('#pieChart canvas').first()).toBeVisible();
        await expect(page.locator('#barChart canvas').first()).toBeVisible();

        // Three charts exist with the documented types.
        const models = (await api.getChartModels()) as any[];
        expect(models).toHaveLength(3);
        const chartTypes = models.map((m) => m.chartType).sort();
        expect(chartTypes).toEqual(['bar', 'column', 'pie']);

        // Documented grid columns are present with their configured headers.
        await expect(page.getByTestId('ag-header-cell:colId=salesRep')).toContainText('Sales Rep');
        await expect(page.getByTestId('ag-header-cell:colId=handset')).toContainText('Handset');
        await expect(page.getByTestId('ag-header-cell:colId=sale')).toContainText('Sale Price');
        await expect(page.getByTestId('ag-header-cell:colId=saleDate')).toContainText('Sale Date');
        await expect(page.getByTestId('ag-header-cell:colId=quarter')).toContainText('Quarter');

        // No grid filter is active on load.
        expect(await api.getFilterModel()).toEqual({});
    });
});
