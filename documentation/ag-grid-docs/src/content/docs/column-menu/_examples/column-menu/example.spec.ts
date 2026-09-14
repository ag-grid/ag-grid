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

    test.eachFramework('right-clicking a column header opens that column menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();
        // Pin Column is column specific - it is absent from the empty-header-space menu
        await expect(agIdFor.menuOption('Pin Column')).toBeVisible();
        await expect(agIdFor.menuOption('Choose Columns')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('applying the age column filter filters the rows', async ({ agIdFor, agFramework, page }) => {
        // The generated vanilla variant drops the example's ModuleRegistry.registerModules() call and
        // loads the whole ag-grid-enterprise UMD bundle instead, so `filter: true` resolves to the
        // enterprise Set Filter rather than the NumberFilterModule the example registers. There is no
        // number input to type into in that variant.
        test.skip(agFramework === 'vanilla', 'vanilla loads the full enterprise bundle, so age gets a Set Filter.');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerFilterButton('age').click();

        const ageInput = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(ageInput).toBeVisible();
        await ageInput.fill('20');
        await ageInput.dispatchEvent('input');

        await expect(agIdFor.headerCell('age')).toHaveClass(/ag-header-cell-filtered/);
        // row 0 is Michael Phelps, aged 23, so the equals-20 filter removes it
        await expect(agIdFor.rowNode('0')).toHaveCount(0);
        await expect(page.locator('.ag-row[row-id]').first().locator('[col-id="age"]')).toContainText('20');
    });

    test.eachFramework(
        'typing in the country floating filter filters the rows',
        async ({ agIdFor, agFramework, page }) => {
            // Same vanilla divergence as above: with the full enterprise bundle `filter: true` gives country
            // a Set Filter, whose floating filter is a read-only summary input that cannot be typed into.
            test.skip(
                agFramework === 'vanilla',
                'vanilla loads the full enterprise bundle, so country gets a Set Filter.'
            );
            await expect(agIdFor.cell('0', 'country')).toContainText('United States');

            const countryInput = agIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' });
            await countryInput.fill('Australia');
            await countryInput.dispatchEvent('input');

            await expect(agIdFor.headerCell('country')).toHaveClass(/ag-header-cell-filtered/);
            // row 0 is a United States row, so it is filtered out
            await expect(agIdFor.rowNode('0')).toHaveCount(0);
            await expect(page.locator('.ag-row[row-id]').first().locator('[col-id="country"]')).toContainText(
                'Australia'
            );
        }
    );
});
