import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Gold tree list groups values via treeListPathGetter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // treeListPathGetter buckets each gold value into '>2' or '<=2'.
        await agIdFor.floatingFilterButton('gold').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        const gt2 = items.filter({ hasText: '>2' });
        const lte2 = items.filter({ hasText: '<=2' });
        await expect(gt2).toHaveCount(1);
        await expect(lte2).toHaveCount(1);

        // Leaf values are hidden until their group is expanded (gold 0 sits under '<=2').
        const zero = items.filter({ hasText: '0' });
        await expect(zero).toHaveCount(0);
        await lte2.locator('.ag-set-filter-group-closed-icon').click();
        await expect(zero).toHaveCount(1);
    });

    test.eachFramework('Date tree list groups by year and the mini filter narrows it', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Date column builds a year -> month -> day tree; years 2000..2012 are present.
        await agIdFor.floatingFilterButton('date').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        const y2000 = items.filter({ hasText: '2000' });
        await expect(y2000).toHaveCount(1);

        // The mini filter keeps only branches matching the search term.
        await setFilter.locator('input').first().fill('2012');
        await expect(items.filter({ hasText: '2012' })).toHaveCount(1);
        await expect(y2000).toHaveCount(0);
    });
});
