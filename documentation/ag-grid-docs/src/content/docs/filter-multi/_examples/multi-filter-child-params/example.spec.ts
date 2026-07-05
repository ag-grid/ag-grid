import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Text child filter uses the startsWith default option', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();

        // 'Phelps' is a substring but not a prefix, so startsWith matches nothing.
        await textInput.fill('Phelps');
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();

        // 'Michael Phelps' is a prefix of rows 0, 1, 2; row 3 is filtered out.
        await textInput.fill('Michael Phelps');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();
    });
});
