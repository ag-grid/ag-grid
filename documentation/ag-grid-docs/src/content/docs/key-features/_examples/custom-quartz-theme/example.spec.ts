import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Loads Olympic data and applies the customised Quartz theme', async ({ agIdFor, page }) => {
        // data is fetched asynchronously — wait for the first athlete cell to populate
        await expect(agIdFor.cell('0', 'athlete')).not.toBeEmpty();
        await expect(agIdFor.headerCell('athlete')).toBeVisible();
        await expect(agIdFor.headerCell('gold')).toBeVisible();

        // the customised theme sets a light-blue background via the Theming API,
        // exposed as the --ag-background-color custom property on the grid wrapper
        const backgroundColor = await page
            .locator('.ag-root-wrapper')
            .first()
            .evaluate((el) => getComputedStyle(el).getPropertyValue('--ag-background-color').trim());
        expect(backgroundColor).toBe('rgb(241, 247, 255)');
    });
});
