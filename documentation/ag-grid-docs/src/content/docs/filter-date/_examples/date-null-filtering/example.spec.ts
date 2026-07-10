import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the blank and populated rows', async ({ page, agIdFor }) => {
        await expect(page.locator('.ag-row[row-id]')).toHaveCount(4);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Alberto Gutierrez');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Niall Crosby');
    });

    test.eachFramework('blank rows are excluded from equals by default', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('date').click();

        const filterInput = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        // matches the two populated rows dated 25/10/2016; the two blank rows are excluded
        await filterInput.fill('2016-10-25');
        await filterInput.dispatchEvent('input');

        await agIdFor.cell('2', 'athlete').click();

        await expect(page.locator('.ag-row[row-id]')).toHaveCount(2);
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Sean Landsman');
        await expect(agIdFor.cell('3', 'athlete')).toContainText('Robert Clarke');
    });
});
