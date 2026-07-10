import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom drag cell renderer and data render', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The first column uses a custom cell renderer showing a draggable "Drag Me!" handle.
        await expect(page.locator('.ag-cell [draggable="true"]').first()).toContainText('Drag Me!');

        // Same dataset as the other examples: ids 100..108, colours cycle Red/Green/Blue.
        await expect(agIdFor.cell('0', 'id')).toContainText('100');
        await expect(agIdFor.cell('0', 'color')).toContainText('Red');
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
