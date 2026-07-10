import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the inline row data across the four columns', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'make')).toContainText('Tesla');
        await expect(agIdFor.cell('0', 'model')).toContainText('Model Y');
        await expect(agIdFor.cell('0', 'price')).toContainText('64950');

        await expect(agIdFor.cell('1', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('1', 'model')).toContainText('F-Series');

        await expect(agIdFor.cell('2', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('2', 'price')).toContainText('29600');
    });

    test.eachFramework('sorting the price column reorders the rows', async ({ agIdFor, page }) => {
        // Ascending: Toyota Corolla (29600) is the cheapest, so it floats to the top.
        await agIdFor.headerCell('price').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('2')).toHaveAttribute('row-index', '0');

        // Descending: Tesla Model Y (64950) is the most expensive, so it floats to the top.
        await agIdFor.headerCell('price').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('0')).toHaveAttribute('row-index', '0');
    });
});
