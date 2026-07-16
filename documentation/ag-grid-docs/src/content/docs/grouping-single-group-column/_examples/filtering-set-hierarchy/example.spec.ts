import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Hierarchical set filter', async ({ page }) => {
        await waitForGridContent(page);

        // onGridReady calls showColumnFilter('ag-Grid-AutoColumn'), so the set column filter for
        // the single group column is displayed on load.
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // treeList: true renders the filter list as a hierarchical tree list
        const treeList = page.locator('.ag-set-filter-list.ag-set-filter-tree-list');
        await expect(treeList).toBeVisible();

        // The tree list is populated with set filter items
        const filterItems = treeList.locator('.ag-set-filter-item');
        expect(await filterItems.count()).toBeGreaterThan(0);

        // The set filter provides a mini filter search
        const miniFilter = page.locator('.ag-mini-filter input');
        await expect(miniFilter).toBeVisible();
    });
});
