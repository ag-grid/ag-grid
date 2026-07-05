import { expect, test } from '@utils/grid/test-utils';

// Data: small-olympic-winners.json.
// Row 0 = Natalie Coughlin (age 25). Row 1 = Aleksey Nemov (age 24). Athletes starting with 'A': rows 1, 2, 5, 24, 25.

test.agExample(import.meta, () => {
    test.eachFramework('Custom Starts With "A" option filters and survives save/restore', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');

        // Open the athlete filter and pick the zero-input custom option.
        await agIdFor.headerFilterButton('athlete').click();
        await page.locator('.ag-filter-select').first().click();
        await page.locator('.ag-list-item', { hasText: 'Starts With "A"' }).click();

        // Natalie (row 0) is dropped; Aleksey (row 1) remains.
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');

        // Save the model, reset (clears the filter), then restore it.
        await page.getByText('Save State').click();
        await page.getByText('Reset State').click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');

        await page.getByText('Restore State').click();
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
    });

    test.eachFramework(
        'Localised custom Not Equals option appears in the country filter',
        async ({ agIdFor, page }) => {
            await agIdFor.headerFilterButton('country').click();
            await page.locator('.ag-filter-select').first().click();

            // getLocaleText replaces the 'notEqualNoNulls' display name.
            await expect(page.locator('.ag-list-item', { hasText: '* Not Equals (No Nulls) *' })).toBeVisible();
        }
    );

    test.eachFramework('Even Numbers custom option filters the age column', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'age')).toContainText('25');

        await agIdFor.headerFilterButton('age').click();
        await page.locator('.ag-filter-select').first().click();
        await page.locator('.ag-list-item', { hasText: 'Even Numbers' }).click();

        // Natalie's age is 25 (odd) => dropped; Aleksey is 24 (even) => kept.
        await expect(agIdFor.cell('0', 'age')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'age')).toContainText('24');
    });
});
