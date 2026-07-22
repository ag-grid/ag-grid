import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Group cells inherit the tooltip from the grouped column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The first group row (Country) shows a tooltip inherited from the country colDef.
        const firstGroupCell = page.locator('.ag-row .ag-cell[col-id="ag-Grid-AutoColumn"]').first();
        await firstGroupCell.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country:');
    });
});
