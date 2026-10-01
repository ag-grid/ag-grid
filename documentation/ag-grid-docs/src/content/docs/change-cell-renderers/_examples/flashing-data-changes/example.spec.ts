import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders seeded row values', async ({ agIdFor }) => {
        // Row 0: a=5505, b=383, c=3148, d=e=f=0.
        await expect(agIdFor.cell('0', 'a').first()).toContainText('5505');
        await expect(agIdFor.cell('0', 'c').first()).toContainText('3148');
    });

    test.eachFramework('Flash One Cell flashes row 4 column c via the API', async ({ agIdFor, page }) => {
        // onFlashOneCell calls flashCells for row index 4, column 'c'.
        await expect(agIdFor.cell('4', 'c').first()).toBeVisible();
        await page.getByRole('button', { name: 'Flash One Cell' }).click();
        await expect(agIdFor.cell('4', 'c').first()).toHaveClass(/ag-cell-data-changed/);
    });

    test.eachFramework('Flash Two Rows flashes rows 4 and 5 via the API', async ({ agIdFor, page }) => {
        // onFlashTwoRows calls flashCells with two row nodes and no columns, so every
        // cell in rows 4 and 5 flashes and no other row does.
        await expect(agIdFor.cell('4', 'a').first()).toBeVisible();
        await page.getByRole('button', { name: 'Flash Two Rows' }).click();

        await expect(agIdFor.cell('4', 'a').first()).toHaveClass(/ag-cell-data-changed/);
        await expect(agIdFor.cell('4', 'f').first()).toHaveClass(/ag-cell-data-changed/);
        await expect(agIdFor.cell('5', 'a').first()).toHaveClass(/ag-cell-data-changed/);
        await expect(agIdFor.cell('5', 'f').first()).toHaveClass(/ag-cell-data-changed/);

        // Row 3 was not in the rowNodes list, so it must not flash.
        await expect(agIdFor.cell('3', 'a').first()).not.toHaveClass(/ag-cell-data-changed/);
    });

    test.eachFramework('Flash Two Columns flashes columns c and d via the API', async ({ agIdFor, page }) => {
        // onFlashTwoColumns calls flashCells for columns 'c' and 'd' (all rows).
        await expect(agIdFor.cell('0', 'c').first()).toBeVisible();
        await page.getByRole('button', { name: 'Flash Two Columns' }).click();
        await expect(agIdFor.cell('0', 'c').first()).toHaveClass(/ag-cell-data-changed/);
        await expect(agIdFor.cell('0', 'd').first()).toHaveClass(/ag-cell-data-changed/);

        // Column 'a' was not in the columns list, so it must not flash.
        await expect(agIdFor.cell('0', 'a').first()).not.toHaveClass(/ag-cell-data-changed/);
    });
});
