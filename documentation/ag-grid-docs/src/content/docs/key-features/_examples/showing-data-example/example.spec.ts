import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders car data with formatted price and custom button', async ({ agIdFor, page }) => {
        // valueGetter combines make + model
        await expect(page.locator('.ag-cell').filter({ hasText: 'Tesla Model Y' }).first()).toBeVisible();

        // price column is formatted with a £ prefix and thousands separator
        await expect(agIdFor.cell('0', 'price')).toContainText('£64,950');
        await expect(agIdFor.cell('1', 'price')).toContainText('£33,850');

        // electric boolean value rendered as a checkbox reflecting the value
        await expect(agIdFor.cell('0', 'electric').locator('input[type="checkbox"]')).toBeChecked();
        await expect(agIdFor.cell('1', 'electric').locator('input[type="checkbox"]')).not.toBeChecked();

        // custom cell renderer supplies a "Push Me!" button in every row
        await expect(agIdFor.cell('0', 'button').getByRole('button', { name: 'Push Me!' })).toBeVisible();
    });
});
