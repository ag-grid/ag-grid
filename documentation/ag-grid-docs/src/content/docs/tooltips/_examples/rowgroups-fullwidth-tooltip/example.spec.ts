import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Full-width group rows inherit the grouped column tooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // With groupDisplayType='groupRows', the full-width group row shows a tooltip
        // inherited from the country colDef ('Country: <value>').
        const firstGroupRow = page.locator('.ag-row-group').first();
        await firstGroupRow.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country:');
    });
});
