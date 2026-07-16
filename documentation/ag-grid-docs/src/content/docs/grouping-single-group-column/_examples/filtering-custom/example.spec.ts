import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Custom group column filter', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Top-level (country) group rows
        const countryGroupRows = page.locator(`.ag-row-level-0 .ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"]`);
        const floatingFilterInput = page.locator(
            `.ag-header-cell[col-id="${GROUP_AUTO_COLUMN_ID}"] .ag-floating-filter-input input`
        );

        // Floating filter is enabled on the single group column
        await expect(floatingFilterInput).toBeVisible();

        // Baseline: several country groups are rendered
        const initialCountryGroups = await countryGroupRows.count();
        expect(initialCountryGroups).toBeGreaterThan(1);

        // The filterValueGetter returns the node's ancestor route (getRoute), so a text search
        // matches any group value in the hierarchy. Searching a specific country leaves only
        // that country's top-level group.
        await floatingFilterInput.fill('United States');
        await expect(agIdFor.rowNode('row-group-country-United States')).toBeVisible();
        await expect(countryGroupRows).toHaveCount(1);
        await expect(countryGroupRows.first()).toContainText('United States');

        // Clearing the filter restores the country groups
        await floatingFilterInput.fill('');
        await expect(countryGroupRows).toHaveCount(initialCountryGroups);
    });
});
