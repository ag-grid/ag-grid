import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Data renders with the custom drag source column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Same dataset as the simple example: ids 100..108, colours cycle Red/Green/Blue.
        await expect(agIdFor.cell('0', 'id')).toContainText('100');
        await expect(agIdFor.cell('0', 'color')).toContainText('Red');
        await expect(agIdFor.cell('1', 'color')).toContainText('Green');
        await expect(agIdFor.cell('2', 'color')).toContainText('Blue');
    });

    test.eachFramework('Sorting by id reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstRow = agIdFor.rowNode('0'); // id 100, the minimum
        await expect(firstRow).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('id').click(); // ascending: 100 stays on top
        await waitForRowAnimations(page);
        await expect(firstRow).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('id').click(); // descending: 100 sinks to the bottom
        await waitForRowAnimations(page);
        await expect(firstRow).toHaveAttribute('row-index', '8');
    });
});
