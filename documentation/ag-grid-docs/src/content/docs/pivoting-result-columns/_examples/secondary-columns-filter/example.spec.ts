import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// year is the pivot field; gold/silver/bronze value columns declare filter: 'agNumberColumnFilter'
// and floatingFilter: true, so every generated pivot result column (pivot_year_<year>_<field>)
// is filterable via a floating Number Filter. As the pivot values are aggregates, filtering
// matches against the underlying leaf rows and does not re-aggregate the parent groups.
const groupRows = (page: import('@playwright/test').Page) => page.locator('.ag-row[row-id^="row-group-country-"]');

test.agExample(import.meta, () => {
    test.eachFramework('Pivot result columns can be filtered with a number floating filter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Per the docs note, filter: 'agNumberColumnFilter' on the value column yields a Number Filter
        // (backed by ag-number-field) with a floating filter on each generated pivot result column.
        const floatingFilter = page.locator('.ag-floating-filter[col-id="pivot_year_2000_gold"]').first();
        await expect(floatingFilter.locator('.ag-number-field')).toBeVisible();
        const floatingInput = floatingFilter.locator('input').first();
        await expect(floatingInput).toBeVisible();

        const initialCount = await groupRows(page).count();
        expect(initialCount).toBeGreaterThan(1);

        // Filtering the pivot result column filters the underlying leaf rows (not the displayed
        // aggregate). No individual leaf has a 2000 gold value of 7, so every group is filtered out.
        await floatingInput.fill('7');
        await floatingInput.press('Enter');
        await expect(groupRows(page)).toHaveCount(0);

        // Clearing the filter restores every group.
        await floatingInput.fill('');
        await floatingInput.press('Enter');
        await expect(groupRows(page)).toHaveCount(initialCount);
    });
});
