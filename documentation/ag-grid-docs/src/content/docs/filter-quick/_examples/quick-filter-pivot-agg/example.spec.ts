import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('applyQuickFilterBeforePivotOrAgg toggles whether non-pivot columns match', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const rows = page.locator('.ag-row[row-id]');
        const initial = await rows.count();
        expect(initial).toBeGreaterThan(0);

        const input = page.locator('.ag-toolbar-input input').first();

        // Default: filter applied AFTER pivot/agg, so 'Swimming' (a non-pivot column) matches nothing.
        // The input is debounced; the retrying toHaveCount polls until the filtered state settles.
        await input.fill('Swimming');
        await expect(rows).toHaveCount(0);

        // Apply the filter BEFORE pivot/agg so the Sport column is considered.
        await page.locator('#applyBeforePivotOrAgg').click();
        await expect(async () => {
            expect(await rows.count()).toBeGreaterThan(0);
        }).toPass();
    });
});
