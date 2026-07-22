import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row grouping by 'division' with the auto group column configured to show the 'resource'
    // leaf field. The range chart is created over ['expenses'] with useGroupColumnAsCategory: true,
    // so the group column drives a grouped category axis (division -> resource) rather than a flat
    // category. groupDefaultExpanded: 1 means the top-level division groups start expanded.
    test.eachFramework('charts a grouped category from the group column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The range chart renders into the dedicated chart container as a single 'expenses' series.
        await expect(page.locator('#myChart canvas')).toBeVisible();
        await expect(page.locator('#myChart [role="figure"]')).toHaveAttribute('aria-label', 'chart, 1 series');

        // Division groups are present and expanded by default (groupDefaultExpanded: 1).
        const salesGroup = page.locator('.ag-row[row-id="row-group-division-Sales"]').first();
        await expect(salesGroup).toBeVisible();
        await expect(salesGroup.locator('.ag-group-contracted')).toHaveClass(/ag-hidden/);

        // Leaf nodes expose the 'resource' field in the auto group column, which the grouped
        // category axis relies on.
        await expect(
            page.locator('.ag-cell[col-id="ag-Grid-AutoColumn"]', { hasText: 'Online sales' }).first()
        ).toBeVisible();

        // The group (auto) column is highlighted as the chart category and 'expenses' as the series.
        expect(
            await page.locator('.ag-cell[col-id="ag-Grid-AutoColumn"].ag-cell-range-chart-category').count()
        ).toBeGreaterThan(0);
        expect(await page.locator('.ag-cell[col-id="expenses"].ag-cell-range-chart').count()).toBeGreaterThan(0);
    });
});
