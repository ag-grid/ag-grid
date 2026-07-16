import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

const COUNTRY_COL = 'ag-Grid-AutoColumn-country';

test.agExample(import.meta, () => {
    test.eachFramework('Group cell renderer checkbox selection', async ({ agIdFor, page }) => {
        // checkboxLocation: 'autoGroupColumn' + selectAll: 'all' renders a select-all header
        // checkbox in the (country) group column header.
        await expect(agIdFor.headerCell(COUNTRY_COL).locator('.ag-checkbox-input-wrapper')).toBeVisible();

        const australia = 'row-group-country-Australia';

        // Checkbox is rendered inside the group cell, not a separate selection column.
        const checkbox = agIdFor.checkbox(australia, COUNTRY_COL);
        await expect(checkbox).toBeVisible();

        // Selecting the group row selects it.
        await checkbox.click();
        await expect(agIdFor.rowNode(australia)).toHaveClass(/ag-row-selected/);

        // groupSelects: 'descendants' selects all children; expanding reveals selected descendants.
        await agIdFor.groupContracted(australia, COUNTRY_COL).click();
        await waitForRowAnimations(page);
        await expect(page.locator('.ag-row-selected').nth(1)).toBeVisible();
    });
});
