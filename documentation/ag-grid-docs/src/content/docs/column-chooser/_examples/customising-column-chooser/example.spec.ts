import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Name column chooser hides the select/filter widgets', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // launch the column chooser from the Name column menu
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        // the column chooser lists the grid columns
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toBeVisible();

        // suppressColumnSelectAll / suppressColumnFilter / suppressColumnExpandAll
        // hide the header widget panel
        await expect(page.locator('.ag-column-select-header')).toHaveClass(/ag-hidden/);
    });
});
