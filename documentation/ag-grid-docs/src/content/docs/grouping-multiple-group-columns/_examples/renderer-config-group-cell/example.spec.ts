import { expect, test } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn-total';

test.agExample(import.meta, () => {
    test.eachFramework('Group cell renderer configuration', async ({ agIdFor, page }) => {
        // autoGroupColumnDef.headerName overrides the group column header.
        await expect(agIdFor.headerCell(GROUP_COL)).toContainText('Gold Medals');

        const firstGroupCell = page.locator('.ag-row').first().locator('[col-id="ag-Grid-AutoColumn-total"]');

        // checkboxLocation: 'autoGroupColumn' renders the selection checkbox inside the group cell.
        const checkbox = firstGroupCell.locator('.ag-selection-checkbox');
        await expect(checkbox).toBeVisible();

        // The group cell inherits the grouped column's renderer (CustomMedalCellRenderer -> star icons).
        await expect(firstGroupCell.locator('img.medalIcon').first()).toBeVisible();

        // Clicking the checkbox selects the group row (rowSelection mode 'singleRow').
        await checkbox.click();
        await expect(page.locator('.ag-row').first()).toHaveClass(/ag-row-selected/);
    });
});
