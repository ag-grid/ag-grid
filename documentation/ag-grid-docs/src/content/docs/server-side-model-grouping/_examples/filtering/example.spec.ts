import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('applying a filter refreshes and narrows the visible groups', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Grouped by Country then Sport. Both United States and Russia groups are present.
        await expect(groupRow('United States')).toBeVisible();
        await expect(groupRow('Russia')).toBeVisible();

        // Filter the leaf-level 'gold' column via its floating filter to gold == 8
        // (only achieved by a United States athlete). serverSideOnlyRefreshFilteredGroups
        // refreshes the groups so only matching countries remain.
        const goldFloatingFilter = page.locator(
            '.ag-header-cell[col-id="gold"] .ag-floating-filter-input input[type="number"]'
        );
        await goldFloatingFilter.fill('8');
        await goldFloatingFilter.press('Enter');

        await expect(groupRow('United States')).toBeVisible();
        await expect(groupRow('Russia')).toBeHidden();
    });
});
