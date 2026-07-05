import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Age Above 30 filter is honoured via the API', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Age Above 30', exact: true }).click();

        // first row in data order with age > 30 is Dara Torres (age 33, data index 11)
        const daraAthlete = agIdFor.cell('11', 'athlete');
        await expect(daraAthlete.first()).toContainText('Dara Torres');
        await expect(agIdFor.cell('11', 'age').first()).toContainText('33');
        await expect(page.locator('.ag-row').filter({ has: daraAthlete }).first()).toHaveAttribute('row-index', '0');

        // clearing the filter restores Michael Phelps (data index 0) to the top
        await page.getByRole('button', { name: 'Clear Age Filter' }).click();
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');
    });

    test.eachFramework('Country Set Filter model is honoured via the API', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');

        await page.getByRole('button', { name: "Countries Ending 'stan'" }).click();

        // first row belonging to a *stan country is Daniyal Gadzhiyev / Kazakhstan (data index 706)
        const stanAthlete = agIdFor.cell('706', 'athlete');
        await expect(stanAthlete.first()).toContainText('Daniyal Gadzhiyev');
        await expect(agIdFor.cell('706', 'country').first()).toContainText('Kazakhstan');
        await expect(page.locator('.ag-row').filter({ has: stanAthlete }).first()).toHaveAttribute('row-index', '0');

        await page.getByRole('button', { name: 'Clear Country' }).click();
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');
    });
});
