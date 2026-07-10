import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the data and per-column header buttons', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        // country has a floating filter enabled
        await expect(agIdFor.floatingFilter('country')).toBeVisible();
        // age has filtering enabled so shows a header filter button on hover
        await agIdFor.headerCell('age').hover();
        await expect(agIdFor.headerFilterButton('age')).toBeVisible();
        // athlete has no filtering enabled so has no header filter button
        await agIdFor.headerCell('athlete').hover();
        await expect(agIdFor.headerFilterButton('athlete')).toHaveCount(0);
    });

    test.eachFramework('opens the column menu from the header button', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();
        // the main menu includes the column chooser item by default
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});
