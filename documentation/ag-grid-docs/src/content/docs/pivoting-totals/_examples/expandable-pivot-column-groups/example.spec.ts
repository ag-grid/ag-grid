import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Collapsed pivot column groups show the group total, expanding reveals the per-year breakdown',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const row = 'row-group-country-United States';
            const athletics = agIdFor.headerGroupCell('pivotGroup_sport-year_Athletics_0');

            // Collapsed: the Athletics group shows a single total column for the aggregation (gold),
            // holding the sport's total across all years. US Athletics gold total = 69.
            await expect(athletics).toBeVisible();
            await expect(athletics.locator('.ag-header-expand-icon-collapsed')).toBeVisible();
            await expect(agIdFor.cell(row, 'pivot_sport-year_Athletics_gold').first()).toContainText('69');

            // Expand the group: the total column is hidden and the per-year breakdown columns appear.
            await athletics.locator('.ag-header-expand-icon-collapsed').click();

            const year2000 = agIdFor.cell(row, 'pivot_sport-year_Athletics-2000_gold');
            await expect(year2000.first()).toBeVisible();

            // The group total column is no longer rendered while expanded.
            await expect(page.locator('.ag-header-cell[col-id="pivot_sport-year_Athletics_gold"]')).toHaveCount(0);

            // Per-year gold values sum to the previously shown total (16 + 18 + 16 + 19 = 69).
            await expect(agIdFor.cell(row, 'pivot_sport-year_Athletics-2000_gold').first()).toContainText('16');
            await expect(agIdFor.cell(row, 'pivot_sport-year_Athletics-2004_gold').first()).toContainText('18');
            await expect(agIdFor.cell(row, 'pivot_sport-year_Athletics-2008_gold').first()).toContainText('16');
            await expect(agIdFor.cell(row, 'pivot_sport-year_Athletics-2012_gold').first()).toContainText('19');
        }
    );
});
