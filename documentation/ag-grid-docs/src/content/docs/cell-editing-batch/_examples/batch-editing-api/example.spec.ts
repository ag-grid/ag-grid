import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

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
    });

    test.eachFramework('GridApi + Styles + Enter', async ({ agIdFor, page, remoteGrid }) => {
        const gridApi = remoteGrid(page);

        await gridApi.startBatchEdit();

        const result = await gridApi.isBatchEditing();
        expect(result).toBeTruthy();

        const cell1 = agIdFor.cell('0', 'gold');
        const cell2 = agIdFor.cell('0', 'silver');

        // initiate cell editing by double clicking the cell
        await test.step('Edit+Change+Enter', async () => {
            await cell1.dblclick();
            const cellEditor = cell1.locator('input');
            await expect(cellEditor).toBeVisible();

            await page.keyboard.type('100'); // type in a new value
            await page.keyboard.press('Enter'); // press Enter to save the value

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell1).toHaveText('100'); // verify the cell has the new value
            await expect(cell1).toHaveClass(/ag-cell-batch-edit/);
            expect(await gridApi.isBatchEditing()).toBeTruthy();
        });

        await page.keyboard.press('Tab'); // press Tab to move to the next cell
        expect(await gridApi.isBatchEditing()).toBeTruthy();

        await page.waitForTimeout(100); // give the grid a moment to update

        await test.step('Edit+NoChange+Enter', async () => {
            const cellEditor = cell2.locator('input');
            await expect(cellEditor).toBeVisible();

            await cellEditor.press('Enter'); // press Enter to save the value

            await expect(cell1).toHaveClass(/ag-cell-batch-edit/);

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell2).toHaveText('2'); // verify the cell has the new value
            await expect(cell2).not.toHaveClass(/ag-cell-batch-edit/);

            expect(await gridApi.isBatchEditing()).toBeTruthy();
        });
    });

    test.eachFramework('GridApi + Styles', async ({ agIdFor, page, remoteGrid }) => {
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

    test.eachFramework('GridApi + Styles: multiple batches', async ({ agIdFor, page, remoteGrid }) => {
        const gridApi = remoteGrid(page);

        await test.step('First Batch', async () => {
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

            // now commit the batch
            await gridApi.commitBatchEdit();

            await page.waitForTimeout(100); // give the grid a moment to update

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell).toHaveText('100'); // verify the cell has the new value
            await expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

            await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
            await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
        });

        await test.step('2nd Batch', async () => {
            await gridApi.setFocusedCell(1, 'gold');
            await gridApi.startBatchEdit();

            const result = await gridApi.isBatchEditing();
            expect(result).toBeTruthy();

            const cell = agIdFor.cell('1', 'gold');
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

            // now commit the batch
            await gridApi.commitBatchEdit();

            await page.waitForTimeout(100); // give the grid a moment to update

            const gridApiHandle = await page.evaluateHandle(() => (window as any).getGridApi('1'));

            const editingCellCount = await test.step('remoteGridApi.getEditingCells()', async () =>
                await page.evaluate((gridApi) => gridApi.getEditingCells().length, gridApiHandle));

            expect(editingCellCount).toBe(0);

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell).toHaveText('100'); // verify the cell has the new value
            await expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

            await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
            await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
        });
    });
});
