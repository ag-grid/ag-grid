import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pre-defined data types render their values (enterprise)', async ({ agIdFor, page }) => {
        // Michael Phelps, 2008.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        // 'date' formats Date objects as ISO YYYY-MM-DD (24/08/2008 -> 2008-08-24).
        await expect(agIdFor.cell('0', 'dateObject')).toContainText('2008-08-24');
        // 'dateString' keeps the string in ISO form.
        await expect(agIdFor.cell('0', 'date')).toContainText('2008-08-24');
        // object column is off-screen initially; scroll horizontally to render it. Retry the
        // scroll+assert together: the column only virtualises into the DOM once the grid has
        // laid out wide enough to overflow, which can lag behind the initial content render.
        await expect(async () => {
            await page
                .locator('.ag-body-horizontal-scroll-viewport')
                .evaluate((el) => (el.scrollLeft = el.scrollWidth));
            // object data type is formatted via the custom value formatter to the country name.
            await expect(agIdFor.cell('0', 'countryObject')).toContainText('United States', { timeout: 2000 });
        }).toPass();
    });

    test.eachFramework('Boolean data type renders checkboxes reflecting the value', async ({ agIdFor }) => {
        // gold = 8 > 0 => checked; silver = 0 => unchecked.
        await expect(agIdFor.cell('0', 'hasGold').locator('input')).toBeChecked();
        await expect(agIdFor.cell('0', 'hasSilver').locator('input')).not.toBeChecked();
    });

    test.eachFramework('Boolean cell editor toggles the value on click', async ({ agIdFor }) => {
        const goldCheckbox = agIdFor.cell('0', 'hasGold').locator('input');
        // gold = 8 > 0 => initially checked.
        await expect(goldCheckbox).toBeChecked();
        // The checkbox cell editor toggles the boolean value when clicked.
        await goldCheckbox.click();
        await expect(agIdFor.cell('0', 'hasGold').locator('input')).not.toBeChecked();
    });
});
