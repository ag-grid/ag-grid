import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Group column headers inherit headerTooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // With groupDisplayType='multipleColumns', the generated Country group column header
        // inherits headerTooltip 'Group by Country' from the country colDef.
        const countryGroupHeader = page.locator('.ag-header-cell[col-id*="country"]').first();
        await countryGroupHeader.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Group by Country');
    });
});
