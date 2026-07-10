import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Column types apply currency formatting and shaded class', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Lamp: boughtPrice 100 -> £100, soldPrice 200 -> £200 (currency type formatter).
        await expect(agIdFor.cell('0', 'productName')).toContainText('Lamp');
        await expect(agIdFor.cell('0', 'boughtPrice')).toContainText('£100');
        await expect(agIdFor.cell('0', 'soldPrice')).toContainText('£200');

        // The soldPrice column additionally uses the shaded type -> shaded-class.
        await expect(agIdFor.cell('0', 'soldPrice')).toHaveClass(/shaded-class/);
        await expect(agIdFor.cell('0', 'boughtPrice')).not.toHaveClass(/shaded-class/);
    });

    test.eachFramework('Sorting soldPrice floats the highest value to the top', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const deskRow = agIdFor.rowNode('2'); // Desk has the max soldPrice (400)
        await agIdFor.headerCell('soldPrice').click(); // ascending -> Desk goes to the bottom
        await waitForRowAnimations(page);
        await expect(deskRow).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('soldPrice').click(); // descending -> Desk floats to the top
        await waitForRowAnimations(page);
        await expect(deskRow).toHaveAttribute('row-index', '0');
    });
});
