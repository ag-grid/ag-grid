import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by 'total' (with a CustomMedalCellRenderer on that column). The group cell
    // renderer is configured via autoGroupColumnDef.cellRendererParams:
    //   - headerName 'Gold Medals'
    //   - suppressCount: true (no child-count badge)
    //   - rowSelection singleRow + checkboxLocation 'autoGroupColumn' (checkbox in group cell)
    test.eachFramework('group cell renderer configuration is applied', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Custom header name from autoGroupColumnDef.
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toContainText('Gold Medals');

        const firstGroupCell = page.locator('[row-id^="row-group-total-"] [col-id="ag-Grid-AutoColumn"]').first();
        await expect(firstGroupCell).toBeVisible();

        // suppressCount: true => the child-count badge stays empty (no "(n)" text).
        await expect(firstGroupCell.locator('.ag-group-child-count')).toHaveText('');

        // checkboxLocation 'autoGroupColumn' => selection checkbox rendered inside the group cell.
        await expect(firstGroupCell.locator('.ag-selection-checkbox')).toBeVisible();

        // The grouped 'total' column's CustomMedalCellRenderer is embedded as the inner renderer,
        // drawing one gold-star image per medal.
        await expect(firstGroupCell.locator('img.medalIcon').first()).toBeVisible();
    });

    test.eachFramework('single-row selection via the group cell checkbox', async ({ page }) => {
        await waitForGridContent(page);

        const groupRows = page.locator('[row-id^="row-group-total-"]');
        await groupRows.nth(0).locator('.ag-selection-checkbox').click();
        await expect(groupRows.nth(0)).toHaveClass(/ag-row-selected/);

        // mode 'singleRow' => selecting a second group deselects the first.
        await groupRows.nth(1).locator('.ag-selection-checkbox').click();
        await expect(groupRows.nth(1)).toHaveClass(/ag-row-selected/);
        await expect(page.locator('.ag-row.ag-row-selected')).toHaveCount(1);
    });
});
