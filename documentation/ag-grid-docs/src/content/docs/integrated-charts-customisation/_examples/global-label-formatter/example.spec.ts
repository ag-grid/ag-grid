import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example uses a single global `formatter` that prefixes every number label on the chart
    // with a £ symbol. That formatting is applied to axis labels / tooltips painted onto the chart
    // canvas, so it is render-only and not DOM-assertable (the columns here have no grid-side
    // valueFormatter, so the grid shows raw numbers). We verify the documented setup: the grid
    // renders the charted columns and a grouped-column range chart is created from them.
    test.eachFramework('Global Label Formatter', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.getByRole('columnheader', { name: 'Financial Period' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Recurring Revenue' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Individual Sales' })).toBeVisible();
        await expect(page.locator('.ag-cell', { hasText: 'Q1 2021' }).first()).toBeVisible();

        const models = await waitForChartModels(remoteGrid(page));
        expect(models[0].chartType).toBe('groupedColumn');
        expect(models[0].cellRange.columns).toEqual(['period', 'recurring', 'individual']);

        await expect(page.locator('.ag-chart-canvas-wrapper canvas').first()).toBeVisible();
    });
});
