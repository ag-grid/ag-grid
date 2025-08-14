import { expect, remoteGrid, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Run through all frameworks
    test.eachFramework('With Batch', async ({ page, agIdFor }) => {
        await page.locator('button', { hasText: 'Start Batch Edit' }).click(); // click the button to start batch editing

        const cell = agIdFor.cell('0', 'gold');

        // initiate cell editing by double clicking the cell
        await cell.dblclick();
        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.type('100'); // type in a new value
        await page.keyboard.press('Enter'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('100'); // verify the cell has the new value
        await expect(cell).toHaveClass(/ag-cell-batch-edit/);

        const totalCell = agIdFor.cell('0', 'total');
        await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
        await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
    });

    // Test only a single framework for a specific issue
    test.typescript('Without Batch', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'gold');

        // initiate cell editing by double clicking the cell
        await cell.dblclick();
        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.type('100'); // type in a new value
        await page.keyboard.press('Enter'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('100'); // verify the cell has the new value
        await expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

        const totalCell = agIdFor.cell('0', 'total');
        await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
        await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
    });

    // Nested tests for logical test grouping
    test.describe('Nested Batch Editing', () => {
        test.eachFramework('Test Total', async ({ agIdFor }) => {
            const totalCell = agIdFor.cell('0', 'total');
            await expect(totalCell).toHaveText('6'); // verify the total cell has the new value
            await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
        });

        test.eachFramework('Test Total1', async ({ agIdFor }) => {
            const totalCell = agIdFor.cell('0', 'total');
            await expect(totalCell).toHaveText('6'); // verify the total cell has the new value
            await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
        });
    });

    test.eachFramework('GridApi + Styles', async ({ agIdFor, page }) => {
        const gridApi = remoteGrid(page);

        await gridApi.startBatchEdit();

        const result = await gridApi.isBatchEditing();
        expect(result).toBeTruthy();

        const cell = agIdFor.cell('0', 'gold');

        // initiate cell editing by double clicking the cell
        await cell.dblclick();
        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.type('100'); // type in a new value
        await page.keyboard.press('Enter'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('100'); // verify the cell has the new value
        await expect(cell).toHaveClass(/ag-cell-batch-edit/);

        const totalCell = agIdFor.cell('0', 'total');
        await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
        await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
    });
});
