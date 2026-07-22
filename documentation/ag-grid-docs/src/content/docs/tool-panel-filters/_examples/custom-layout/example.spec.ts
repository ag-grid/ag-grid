import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const groupTitles = page.locator('.ag-filter-toolpanel .ag-filter-toolpanel-group-title');

        // Initial layout matches gridOptions.columnDefs.
        await expect(groupTitles).toHaveText(['Athlete', 'Competition', 'Sport', 'Medals']);
        await expect(agIdFor.filterToolPanelGroup('Dummy Group 1')).toHaveCount(0);

        // Custom Group Layout introduces groups that do not exist in the grid.
        await page.getByRole('button', { name: 'Custom Group Layout' }).click();
        await expect(groupTitles).toHaveText(['Dummy Group 1', 'Dummy Group 2', 'Medals', 'Dummy Group 3']);
        await expect(agIdFor.filterToolPanelGroup('Athlete')).toHaveCount(0);
        await expect(agIdFor.filterToolPanelGroup('Competition')).toHaveCount(0);

        // Custom Sort Layout restores the grid groups in a custom order.
        await page.getByRole('button', { name: 'Custom Sort Layout' }).click();
        await expect(groupTitles).toHaveText(['Athlete', 'Competition', 'Medals', 'Sport']);
        await expect(agIdFor.filterToolPanelGroup('Dummy Group 1')).toHaveCount(0);
    });
});
