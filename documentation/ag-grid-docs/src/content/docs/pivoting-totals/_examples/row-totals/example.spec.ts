import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pivot row totals appear before the pivot columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // pivotRowTotals: 'before' inserts one total column per aggregation (gold/silver/bronze),
        // grouped under a PivotRowTotal_ header group, positioned before the year pivot columns.
        await expect(agIdFor.headerGroupCell('PivotRowTotal__pivotGroup_gold_0')).toBeVisible();
        await expect(agIdFor.headerGroupCell('PivotRowTotal__pivotGroup_silver_0')).toBeVisible();
        await expect(agIdFor.headerGroupCell('PivotRowTotal__pivotGroup_bronze_0')).toBeVisible();

        // Verify the total columns come *before* the year pivot columns ('before' positioning).
        const order = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.ag-header-cell[col-id]')).map((e) => e.getAttribute('col-id'))
        );
        const totalGoldIdx = order.indexOf('PivotRowTotal_pivot_year__gold');
        const firstYearIdx = order.findIndex((id) => id?.startsWith('pivot_year_'));
        expect(totalGoldIdx).toBeGreaterThanOrEqual(0);
        expect(firstYearIdx).toBeGreaterThan(totalGoldIdx);
    });

    test.eachFramework('Row total columns show the aggregated total across all years', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States row: the row-total columns hold the sum of that medal across every year.
        const row = 'row-group-country-United States';
        await expect(agIdFor.cell(row, 'PivotRowTotal_pivot_year__gold').first()).toContainText('552');
        await expect(agIdFor.cell(row, 'PivotRowTotal_pivot_year__silver').first()).toContainText('440');
        await expect(agIdFor.cell(row, 'PivotRowTotal_pivot_year__bronze').first()).toContainText('320');
    });
});
