import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Multi Filter only applies when the Apply button is clicked', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();
        await textInput.fill('Michael Phelps');

        // Buttons defer application: typing alone does not filter, so more than 3 rows still exist.
        await expect(agIdFor.cell('3', 'athlete')).toBeVisible();

        const applyButton = page.getByRole('button', { name: 'Apply' });
        await expect(applyButton).toBeVisible();
        await applyButton.click();

        // 'Michael Phelps' appears in rows 0, 1, 2; row 3 is filtered out once applied.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();
    });
});
