import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

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

    test.eachFramework(
        'headerValueGetter uses the columnDrop location for the Row Groups pill',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // rowGroupPanelShow: 'always' means the Row Groups drop zone above the grid is always shown,
            // and starts empty.
            const rowGroupPanel = agIdFor.columnDropArea('panel', 'Row Groups');
            await expect(rowGroupPanel.locator('.ag-column-drop-cell')).toHaveCount(0);

            // Group by country via the tool panel context menu (country has enableRowGroup). The menu
            // item uses the 'columnToolPanel' name, 'TP Country'.
            await page.locator('.ag-column-select-column', { hasText: 'TP Country' }).click({ button: 'right' });
            await agIdFor.menuOption('Group by TP Country').click();
            await waitForRowAnimations(page);

            // The pill in the drop zone resolves its name with location 'columnDrop' -> 'CD Country'.
            await expect(rowGroupPanel.locator('.ag-column-drop-cell')).toHaveCount(1);
            await expect(rowGroupPanel.locator('.ag-column-drop-cell-text')).toHaveText('CD Country');
        }
    );
});
