import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom fuzzy filter matches multiple partial words', async ({ page, agIdFor }) => {
        // by default the first row is Michael Phelps (top of olympic-winners.json)
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // open the custom filter popup on the Athlete column
        const filterButton = agIdFor.headerFilterButton('athlete');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        // the custom component renders a single plain text input inside its wrapper
        const filterInput = page.locator('.person-filter input');
        await expect(filterInput).toBeVisible();

        // partial words across first and last name should still match, e.g. Aleksey Nemov (data index 4)
        await filterInput.fill('alek nem');

        // close the popup by clicking a grid cell
        await agIdFor.cell('4', 'athlete').click();

        // only Aleksey Nemov remains; the Michael Phelps rows are filtered out
        await expect(agIdFor.cell('4', 'athlete')).toContainText('Aleksey Nemov');
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
    });
});
