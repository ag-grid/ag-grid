import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row grouping by 'division'. The range chart is created over ['expenses'] with
    // aggFunc: 'sum' and useGroupColumnAsCategory: true, so the chart aggregates the leaf
    // expenses up to the group level and plots one aggregated value per division group.
    // groupDefaultExpanded: 1 means the division groups start expanded.
    test.eachFramework('charts aggregated group values from the group column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The range chart renders into the dedicated chart container as a single 'expenses' series.
        await expect(page.locator('#myChart canvas')).toBeVisible();
        await expect(page.locator('#myChart [role="figure"]')).toHaveAttribute('aria-label', 'chart, 1 series');

        // Division groups are present and expanded by default (groupDefaultExpanded: 1).
        const salesGroup = page.locator('.ag-row[row-id="row-group-division-Sales"]').first();
        await expect(salesGroup).toBeVisible();
        await expect(salesGroup.locator('.ag-group-contracted')).toHaveClass(/ag-hidden/);
        // The auto group column shows the division categories that the chart aggregates over.
        await expect(salesGroup.locator('.ag-cell[col-id="ag-Grid-AutoColumn"]')).toContainText('Sales');

        // The group (auto) column is highlighted as the chart category and 'expenses' as the series.
        expect(
            await page.locator('.ag-cell[col-id="ag-Grid-AutoColumn"].ag-cell-range-chart-category').count()
        ).toBeGreaterThan(0);
        expect(await page.locator('.ag-cell[col-id="expenses"].ag-cell-range-chart').count()).toBeGreaterThan(0);
    });
});
