import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Default text filter narrows rows with a contains match', async ({ page, agIdFor }) => {
        // Unfiltered, the first row is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Open the athlete column filter and apply a contains match (the default option).
        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('Fischer');

        // The filter applies automatically; the first displayed athlete now contains "Fischer".
        const firstAthlete = page.locator('[row-index="0"] [col-id="athlete"]').first();
        await expect(firstAthlete).toContainText('Fischer');
    });
});
