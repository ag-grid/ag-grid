import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const dataRows = (page: any) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

    test.eachFramework('Add New Row pins an editable row at the bottom', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Seeded with 5 rows, no pinned bottom row yet
        await expect(dataRows(page)).toHaveCount(5);
        await expect(page.locator('.ag-grid-pinned-bottom-rows-container .ag-row')).toHaveCount(0);

        await page.getByRole('button', { name: 'Add New Row', exact: true }).click();

        // A pinned bottom row appears with an active full-row editor
        await expect(agIdFor.rowNode('new-row')).toHaveClass(/ag-row-editing/);
        await expect(page.locator('.ag-grid-pinned-bottom-rows-container input').first()).toBeVisible();
    });

    test.eachFramework('Committing the new row adds it to the immutable store', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Add New Row', exact: true }).click();

        // Enter a unique symbol into the pinned editing row and commit with Enter
        const symbolInput = page.locator('.ag-grid-pinned-bottom-rows-container input').first();
        await symbolInput.fill('ZZZ');
        await symbolInput.press('Enter');

        // The pinned editor is cleared and the row is now part of the grid data
        await expect(page.locator('.ag-grid-pinned-bottom-rows-container .ag-row')).toHaveCount(0);
        await expect(dataRows(page)).toHaveCount(6);
        await expect(agIdFor.cell('ZZZ', 'symbol')).toContainText('ZZZ');
    });
});
