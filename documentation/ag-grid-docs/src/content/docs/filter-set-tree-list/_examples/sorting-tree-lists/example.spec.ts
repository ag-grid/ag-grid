import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Employee tree list is sorted in reverse alphabetical order', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Employee column has a comparator that reverses the tree order.
        await agIdFor.floatingFilterButton(GROUP_COL).click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        const root = items.filter({ hasText: 'Kathryn Powers' });
        await expect(root).toHaveCount(1);

        // Children are hidden until the root is expanded.
        await expect(items.filter({ hasText: 'Willie Beck' })).toHaveCount(0);
        await root.locator('.ag-set-filter-group-closed-icon').click();
        await expect(items.filter({ hasText: 'Willie Beck' })).toHaveCount(1);

        // Reverse alphabetical: 'Willie Beck' (W) sorts above 'Sarah Mason' (S).
        const texts = await items.allInnerTexts();
        const iWillie = texts.findIndex((t) => t.includes('Willie Beck'));
        const iSarah = texts.findIndex((t) => t.includes('Sarah Mason'));
        expect(iWillie).toBeGreaterThan(-1);
        expect(iSarah).toBeGreaterThan(-1);
        expect(iWillie).toBeLessThan(iSarah);
    });
});
