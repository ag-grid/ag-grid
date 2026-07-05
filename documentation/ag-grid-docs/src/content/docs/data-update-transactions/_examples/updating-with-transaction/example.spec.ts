import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Add Items appends new rows via transaction', async ({ agIdFor, page }) => {
        // Initial dataset (from data.ts): Toyota / Ford / Porsche.
        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'price')).toContainText('35000');
        await expect(agIdFor.cell('2', 'make')).toContainText('Porsche');
        await expect(agIdFor.cell('2', 'price')).toContainText('72000');

        // Add Items appends three new rows (Toyota 1/2/3, price 35000 + n*17).
        await page.getByRole('button', { name: 'Add Items', exact: true }).click();
        await expect(agIdFor.cell('3', 'make')).toContainText('Toyota 1');
        await expect(agIdFor.cell('3', 'price')).toContainText('35017');
        await expect(agIdFor.cell('5', 'make')).toContainText('Toyota 3');
    });

    test.eachFramework('Clear Data removes every row', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');

        await page.getByRole('button', { name: 'Clear Data' }).click();

        await expect(agIdFor.cell('0', 'make')).toHaveCount(0);
        await expect(page.locator('.ag-center-cols-container .ag-row')).toHaveCount(0);
    });
});
