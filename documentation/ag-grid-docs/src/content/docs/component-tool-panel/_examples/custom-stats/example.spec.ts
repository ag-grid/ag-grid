import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom Stats tool panel shows computed medal totals', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The custom tool panel is the default open panel and sums every row of
        // olympic-winners.json via forEachNode: gold 3143, silver 3131, bronze 3255.
        const toolPanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(toolPanel).toContainText('Custom Stats');
        await expect(toolPanel).toContainText('Total Medals: 9529');
        await expect(toolPanel).toContainText('Total Gold: 3143');
        await expect(toolPanel).toContainText('Total Silver: 3131');
        await expect(toolPanel).toContainText('Total Bronze: 3255');
    });

    test.eachFramework('Side bar switches between the registered tool panels', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const visiblePanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');

        // Custom Stats panel is open by default.
        await expect(visiblePanel).toContainText('Total Medals: 9529');

        // Switch to the Columns tool panel via its side bar button.
        await page.locator('.ag-side-button').filter({ hasText: 'Columns' }).click();
        await expect(visiblePanel).toContainText('Athlete');
        await expect(visiblePanel).not.toContainText('Total Medals');

        // Switch back to the Custom Stats panel.
        await page.locator('.ag-side-button').filter({ hasText: 'Custom Stats' }).click();
        await expect(visiblePanel).toContainText('Total Medals: 9529');
    });

    test.eachFramework('Editing a medal cell refreshes the panel totals', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(toolPanel).toContainText('Total Gold: 3143');

        // Every column is editable via defaultColDef. Michael Phelps (row 0) has 8 golds;
        // dropping that to 1 removes 7 from the gold and overall totals. onCellValueChanged
        // calls refreshClientSideRowModel, which fires modelUpdated and re-renders the panel.
        const goldCell = agIdFor.cell('0', 'gold');
        await goldCell.dblclick();
        const cellEditor = goldCell.locator('input');
        await expect(cellEditor).toBeVisible();
        await cellEditor.fill('1');
        await page.keyboard.press('Enter');
        await expect(cellEditor).toHaveCount(0);
        await expect(goldCell).toContainText('1');

        await expect(toolPanel).toContainText('Total Gold: 3136');
        await expect(toolPanel).toContainText('Total Medals: 9522');

        // The untouched medal totals are unchanged.
        await expect(toolPanel).toContainText('Total Silver: 3131');
        await expect(toolPanel).toContainText('Total Bronze: 3255');
    });

    test.eachFramework('Filters side bar tab opens the filters tool panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const visiblePanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(visiblePanel).toContainText('Total Medals: 9529');

        // The third registered tool panel is agFiltersToolPanel.
        await page.locator('.ag-side-button').filter({ hasText: 'Filters' }).click();
        await expect(visiblePanel.locator('.ag-filter-toolpanel, .ag-filter-panel').first()).toBeVisible();
        await expect(visiblePanel).not.toContainText('Total Medals');

        // The athlete column is filterable (agTextColumnFilter), so it is listed.
        await expect(visiblePanel).toContainText('Athlete');
    });
});
