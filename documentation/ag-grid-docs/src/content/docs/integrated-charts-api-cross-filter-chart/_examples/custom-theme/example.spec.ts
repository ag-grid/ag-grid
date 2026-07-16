import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Custom Theme creates four cross-filter charts on firstDataRendered, all styled by the
    // registered custom chart themes ('my-custom-theme-light' / 'my-custom-theme-dark'):
    //   - a 'column' chart (Quarterly Sales) in #columnChart
    //   - a 'pie' chart (Sales by Representative) in #pieChart
    //   - an 'area' chart (Handsets Sold) in #areaChart
    //   - a 'bubble' chart (Sales by Quarter and Handset) in #bubbleChart
    // The custom theme colours themselves are only observable at render-level on the canvas,
    // so this asserts chart creation/types, the documented custom-theme configuration, and
    // the grid setup.
    test.eachFramework('creates the four charts with the custom theme configured', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const api = remoteGrid(page);

        await expect(page.locator('#columnChart canvas').first()).toBeVisible();
        await expect(page.locator('#pieChart canvas').first()).toBeVisible();
        await expect(page.locator('#areaChart canvas').first()).toBeVisible();
        await expect(page.locator('#bubbleChart canvas').first()).toBeVisible();

        const models = (await api.getChartModels()) as any[];
        expect(models).toHaveLength(4);
        const chartTypes = models.map((m) => m.chartType).sort();
        expect(chartTypes).toEqual(['area', 'bubble', 'column', 'pie']);

        // The documented custom chart themes are registered as the available themes.
        expect(await api.getGridOption('chartThemes')).toEqual(['my-custom-theme-light', 'my-custom-theme-dark']);

        // Documented visible grid columns are present (handsetIndex/quarterIndex are hidden).
        await expect(page.getByTestId('ag-header-cell:colId=salesRep')).toContainText('Sales Rep');
        await expect(page.getByTestId('ag-header-cell:colId=handset')).toContainText('Handset');
        await expect(page.getByTestId('ag-header-cell:colId=sale')).toContainText('Sale Price');
        await expect(page.getByTestId('ag-header-cell:colId=saleDate')).toContainText('Sale Date');
        await expect(page.getByTestId('ag-header-cell:colId=quarter')).toContainText('Quarter');

        expect(await api.getFilterModel()).toEqual({});
    });
});
