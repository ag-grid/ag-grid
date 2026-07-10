import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the seeded row data', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First three rows cycle Toyota / Ford / Porsche (see getRowData()).
        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'model')).toContainText('Celica');
        await expect(agIdFor.cell('0', 'price')).toContainText('35000');

        await expect(agIdFor.cell('1', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('1', 'model')).toContainText('Mondeo');
        await expect(agIdFor.cell('1', 'price')).toContainText('32000');

        await expect(agIdFor.cell('2', 'make')).toContainText('Porsche');
    });

    test.eachFramework('editing one cell puts the whole row into edit mode', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const modelCell = agIdFor.cell('0', 'model');
        await modelCell.dblclick();

        // The double-clicked cell shows a text editor...
        await expect(modelCell.locator('input')).toBeVisible();
        // ...and the row is flagged as editing.
        await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-editing/);
        // ...and a different editable column in the same row also shows an editor (full row edit).
        await expect(agIdFor.cell('0', 'price').locator('input')).toBeVisible();
    });

    test.eachFramework('read only columns stay non-editable during full row edit', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.cell('0', 'model').dblclick();
        await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-editing/);

        // field4 and field6 are editable:false, so no editor input is rendered for them.
        await expect(agIdFor.cell('0', 'field4').locator('input')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'field6').locator('input')).toHaveCount(0);
    });

    test.eachFramework('Start Editing Line 2 button edits the second row via the API', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Start Editing Line 2' }).click();

        // rowIndex 1 becomes editable via startEditingCell, row 0 is unaffected.
        await expect(agIdFor.rowNode('1').first()).toHaveClass(/ag-row-editing/);
        await expect(agIdFor.rowNode('0').first()).not.toHaveClass(/ag-row-editing/);

        // Stop Editing exits edit mode.
        await page.getByRole('button', { name: 'Stop Editing' }).click();
        await expect(agIdFor.rowNode('1').first()).not.toHaveClass(/ag-row-editing/);
    });
});
