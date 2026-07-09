import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the initial row data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // getRowId maps each row to its data `id`, so rows are addressable by 'aa', 'bb', etc.
        await expect(agIdFor.cell('aa', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('aa', 'model')).toContainText('Celica');
        await expect(agIdFor.cell('aa', 'price')).toContainText('35000');

        await expect(agIdFor.cell('bb', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('bb', 'model')).toContainText('Mondeo');

        await expect(agIdFor.cell('gg', 'make')).toContainText('Horse');
        await expect(agIdFor.cell('gg', 'price')).toContainText('99000');
    });

    test.eachFramework('Sorting by price reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Horse (99000) is the unique maximum price, Mazda MX5 (28000) the unique minimum.
        const horse = agIdFor.rowNode('gg');
        const mazda = agIdFor.rowNode('ff');

        await agIdFor.headerCell('price').click(); // ascending
        await waitForRowAnimations(page);
        await expect(mazda).toHaveAttribute('row-index', '0');
        await expect(horse).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('price').click(); // descending
        await waitForRowAnimations(page);
        await expect(horse).toHaveAttribute('row-index', '0');
    });
});
