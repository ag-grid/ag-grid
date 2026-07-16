import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns Tool Panel layout mirrors the grid column definitions', async ({ page }) => {
        await waitForGridContent(page);

        // The Columns Tool Panel is present with the grid's column groups shown.
        const columnSelect = page.locator('.ag-column-select');
        await expect(columnSelect).toBeVisible();
        await expect(columnSelect.locator('.ag-column-select-column-group', { hasText: 'Athlete' })).toBeVisible();
        await expect(columnSelect.locator('.ag-column-select-column-group', { hasText: 'Competition' })).toBeVisible();
        await expect(columnSelect.locator('.ag-column-select-column-group', { hasText: 'Medals' })).toBeVisible();

        // The column order in the tool panel mirrors the order supplied to gridOptions.columnDefs,
        // including the column-group headers.
        await expect(columnSelect.locator('.ag-column-select-column-label')).toHaveText([
            'Athlete',
            'Name',
            'Age',
            'Country',
            'Competition',
            'Year',
            'Date',
            'Sport',
            'Medals',
            'Gold',
            'Silver',
            'Bronze',
            'Total',
        ]);
    });
});
