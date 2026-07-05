import { expect, test } from '@utils/grid/test-utils';

// The only year greater than 2010 in olympic-winners.json is 2012, so the
// custom "Since 2010" filter reduces the visible rows to year-2012 records.
// Row-id 0 is Michael Phelps 2008 (filtered out), row-id 2 is Michael Phelps 2012 (kept).

test.agExample(import.meta, () => {
    test.eachFramework('Year Default applies immediately with no buttons', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        await agIdFor.headerFilterButton('year').click();

        // clicking the radio applies the filter straight away (no apply button)
        await page.getByText('Since 2010', { exact: true }).click();

        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
    });

    test.eachFramework('Year Apply defers filtering until Apply is pressed', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('year_1').click();

        // selecting the radio does NOT apply yet - the 2008 row is still visible
        await page.getByText('Since 2010', { exact: true }).click();
        await expect(agIdFor.cell('0', 'year_1')).toContainText('2008');

        // pressing Apply commits the model (and closeOnApply shuts the popup)
        await page.locator('.ag-filter-apply-panel-apply-button').click();
        await expect(agIdFor.cell('2', 'year_1')).toContainText('2012');
        await expect(agIdFor.cell('0', 'year_1')).not.toBeVisible();
    });

    test.eachFramework('Year Reset restores the default model', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('year_2').click();

        // no apply button, so the radio applies immediately and filters out the 2008 row
        await page.getByText('Since 2010', { exact: true }).click();
        await expect(agIdFor.cell('0', 'year_2')).not.toBeVisible();

        // Reset sets the filter back to the default (inactive) model - the 2008 row returns
        await page.getByRole('button', { name: 'Reset' }).click();
        await expect(agIdFor.cell('0', 'year_2')).toContainText('2008');
    });
});
