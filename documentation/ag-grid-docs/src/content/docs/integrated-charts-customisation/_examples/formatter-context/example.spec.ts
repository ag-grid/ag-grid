import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example uses a global chart `formatter` that reaches back into the grid context to
    // reuse each column's `valueFormatter` for the chart's category axis and tooltips. The chart
    // labels/tooltips are painted onto the canvas, so the chart-side output is render-only. What
    // is DOM-assertable is the source of truth the formatter reuses: the grid cells themselves,
    // which render through the very same column `valueFormatter`s (period reordered, £ / $ prefixes).
    test.eachFramework('Formatter Context', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.getByRole('columnheader', { name: 'Financial Period' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Recurring Revenue' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Individual Sales' })).toBeVisible();

        // The period valueFormatter reorders "Q1 2021" -> "2021 - Q1".
        await expect(page.locator('.ag-cell', { hasText: '2021 - Q1' }).first()).toBeVisible();
        // The recurring/individual valueFormatters prefix values with £ and $ respectively.
        await expect(page.locator('.ag-cell', { hasText: '£485829' }).first()).toBeVisible();
        await expect(page.locator('.ag-cell', { hasText: '$237438' }).first()).toBeVisible();

        // A grouped-column range chart is created over the three columns.
        const models = await waitForChartModels(remoteGrid(page));
        expect(models[0].chartType).toBe('groupedColumn');
        expect(models[0].cellRange.columns).toEqual(['period', 'recurring', 'individual']);

        await expect(page.locator('.ag-chart-canvas-wrapper canvas').first()).toBeVisible();
    });
});
