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

    test.eachFramework('opens the column menu from the empty header space', async ({ agIdFor, page }) => {
        // the row data arrives asynchronously and adds a vertical scrollbar, which narrows the header row
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        const headerRow = page.locator('.ag-header-row').first();
        const rowBox = (await headerRow.boundingBox())!;
        const lastHeaderBox = (await agIdFor.headerCell('country').boundingBox())!;
        const lastHeaderRight = lastHeaderBox.x - rowBox.x + lastHeaderBox.width;
        expect(lastHeaderRight).toBeLessThan(rowBox.width - 20);

        await headerRow.click({
            button: 'right',
            position: { x: (lastHeaderRight + rowBox.width) / 2, y: rowBox.height / 2 },
        });

        // Reset Columns is the discriminator - a column's own menu also carries Choose Columns
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Reset Columns' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-menu')).toHaveCount(0);
    });
});
