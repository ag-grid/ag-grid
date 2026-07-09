import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Multi-line address and custom cells render their content', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The address column holds multi-line strings; the first row contains this street.
        await expect(agIdFor.cell('0', 'address')).toContainText('1197 Thunder Wagon Common');
        await expect(agIdFor.cell('0', 'address')).toContainText('(401) 747-0763');

        // The custom column joins col1 and col2 ('abc' / 'xyz') via a multi-line renderer.
        const customCell = agIdFor.rowNode('0').locator('.multiline').last();
        await expect(customCell).toContainText('abc');
        await expect(customCell).toContainText('xyz');
    });

    test.eachFramework('Sorting the Address column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row '0' (1197...) is the ascending minimum, so it stays on top for ascending sort.
        await expect(agIdFor.rowNode('0')).toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('address').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('0')).toHaveAttribute('row-index', '0');

        // Descending sort floats row '1' (3685..., the maximum) to the top.
        await agIdFor.headerCell('address').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('1')).toHaveAttribute('row-index', '0');
        await expect(agIdFor.rowNode('0')).not.toHaveAttribute('row-index', '0');
    });
});
