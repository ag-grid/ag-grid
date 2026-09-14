import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pre-defined data types render their values', async ({ agIdFor, page }) => {
        // Michael Phelps, 2008: text, number, bigint, date and object columns.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        // medalsBigInt = gold + silver + bronze = 8 + 0 + 0, shown as a plain integer string.
        await expect(agIdFor.cell('0', 'medalsBigInt')).toContainText('8');
        // 'date' formats Date objects as ISO YYYY-MM-DD (24/08/2008 -> 2008-08-24).
        await expect(agIdFor.cell('0', 'dateObject')).toContainText('2008-08-24');
        // 'dateString' keeps the string in ISO form.
        await expect(agIdFor.cell('0', 'date')).toContainText('2008-08-24');
        // 'dateTime' and 'dateTimeString' serialise the time alongside the date. The time
        // parts are randomised per load, so only the shape and the date portion are asserted.
        await expect(agIdFor.cell('0', 'dateTime')).toHaveText(/^2008-08-24[ T]\d{2}:\d{2}:\d{2}$/);
        // object column is off-screen initially; scroll horizontally to render it. Retry the
        // scroll+assert together: the column only virtualises into the DOM once the grid has
        // laid out wide enough to overflow, which can lag behind the initial content render.
        await expect(async () => {
            await page
                .locator('.ag-body-horizontal-scroll-viewport')
                .evaluate((el) => (el.scrollLeft = el.scrollWidth));
            // object data type is formatted via the custom value formatter to the country name.
            await expect(agIdFor.cell('0', 'countryObject')).toContainText('United States', { timeout: 2000 });
            // 'dateTimeString' also lives in the right-hand, initially virtualised region.
            await expect(agIdFor.cell('0', 'dateTimeString')).toHaveText(/^2008-08-24[ T]\d{2}:\d{2}:\d{2}$/, {
                timeout: 2000,
            });
        }).toPass();
    });

    test.eachFramework('Boolean data type renders checkboxes reflecting the value', async ({ agIdFor }) => {
        // gold = 8 > 0 => checked; silver = 0 => unchecked.
        await expect(agIdFor.cell('0', 'hasGold').locator('input')).toBeChecked();
        await expect(agIdFor.cell('0', 'hasSilver').locator('input')).not.toBeChecked();
    });

    test.eachFramework('Text filter narrows the rows', async ({ agIdFor, page }) => {
        // Natalie Coughlin (row 3) is present before filtering.
        await expect(page.getByText('Natalie Coughlin').first()).toBeVisible();

        await agIdFor.floatingFilter('athlete').locator('input').fill('Michael Phelps');

        await expect(page.getByText('Natalie Coughlin')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
