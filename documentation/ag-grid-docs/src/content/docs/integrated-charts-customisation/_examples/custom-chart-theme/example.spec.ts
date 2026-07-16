import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example supplies two `customChartThemes` (light/dark) via `chartThemes`. The custom
    // palette, background and legend/axis styling are painted onto the chart canvas, so they are
    // not DOM-assertable. We verify the documented setup: the grid renders the charted columns
    // and a grouped-bar range chart is created using the first custom theme in `chartThemes`.
    test.eachFramework('Custom Chart Theme', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Gold' })).toBeVisible();
        await expect(page.locator('.ag-cell', { hasText: 'Ireland' }).first()).toBeVisible();

        // A grouped-bar range chart is auto-created and uses the first supplied custom theme.
        const models = await remoteGrid(page).getChartModels();
        expect(models).toHaveLength(1);
        expect(models![0].chartType).toBe('groupedBar');
        expect(models![0].chartThemeName).toBe('my-custom-theme-light');
        expect(models![0].cellRange.columns).toEqual(['country', 'gold', 'silver', 'bronze']);

        await expect(page.locator('.ag-chart-canvas-wrapper canvas').first()).toBeVisible();
    });
});
