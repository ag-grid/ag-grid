import { dragOverTo, ensureGridReady, expect, gridApiHandle, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('range selection changes drive event-based chart updates', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-creates a range chart into the #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // Exactly one chart exists, backed by the initial cell range.
        const api = await gridApiHandle(page);
        const models = (await api.evaluate((api) => api.getChartModels())) ?? [];
        expect(models.length).toBe(1);

        const logs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        // Extend the charted range by dragging the range handle down a few rows. This is a
        // real range-selection change in the grid, which fires ChartRangeSelectionChanged; the
        // example's handler logs it and recomputes the chart subtitle from the new range.
        const rangeHandle = page.locator('.ag-range-handle');
        await expect(rangeHandle).toBeVisible();
        await dragOverTo(rangeHandle, agIdFor.cell('7', 'Sunshine (hours)'));

        await expect(() => {
            expect(logs.some((l) => l.includes('Changed range selection of chart with ID'))).toBe(true);
        }).toPass();
    });
});
