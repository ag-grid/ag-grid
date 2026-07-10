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
});
