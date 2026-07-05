import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Set Custom Filter Model filters the grid', async ({ agIdFor, page }) => {
        // wait for the grid to render so the button handlers are attached
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'Set Custom Filter Model' }).click();

        // country in [Ireland, United States] AND age < 30 AND athlete startsWith 'Mich' AND date < 2010-01-01 => 6 rows
        const rows = page.locator('.ag-row');
        await expect(rows).toHaveCount(6);

        const firstAthlete = agIdFor.cell('0', 'athlete');
        await expect(firstAthlete).toContainText('Michael Phelps');
        await expect(page.locator('.ag-row').filter({ has: firstAthlete }).first()).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Save, Reset and Restore round-trips the filter model', async ({ page }) => {
        const rows = page.locator('.ag-row');
        await expect(rows.first()).toBeVisible();

        await page.getByRole('button', { name: 'Set Custom Filter Model' }).click();
        await expect(rows).toHaveCount(6);

        await page.getByRole('button', { name: 'Save Filter Model' }).click();
        const saved = page.locator('#savedFilters');
        await expect(saved).toContainText('athlete');
        await expect(saved).toContainText('country');

        await page.getByRole('button', { name: 'Reset Filters' }).click();
        await expect(rows.first()).toBeVisible();
        expect(await rows.count()).toBeGreaterThan(6);

        await page.getByRole('button', { name: 'Restore Saved Filter Model' }).click();
        await expect(rows).toHaveCount(6);
    });
});
