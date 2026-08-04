import { ensureGridReady, expect, test, waitForChartModels, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // This example applies axis label + title formatters (SI units on the primary axis, "%" on
    // the secondary efficiency axis) via `chartThemeOverrides.common.axes.number`. Axis labels
    // and titles are painted onto the chart canvas, so the formatter output is render-only and
    // cannot be asserted from the DOM. We verify the documented setup: the grid renders the
    // charted columns and a column/line combo chart is created with the documented per-series
    // chart types (efficiency on a secondary line axis).
    test.eachFramework('Label Formatting', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.getByRole('columnheader', { name: 'Year' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Generated' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Efficiency' })).toBeVisible();
        await expect(page.locator('.ag-cell', { hasText: '2016' }).first()).toBeVisible();

        const models = await waitForChartModels(remoteGrid(page));
        // Mixed per-series chart types are stored as a custom combo.
        expect(models[0].chartType).toBe('customCombo');
        expect(models[0].cellRange.columns).toEqual(['year', 'generated', 'consumed', 'surplus', 'efficiency']);

        // Efficiency is charted as a line on a secondary axis; the other series are grouped columns.
        const seriesTypes = models[0].seriesChartTypes ?? [];
        const efficiency = seriesTypes.find((s) => s.colId === 'efficiency');
        expect(efficiency?.chartType).toBe('line');
        expect(efficiency?.secondaryAxis).toBe(true);

        await expect(page.locator('.ag-chart-canvas-wrapper canvas').first()).toBeVisible();
    });
});
