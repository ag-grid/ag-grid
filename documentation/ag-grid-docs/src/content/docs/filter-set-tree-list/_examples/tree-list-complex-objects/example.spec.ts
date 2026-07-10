import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Tree list shows complex object display values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // treeListFormatter resolves each path key to its display value via pathLookup.
        await agIdFor.floatingFilterButton(GROUP_COL).click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        const items = setFilter.locator('.ag-set-filter-item');
        const erica = items.filter({ hasText: 'Erica Rogers' });
        await expect(erica).toHaveCount(1);

        // Direct reports are hidden until the root is expanded.
        const malcolm = items.filter({ hasText: 'Malcolm Barrett' });
        await expect(malcolm).toHaveCount(0);
        await erica.locator('.ag-set-filter-group-closed-icon').click();
        await expect(malcolm).toHaveCount(1);
        await expect(items.filter({ hasText: 'Luke McBride' })).toHaveCount(1);
    });
});
