import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('unbalanced rows with an empty group key appear at the top level', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Rows with a real country still form normal groups.
        await expect(groupRow('United States')).toBeVisible();
        await expect(groupRow('Australia')).toBeVisible();

        // groupAllowUnbalanced: true means rows whose country key is empty ('') are not wrapped in a
        // group. They render at the top level as plain leaf rows, keyed with the grid's "missing key"
        // id, showing their (non-grouped) sport value.
        const unbalancedLeafRow = page.locator('.ag-row[row-id^="ag-Grid-MissingKey"]');
        await expect(unbalancedLeafRow.first()).toBeVisible();
        await expect(unbalancedLeafRow.first()).not.toHaveClass(/ag-row-group/);
        await expect(unbalancedLeafRow.filter({ hasText: 'Gymnastics' }).first()).toBeVisible();
    });
});
