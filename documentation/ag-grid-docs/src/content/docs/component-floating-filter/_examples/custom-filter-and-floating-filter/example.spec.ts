import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic medal data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Custom floating filter drives the custom filter', async ({ agIdFor, page }) => {
        // Only the two Michael Phelps rows have total > 7 in the dataset.
        await agIdFor.floatingFilter('total').locator('input').fill('7');

        await expect(page.locator('.ag-row')).toHaveCount(2);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });
});
