import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.skip(true, 'Skipped until Math.random() fixed');
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const colFilterIcon = agIdFor.headerFilterButton('price');
        await expect(colFilterIcon).toBeVisible();
        await colFilterIcon.click();

        const filterOption = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });

        await filterOption.click();

        await page.getByText('Greater than', { exact: true }).click();

        const filterInput = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });

        await filterInput.fill('900');

        // close the filter by clicking outside
        await agIdFor.cell('0', 'price').click();

        const firstRowPrice = agIdFor.cell('0', 'price');
        const secondRowPrice = agIdFor.cell('4', 'price');
        const thirdRowPrice = agIdFor.cell('18', 'price');

        await expect(firstRowPrice).toHaveText('947.75');
        await expect(secondRowPrice).toHaveText('978.05');
        await expect(thirdRowPrice).toHaveText('920.24');

        // check the row index attribute is correct on the parent row element
        await expect(firstRowPrice.locator('..')).toHaveAttribute('row-index', '0');
        await expect(secondRowPrice.locator('..')).toHaveAttribute('row-index', '1');
        await expect(thirdRowPrice.locator('..')).toHaveAttribute('row-index', '2');

        // get the row with attribute row-index=0
        // const firstRow = page.locator('[row-index="0"]');
        // const firstCell = firstRow.locator('[col-id="price"]');
        // await expect(firstCell).toHaveText('947.75');
    });
});
