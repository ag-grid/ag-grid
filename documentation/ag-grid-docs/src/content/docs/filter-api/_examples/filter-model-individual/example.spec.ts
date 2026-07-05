import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Set Custom Filter Model filters the Athlete column', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Set Custom Filter Model' }).click();

        // athlete startsWith 'Mich' => Michael Phelps is the first matching row (data index 0)
        const firstAthlete = agIdFor.cell('0', 'athlete');
        await expect(firstAthlete).toContainText('Michael Phelps');
        await expect(page.locator('.ag-row').filter({ has: firstAthlete }).first()).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Save Filter Model prints the Athlete model as text', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Set Custom Filter Model' }).click();
        await page.getByRole('button', { name: 'Save Filter Model' }).click();

        await expect(page.locator('#savedFilters')).toContainText('startsWith Mich');
    });

    test.eachFramework('Reset Filter clears the Athlete filter', async ({ agIdFor, page }) => {
        const firstAthlete = agIdFor.cell('0', 'athlete');
        await expect(firstAthlete).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Set Custom Filter Model' }).click();
        await expect(firstAthlete).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Reset Filter' }).click();
        // with no filter the full dataset is shown, starting again with Michael Phelps at the top
        await expect(firstAthlete).toContainText('Michael Phelps');
        expect(await page.locator('.ag-row').count()).toBeGreaterThan(6);
    });
});
