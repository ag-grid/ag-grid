import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Group tree list formats the country with a code suffix', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // groupTreeListFormatter appends the two-letter code, e.g. 'United States (UN)'.
        await agIdFor.floatingFilterButton(GROUP_COL).click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        // Countries at the top of the alphabetical list carry the formatted code suffix.
        await expect(items.filter({ hasText: 'Afghanistan (AF)' })).toHaveCount(1);

        // The mini filter narrows the (virtual-scrolled) tree to a matching country.
        await setFilter.locator('input').first().fill('United States');
        await expect(items.filter({ hasText: 'United States (UN)' })).toHaveCount(1);
        await expect(items.filter({ hasText: 'Afghanistan (AF)' })).toHaveCount(0);
    });

    test.eachFramework('Date tree list formats months as names and blanks', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // treeListFormatter renders month numbers (level 1) as month names and null dates as '(Blanks)'.
        await agIdFor.floatingFilterButton('date').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        // The empty data row contributes a missing date.
        await expect(items.filter({ hasText: '(Blanks)' })).toHaveCount(1);

        const y2008 = items.filter({ hasText: '2008' });
        await expect(y2008).toHaveCount(1);
        await y2008.locator('.ag-set-filter-group-closed-icon').click();

        const monthNames = /January|February|March|April|May|June|July|August|September|October|November|December/;
        await expect(items.filter({ hasText: monthNames }).first()).toBeVisible();
    });
});
