import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example customises the chart via `chartThemeOverrides.common` (title, subtitle,
    // padding and legend styling). Those overrides are painted onto the chart canvas, so they
    // cannot be asserted from the DOM. We verify the documented setup instead: the grid renders
    // the charted columns and a grouped-column range chart is created from them on first render.
    test.eachFramework('Common Overrides', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grid renders the four columns that feed the chart.
        await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Gold' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Silver' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Bronze' })).toBeVisible();
        await expect(page.locator('.ag-cell', { hasText: 'Ireland' }).first()).toBeVisible();

        // A grouped-column range chart is auto-created over the category + three series columns.
        const models = await waitForChartModels(remoteGrid(page));
        expect(models[0].chartType).toBe('groupedColumn');
        expect(models[0].cellRange.columns).toEqual(['country', 'gold', 'silver', 'bronze']);

        // The chart canvas is rendered (theme overrides themselves are canvas-only).
        await expect(page.locator('.ag-chart-canvas-wrapper canvas').first()).toBeVisible();
    });
});
