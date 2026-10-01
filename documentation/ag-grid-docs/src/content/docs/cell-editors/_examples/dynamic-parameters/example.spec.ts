import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0: { name: 'Bob Harrison', gender: 'Male', country: 'Ireland', city: 'Dublin' }
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'name')).toContainText('Bob Harrison');
        await expect(agIdFor.cell('0', 'gender')).toContainText('Male');
        await expect(agIdFor.cell('0', 'country')).toContainText('Ireland');
        await expect(agIdFor.cell('0', 'city')).toContainText('Dublin');
    });

    test.eachFramework('changing the country to a mismatch clears the city', async ({ agIdFor, page }) => {
        const countryCell = agIdFor.cell('0', 'country');
        const cityCell = agIdFor.cell('0', 'city');
        await expect(cityCell).toContainText('Dublin');

        await countryCell.dblclick();
        // Rich Select editor lists the allowed countries.
        const usaOption = page.locator('.ag-rich-select-row', { hasText: 'USA' }).first();
        await expect(usaOption).toBeVisible();
        await usaOption.click();

        await expect(countryCell).toContainText('USA');
        // Dublin is not a USA city, so onCellValueChanged clears the city cell.
        await expect(cityCell).toHaveText('');
    });

    // Gender uses the same Cell Component in the grid and in the rich select editor list.
    test.eachFramework('gender uses one cell component for the grid and the editor', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'gender').locator('i.fa.fa-male')).toBeVisible();
        await expect(agIdFor.cell('1', 'gender').locator('i.fa.fa-female')).toBeVisible();

        await agIdFor.cell('0', 'gender').dblclick();
        const rows = page.locator('.ag-rich-select-row');
        await expect(rows).toHaveCount(2);
        await expect(rows.locator('i.fa-male')).toHaveCount(1);
        await expect(rows.locator('i.fa-female')).toHaveCount(1);

        await page.keyboard.press('Escape');
    });

    // Country passes cellHeight: 50 so each entry in the editor list is 50px tall.
    test.eachFramework('country editor entries are 50px tall', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'country').dblclick();

        const row = page.locator('.ag-rich-select-row').first();
        await expect(row).toBeVisible();
        const box = await row.boundingBox();
        expect(box!.height).toBeGreaterThan(40);
        expect(box!.height).toBeLessThan(60);

        await page.keyboard.press('Escape');
    });

    // City builds its values from the row's country, and formatValue suffixes the country.
    test.eachFramework('city values follow the row country and are formatted', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'city').dblclick();
        const irishRows = page.locator('.ag-rich-select-row');
        await expect(irishRows).toHaveCount(3);
        await expect(irishRows.nth(0)).toContainText('Dublin (Ireland)');
        await expect(irishRows.nth(1)).toContainText('Cork (Ireland)');
        await expect(irishRows.nth(2)).toContainText('Galway (Ireland)');

        await page.keyboard.press('Escape');

        // Row 1 is a USA row, so it offers the four USA cities instead.
        await agIdFor.cell('1', 'city').dblclick();
        const usaRows = page.locator('.ag-rich-select-row');
        await expect(usaRows).toHaveCount(4);
        await expect(usaRows.nth(0)).toContainText('New York (USA)');
        await expect(usaRows.nth(3)).toContainText('Houston (USA)');

        await page.keyboard.press('Escape');
    });

    // Picking another city for the row commits that city.
    test.eachFramework('selecting a different city updates the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'city');
        await cell.dblclick();

        await page.locator('.ag-rich-select-row').filter({ hasText: 'Cork' }).first().click();

        await expect(cell).toContainText('Cork');
    });

    // Address uses the large text area editor, shown in a popup.
    test.eachFramework('address uses the large text editor in a popup', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'address');
        await cell.scrollIntoViewIfNeeded();
        await expect(cell).toContainText('1197 Thunder Wagon Common');

        await cell.dblclick();
        const textArea = page.locator('.ag-large-text textarea').first();
        await expect(textArea).toBeVisible();
        await expect(cell.locator('textarea')).toHaveCount(0);

        await textArea.fill('12 New Street, Dublin');
        await textArea.press('Enter');

        await expect(cell).toContainText('12 New Street, Dublin');
    });
});
