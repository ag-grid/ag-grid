import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('toolPanelClass styling and location-aware header value getter', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // toolPanelClass is applied to the tool panel column entry for gold/silver/bronze
        // (set as string, array of strings, and function respectively).
        await expect(toolPanel.locator('.ag-column-select-column.tp-gold')).toHaveCount(1);
        await expect(toolPanel.locator('.ag-column-select-column.tp-silver')).toHaveCount(1);
        await expect(toolPanel.locator('.ag-column-select-column.tp-bronze')).toHaveCount(1);

        // headerValueGetter returns a different name per location:
        // 'columnToolPanel' -> 'TP Country' in the tool panel.
        await expect(toolPanel.locator('.ag-column-select-column-label', { hasText: 'TP Country' })).toBeVisible();

        // 'header' -> 'H Country' in the grid header.
        await expect(agIdFor.headerCell('country')).toContainText('H Country');
    });
});
