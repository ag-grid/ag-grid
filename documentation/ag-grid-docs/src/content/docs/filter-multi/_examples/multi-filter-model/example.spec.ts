import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Filter model can be saved, reset and restored', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();
        // 'Michael Phelps' matches rows 0, 1, 2; row 3 is filtered out.
        await textInput.fill('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();

        await page.getByRole('button', { name: 'Save State' }).click();

        // Resetting clears the filter model, so the filtered-out rows return.
        await page.getByRole('button', { name: 'Reset State' }).click();
        await expect(agIdFor.cell('3', 'athlete')).toBeVisible();

        // Restoring re-applies the saved model, filtering back to the matching rows.
        await page.getByRole('button', { name: 'Restore State' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();
    });
});
