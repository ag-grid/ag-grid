import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

const COUNTRY_COL = 'ag-Grid-AutoColumn-country';
const YEAR_COL = 'ag-Grid-AutoColumn-year';

test.agExample(import.meta, () => {
    test.eachFramework('Group column inherits the grouped column filter', async ({ agIdFor, page }) => {
        // One auto group column per grouped field.
        await expect(agIdFor.headerCell(COUNTRY_COL)).toBeVisible();
        await expect(agIdFor.headerCell(YEAR_COL)).toBeVisible();

        // filter: 'agGroupColumnFilter' + floatingFilter: true renders an editable floating
        // filter under the country group column (the grouped column itself is hidden).
        const countryFloatingFilter = agIdFor.floatingFilter(COUNTRY_COL);
        await expect(countryFloatingFilter).toBeVisible();

        // groupDefaultExpanded: 1 keeps top-level country groups visible; United States is first.
        await expect(agIdFor.rowNode('row-group-country-United States')).toBeVisible();

        // Filtering the group column filters by the inherited (country) column value.
        await countryFloatingFilter.locator('input').first().fill('Australia');
        await waitForRowAnimations(page);

        await expect(agIdFor.rowNode('row-group-country-Australia')).toBeVisible();
        await expect(agIdFor.rowNode('row-group-country-United States')).not.toBeVisible();
    });
});
