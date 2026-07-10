import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Athlete Multi Filter uses its child Text Filter', async ({ page, agIdFor }) => {
        // Michael Phelps is the first data row before any filtering.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const textInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(textInput).toBeVisible();
        // Default contains match; 'Michael Phelps' appears in exactly 3 rows (0, 1, 2).
        await textInput.fill('Michael Phelps');

        // Rows 0, 1, 2 are the three Michael Phelps entries; row 3 (Natalie Coughlin) is filtered out.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();
    });

    test.eachFramework('Year Multi Filter uses its child Number Filter', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('year');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const numberInput = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(numberInput).toBeVisible();
        // Default 'equals'; year 2012 -> Michael Phelps (row 2) is still present.
        await numberInput.fill('2012');

        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
    });
});
