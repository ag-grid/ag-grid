import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by country. rowSelection: mode 'multiRow', groupSelects 'descendants',
    // selectAll 'all', checkboxLocation 'autoGroupColumn' => checkboxes render in the group
    // cell renderer (not a separate checkbox column), and selecting a group selects its children.
    test.eachFramework('checkboxes render in the auto group column', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // No dedicated checkbox column - checkboxes live in the group column instead.
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();

        // Group cells carry a selection checkbox.
        const usGroup = agIdFor.autoGroupCell('row-group-country-United States');
        await expect(usGroup.locator('.ag-selection-checkbox')).toBeVisible();

        // Select-all header checkbox is present in the group column header (selectAll: 'all').
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn').locator('.ag-header-select-all')).toBeVisible();
    });

    test.eachFramework('selecting a group selects its descendants', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const usRow = agIdFor.rowNode('row-group-country-United States').first();
        await usRow.locator('.ag-selection-checkbox').click();

        // Group row becomes selected and its checkbox reflects the checked state.
        await expect(usRow).toHaveClass(/ag-row-selected/);
        await expect(usRow.locator('.ag-checkbox-input-wrapper').first()).toHaveClass(/ag-checked/);

        // Expand the group; a descendant leaf row (data row 0 = a United States athlete)
        // is also selected because groupSelects: 'descendants'.
        await agIdFor.autoGroupContracted('row-group-country-United States').first().click();
        await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-selected/);
    });
});
