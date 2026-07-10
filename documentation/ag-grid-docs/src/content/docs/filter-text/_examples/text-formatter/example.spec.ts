import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('textFormatter matches accented characters against plain input', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The formatter maps "ö" to "o", so filtering "Bjo" matches "Björn ...".
        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill('Bjo');

        // First matching athlete in data order is Björn Lind.
        await expect(page.locator('[row-index="0"] [col-id="athlete"]').first()).toContainText('Björn Lind');
    });
});
