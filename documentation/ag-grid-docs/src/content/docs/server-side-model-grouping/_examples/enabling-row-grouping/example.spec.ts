import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Rows are grouped by Country, and expanding a country loads its rows', async ({ page }) => {
        await waitForGridContent(page);

        const usa = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: 'United States' }) })
            .first();
        await expect(usa).toBeVisible();

        await usa.locator('.ag-group-contracted').first().click();
        const leaf = page.locator('.ag-row-level-1').filter({ hasText: 'Michael Phelps' }).first();
        await expect(leaf.locator('[col-id="sport"]')).toHaveText('Swimming');
    });
});
