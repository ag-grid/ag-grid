import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic medal data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Read-only floating filter reflects the custom filter model', async ({ agIdFor, page }) => {
        // Open the custom filter via the floating filter button and set a greater-than value.
        await agIdFor.floatingFilter('gold').locator('.ag-floating-filter-button-button').click();
        await page.getByPlaceholder('Number of medals...').fill('7');

        // Only Michael Phelps (2008) has gold > 7 in the dataset.
        await expect(page.locator('.ag-row')).toHaveCount(1);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // getModelAsString() drives the read-only floating filter display.
        await expect(agIdFor.floatingFilter('gold').locator('input')).toHaveValue('>7');
    });
});
