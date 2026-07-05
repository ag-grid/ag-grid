import { expect, test } from '@utils/grid/test-utils';

// Data: olympic-winners.json. Row 0 = Michael Phelps (United States), row 4 = Aleksey Nemov (Russia).

test.agExample(import.meta, () => {
    test.eachFramework('Country filter uses the configured default option', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('country').click();

        // defaultOption is 'startsWith', which localises to 'Begins with'.
        await expect(page.locator('.ag-filter-select .ag-picker-field-display').first()).toContainText('Begins with');
    });

    test.eachFramework('Age filter always shows two conditions, Date filter shows one', async ({ agIdFor, page }) => {
        // numAlwaysVisibleConditions: 2 => two condition option selects for age.
        await agIdFor.headerFilterButton('age').click();
        await expect(page.locator('.ag-filter-select')).toHaveCount(2);

        // maxNumConditions: 1 => only a single condition for date.
        await agIdFor.headerFilterButton('date').click();
        await expect(page.locator('.ag-filter-select')).toHaveCount(1);
    });

    test.eachFramework('Applying the country startsWith filter reduces the rows', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('4', 'country')).toContainText('Russia');

        await agIdFor.headerFilterButton('country').click();
        await page.getByPlaceholder('Filter...').fill('United');

        // startsWith 'United' keeps United States (row 0), drops Russia (row 4).
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('4', 'country')).not.toBeVisible();
    });
});
