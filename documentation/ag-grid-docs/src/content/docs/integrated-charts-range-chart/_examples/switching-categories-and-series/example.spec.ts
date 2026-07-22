import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The example auto-creates a line range chart with switchCategorySeries: true over
    // ['year', 'jan', ..., 'dec']. Switching means the category column values (the years)
    // become the chart series, and the former series columns (the months) become the
    // category axis. There are 13 years of data, hence 13 series.
    test.eachFramework('switches category and series so years become the series', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The range chart renders into the dedicated chart container.
        await expect(page.locator('#myChart canvas')).toBeVisible();

        // After switching, each of the 13 years is a distinct series (rather than each month).
        await expect(page.locator('#myChart [role="figure"]')).toHaveAttribute('aria-label', 'chart, 13 series');
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar button');
        await expect(legend).toHaveCount(13);
        // Years drive the series list (data spans 2010..2022).
        await expect(legend.first()).toContainText('2010');
        await expect(legend.last()).toContainText('2022');

        // The 'year' column is the configured category and is highlighted as a category range.
        expect(await page.locator('.ag-cell[col-id="year"].ag-cell-range-chart-category').count()).toBeGreaterThan(0);
        // The month columns form the series range highlight.
        for (const colId of ['jan', 'jun', 'dec']) {
            expect(await page.locator(`.ag-cell[col-id="${colId}"].ag-cell-range-chart`).count()).toBeGreaterThan(0);
        }
    });
});
