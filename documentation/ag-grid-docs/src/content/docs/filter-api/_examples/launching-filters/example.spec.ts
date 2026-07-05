import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Athlete filter launches from the header button', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerFilterButton('athlete').click();

        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        await filterInput.fill('Phelps');
        // close the popup so the filtered result settles
        await page.keyboard.press('Escape');

        // 'contains Phelps' => Michael Phelps rows only (3 rows)
        const firstAthlete = agIdFor.cell('0', 'athlete');
        await expect(firstAthlete).toContainText('Michael Phelps');
        await expect(page.locator('.ag-row')).toHaveCount(3);
    });

    test.eachFramework('Country filter launches via the API button', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // the header filter button is suppressed for the Country column
        await expect(agIdFor.headerFilterButton('country')).toHaveCount(0);

        await page.getByRole('button', { name: 'Open Country Filter' }).click();

        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();

        await filterInput.fill('Ireland');
        await page.keyboard.press('Escape');

        // 'contains Ireland' => 9 rows, first is Cian O'Connor (data index 6079)
        await expect(agIdFor.cell('6079', 'country')).toContainText('Ireland');
        await expect(page.locator('.ag-row')).toHaveCount(9);
    });
});
