import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by 'total'. autoGroupColumnDef.cellRendererParams provides a custom innerRenderer
    // (CustomMedalCellRenderer) which draws one gold-star image per medal, plus suppressCount: true
    // and headerName 'Gold Medals'. The agGroupCellRenderer keeps the chevron/expander and embeds
    // the custom inner renderer for the value.
    test.eachFramework('custom inner renderer is embedded in the group cell', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Custom header name from autoGroupColumnDef.
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toContainText('Gold Medals');

        const firstGroupCell = page.locator('[row-id^="row-group-total-"] [col-id="ag-Grid-AutoColumn"]').first();
        await expect(firstGroupCell).toBeVisible();

        // The group cell retains the agGroupCellRenderer expander (cell is expandable).
        await expect(firstGroupCell.locator('.ag-cell-expandable')).toBeVisible();

        // The custom inner renderer draws gold-star images inside the group cell.
        await expect(firstGroupCell.locator('img.medalIcon').first()).toBeVisible();

        // suppressCount: true => the child-count badge stays empty.
        await expect(firstGroupCell.locator('.ag-group-child-count')).toHaveText('');
    });
});
