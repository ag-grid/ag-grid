import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example auto-creates a range chart on first data rendered over
    // ['age', 'gold', 'silver', 'bronze']. It demonstrates how columns are classified
    // for charting: age -> category (chartDataType), gold/silver -> series (chartDataType),
    // bronze -> series (inferred number), year -> excluded, sport -> category (inferred string).
    test.eachFramework('classifies categories, series and excluded columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The range chart renders into the dedicated chart container.
        await expect(page.locator('#myChart canvas')).toBeVisible();

        // Configured chart title from chartThemeOverrides.
        await expect(page.locator('#myChart [role="figure"] text', { hasText: 'Medals by Age' })).toBeVisible();

        // Only the three numeric medal columns are charted as series. 'age' is a category
        // (so it is NOT a series) and 'year' is excluded, so neither appears as a series.
        await expect(page.locator('#myChart [role="figure"]')).toHaveAttribute('aria-label', 'chart, 3 series');
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar button');
        await expect(legend).toHaveCount(3);
        await expect(legend.nth(0)).toContainText('Gold');
        await expect(legend.nth(1)).toContainText('Silver');
        await expect(legend.nth(2)).toContainText('Bronze');

        // Category cells (green highlight) come from the 'age' column only.
        expect(await page.locator('.ag-cell[col-id="age"].ag-cell-range-chart-category').count()).toBeGreaterThan(0);

        // Series cells (blue highlight) come from the numeric medal columns, and unlike the
        // category column they carry no category-range modifier class.
        for (const colId of ['gold', 'silver', 'bronze']) {
            expect(await page.locator(`.ag-cell[col-id="${colId}"].ag-cell-range-chart`).count()).toBeGreaterThan(0);
            expect(await page.locator(`.ag-cell[col-id="${colId}"].ag-cell-range-chart-category`).count()).toBe(0);
        }

        // Excluded / off-range columns carry no chart-range highlight at all.
        for (const colId of ['year', 'athlete', 'sport']) {
            expect(await page.locator(`.ag-cell[col-id="${colId}"].ag-cell-range-chart`).count()).toBe(0);
            expect(await page.locator(`.ag-cell[col-id="${colId}"].ag-cell-range-chart-category`).count()).toBe(0);
        }
    });
});
