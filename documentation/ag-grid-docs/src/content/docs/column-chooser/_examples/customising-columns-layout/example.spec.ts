import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Name column chooser uses the custom column layout', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // launch the column chooser from the Name column menu
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        // the custom layout renames the Athlete group to "Group 1"
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Group 1' })).toBeVisible();
        // and only includes sport, athlete and age (medals are omitted)
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Sport' })).toBeVisible();
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toHaveCount(0);
    });
});
