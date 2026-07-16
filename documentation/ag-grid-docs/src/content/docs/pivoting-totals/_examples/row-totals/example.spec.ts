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

        // Verify the total columns render visually *before* (to the LEFT of) the year pivot columns.
        // Header cells are absolutely positioned, so compare their `left` offsets rather than DOM order.
        const positions = await page.evaluate(() => {
            const totalGoldEl = document.querySelector('.ag-header-cell[col-id="PivotRowTotal_pivot_year__gold"]');
            const yearLefts = Array.from(document.querySelectorAll('.ag-header-cell[col-id^="pivot_year_"]')).map(
                (e) => e.getBoundingClientRect().left
            );
            return {
                totalGold: totalGoldEl ? totalGoldEl.getBoundingClientRect().left : null,
                firstYear: yearLefts.length ? Math.min(...yearLefts) : null,
            };
        });
        expect(positions.totalGold).not.toBeNull();
        expect(positions.firstYear).not.toBeNull();
        expect(positions.totalGold!).toBeLessThan(positions.firstYear!);
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
