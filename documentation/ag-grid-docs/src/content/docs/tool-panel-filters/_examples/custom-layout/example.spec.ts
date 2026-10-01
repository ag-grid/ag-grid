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

    test.eachFramework('Custom layouts set the column order within each group', async ({ page }) => {
        await ensureGridReady(page);

        const filterNames = page.locator('.ag-filter-toolpanel-instance-header .ag-header-cell-text');

        // Initial layout follows gridOptions.columnDefs.
        await expect(filterNames).toHaveText([
            'Name',
            'Age',
            'Country',
            'Year',
            'Date',
            'Sport',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);

        // Custom Sort Layout orders each group's children ascending, with Sport last.
        await page.getByRole('button', { name: 'Custom Sort Layout' }).click();
        await expect(filterNames).toHaveText([
            'Age',
            'Country',
            'Name',
            'Date',
            'Year',
            'Bronze',
            'Gold',
            'Silver',
            'Total',
            'Sport',
        ]);

        // Custom Group Layout nests filters in dummy groups and omits Year and Date.
        await page.getByRole('button', { name: 'Custom Group Layout' }).click();
        await expect(filterNames).toHaveText(['Age', 'Name', 'Sport', 'Country', 'Total', 'Bronze', 'Silver', 'Gold']);
    });
});
