import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Sport column defaults to the "Begins with" filter option', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        await agIdFor.headerFilterButton('sport').click();
        const sportInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(sportInput).toBeVisible();

        // defaultOption is 'startsWith': "Swim" matches.
        await sportInput.fill('Swim');
        await expect(page.locator('[row-index="0"] [col-id="sport"]').first()).toContainText('Swimming');

        // "wimming" is contained in "Swimming" but Swimming does not begin with it.
        await sportInput.fill('wimming');
        await expect(page.locator('.ag-row')).toHaveCount(0);
    });

    test.eachFramework('Athlete column applies its contains filter option', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('athlete').click();
        const athleteInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(athleteInput).toBeVisible();

        // Contains is available and is the default option.
        await athleteInput.fill('Fischer');
        await expect(page.locator('[row-index="0"] [col-id="athlete"]').first()).toContainText('Fischer');
    });
});
