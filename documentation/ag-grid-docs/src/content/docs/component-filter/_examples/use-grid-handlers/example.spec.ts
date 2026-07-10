import { expect, test } from '@utils/grid/test-utils';

// The custom YearFilter component drives the grid-provided Number Filter handler:
// "Since 2010" => greaterThan 2010 (only 2012), "Before 2010" => lessThan 2010.
// Row-id 0 is Michael Phelps 2008, row-id 2 is Michael Phelps 2012.

test.agExample(import.meta, () => {
    test.eachFramework('Since 2010 uses greaterThan and applies immediately', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        await agIdFor.headerFilterButton('year').click();

        // no apply button on the default column, so the model applies immediately
        await page.getByText('Since 2010', { exact: true }).click();

        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
    });

    test.eachFramework('Before 2010 uses lessThan via the number handler', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('year').click();

        await page.getByText('Before 2010', { exact: true }).click();

        // Michael Phelps 2008 (row-id 0) satisfies lessThan 2010 and stays; the 2012 row is filtered out
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.cell('2', 'year')).not.toBeVisible();
    });

    test.eachFramework('Year Apply defers filtering until Apply is pressed', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('year_1').click();

        // selecting the radio does not apply yet - the 2008 row is still visible
        await page.getByText('Since 2010', { exact: true }).click();
        await expect(agIdFor.cell('0', 'year_1')).toContainText('2008');

        await page.locator('.ag-filter-apply-panel-apply-button').click();
        await expect(agIdFor.cell('2', 'year_1')).toContainText('2012');
        await expect(agIdFor.cell('0', 'year_1')).not.toBeVisible();
    });
});
