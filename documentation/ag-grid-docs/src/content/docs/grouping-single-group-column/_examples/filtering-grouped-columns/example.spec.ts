import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by country then year (both hidden). autoGroupColumnDef uses filter
    // 'agGroupColumnFilter' + floatingFilter: true, so the single group column exposes the
    // filters of the underlying grouped columns. onGridReady opens the column filter.
    test.eachFramework('group column filter exposes the grouped columns', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Only the single generated group column is shown; grouped source columns are hidden.
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();
        await expect(agIdFor.headerCell('country')).toHaveCount(0);
        await expect(agIdFor.headerCell('year')).toHaveCount(0);

        // The group column renders a floating filter (agGroupColumnFilter).
        await expect(page.locator('.ag-group-floating-filter').first()).toBeVisible();

        // onGridReady opened the filter menu: it is an agGroupColumnFilter with a field picker
        // defaulting to Country and offering both grouped columns (Country, Year).
        const fieldPicker = page.locator('.ag-group-filter-field-select-wrapper');
        await expect(fieldPicker.locator('.ag-picker-field-display')).toContainText('Country');

        await fieldPicker.locator('.ag-picker-field-wrapper').click();
        const options = page.locator('.ag-select-list .ag-list-item');
        await expect(options.filter({ hasText: 'Country' })).toBeVisible();
        await expect(options.filter({ hasText: 'Year' })).toBeVisible();
    });

    test.eachFramework('applying the group column filter narrows the visible rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Top-level country groups are present before filtering.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toBeVisible();
        await expect(agIdFor.autoGroupCell('row-group-country-Russia')).toBeVisible();

        // Deselect all values in the underlying Country set filter; the group column filter
        // drives leaf filtering, so all groups are removed.
        await page
            .locator('.ag-set-filter-list .ag-set-filter-item')
            .filter({ hasText: '(Select All)' })
            .first()
            .click();

        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toBeHidden();
        await expect(agIdFor.autoGroupCell('row-group-country-Russia')).toBeHidden();
    });
});
