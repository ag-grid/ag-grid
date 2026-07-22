import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom spanRows callback excludes Algeria from spanning', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is sorted country asc. Afghanistan (2 rows) then Algeria (8 rows) sit at the top.
        const countrySpans = page.locator('.ag-spanned-cell[col-id="country"]');
        await expect(countrySpans.first()).toBeVisible();

        // Countries other than Algeria still span normally: Afghanistan spans its 2 rows.
        const afghanistan = countrySpans.filter({ hasText: 'Afghanistan' });
        await expect(afghanistan).toHaveCount(1);
        await expect(afghanistan).toHaveAttribute('aria-rowspan', '2');

        // The custom callback returns false for Algeria, so it is NEVER merged into a spanned cell.
        await expect(countrySpans.filter({ hasText: 'Algeria' })).toHaveCount(0);

        // Instead, each Algeria leaf row renders its own normal country cell.
        const normalAlgeria = page
            .locator('.ag-cell[col-id="country"]:not(.ag-spanned-cell)')
            .filter({ hasText: 'Algeria' });
        await expect(normalAlgeria.first()).toBeVisible();
        // Several Algeria rows are within the initial viewport (8 rows total).
        expect(await normalAlgeria.count()).toBeGreaterThan(1);

        // year and sport columns are unaffected and continue to span.
        await expect(page.locator('.ag-spanned-cell[col-id="year"]').first()).toBeVisible();
        await expect(page.locator('.ag-spanned-cell[col-id="sport"]').first()).toBeVisible();
    });
});
