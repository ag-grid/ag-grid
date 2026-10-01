import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

    // Run through all frameworks
    test.eachFramework('With Batch', async ({ page, agIdFor }) => {
        // Ensure grid is ready before clicking buttons
        const cell = agIdFor.cell('0', 'gold');
        await expect(cell).toBeVisible();

        await page.locator('button', { hasText: 'Start Batch' }).click(); // click the button to start batch editing

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

    test.typescript('Paste in batch stages value as pending edit', async ({ page, agIdFor }) => {
        // Grant clipboard permissions so AG Grid can use navigator.clipboard
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Row 0: gold=1, silver=2, bronze=3. Row 1: gold=2, silver=1, bronze=3
        const sourceCell = agIdFor.cell('0', 'gold'); // value = 1
        const targetCell = agIdFor.cell('1', 'bronze'); // value = 3

        await expect(sourceCell).toBeVisible();

        // Start batch then copy the source cell
        await page.locator('button', { hasText: 'Start Batch' }).click();
        await sourceCell.click();
        await page.keyboard.press('Control+c');

        // Paste into target cell — should stage as pending batch edit
        await targetCell.click();
        await page.keyboard.press('Control+v');

        // Wait for cell to exit inline editing state after paste
        await expect(targetCell.locator('input')).toHaveCount(0);

        await expect(targetCell).toHaveText('1'); // pasted value from source
        await expect(targetCell).toHaveClass(/ag-cell-batch-edit/); // pending, not committed

        // Source cell is unmodified and not marked as pending
        await expect(sourceCell).toHaveText('1');
        await expect(sourceCell).not.toHaveClass(/ag-cell-batch-edit/);

        // Commit — pending paste value is now written to data
        await page.locator('button', { hasText: 'Commit Batch' }).click();
        await expect(targetCell).toHaveText('1');
        await expect(targetCell).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test.typescript('Copy reflects pending batch value not committed data', async ({ page, agIdFor }) => {
        // Grant clipboard permissions so AG Grid can use navigator.clipboard
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Row 0: gold=1. Row 1: silver=1 (initial)
        const editCell = agIdFor.cell('0', 'gold');
        const targetCell = agIdFor.cell('1', 'silver'); // initial value = 1

        await expect(editCell).toBeVisible();

        // Start batch and edit row 0 gold to 99 — this is now a pending batch value
        await page.locator('button', { hasText: 'Start Batch' }).click();
        await editCell.dblclick();
        const cellEditor = editCell.locator('input');
        await expect(cellEditor).toBeVisible();
        await page.keyboard.type('99');
        await page.keyboard.press('Enter');
        await expect(editCell).toHaveText('99');
        await expect(editCell).toHaveClass(/ag-cell-batch-edit/);

        // Copy the cell — clipboard should contain the pending value (99), not committed data (1)
        await editCell.click();
        await page.keyboard.press('Control+c');

        // Paste into another cell — should receive the pending value 99
        await targetCell.click();
        await page.keyboard.press('Control+v');

        // Wait for cell to exit inline editing state after paste
        await expect(targetCell.locator('input')).toHaveCount(0);

        await expect(targetCell).toHaveText('99'); // pending value was copied, not committed value
        await expect(targetCell).toHaveClass(/ag-cell-batch-edit/); // paste staged as pending

        // Cancel — both cells revert to committed data
        await page.locator('button', { hasText: 'Cancel Batch' }).click();
        await expect(editCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(targetCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(editCell).toHaveText('1'); // reverted to original
        await expect(targetCell).toHaveText('1'); // reverted to original
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
    test.eachFramework(
        'cellValueChanged is deferred until the batch is committed',
        async ({ agIdFor, page, remoteGrid }) => {
            // Documented claim: "cellValueChanged and rowValueChanged are deferred - they only fire when
            // commitBatchEdit() is called."
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);

            const cell = agIdFor.cell('0', 'gold');
            await expect(cell).toBeVisible();

            await remoteApi.startBatchEdit();
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await expect(cellEditor).toBeVisible();
            await page.keyboard.type('100');
            await page.keyboard.press('Enter');
            await expect(cell).toHaveText('100');
            await expect(cell).toHaveClass(/ag-cell-batch-edit/);

            // Nothing fired while the edit is only pending.
            expect(await remoteGrid.waitForEventlog(250)).toEqual([]);

            await remoteApi.commitBatchEdit();

            // Exactly one event, carrying the committed transition.
            expect(await remoteGrid.waitForEventlog(250)).toEqual([
                ['cellValueChanged', { newValue: 100, oldValue: 1, source: 'edit' }],
            ]);
        }
    );

    test.eachFramework('cancelBatchEdit fires no value-changed events', async ({ agIdFor, page, remoteGrid }) => {
        // Documented claim: "If cancelBatchEdit() is called instead, pending values are discarded and
        // no value-changed events fire."
        const remoteApi = remoteGrid(page, '1');
        await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);

        const cell = agIdFor.cell('0', 'gold');
        await expect(cell).toBeVisible();

        await remoteApi.startBatchEdit();
        await cell.dblclick();
        await expect(cell.locator('input')).toBeVisible();
        await page.keyboard.type('100');
        await page.keyboard.press('Enter');
        await expect(cell).toHaveText('100');

        expect(await remoteGrid.waitForEventlog(250)).toEqual([]);

        await remoteApi.cancelBatchEdit();

        await expect(cell).toHaveText('1');
        await expect(cell).not.toHaveClass(/ag-cell-batch-edit/);
        expect(await remoteGrid.waitForEventlog(250)).toEqual([]);
    });

    test.eachFramework(
        'batchEditingStarted and batchEditingStopped are dispatched',
        async ({ agIdFor, page, remoteGrid }) => {
            // Documented claim: "Two batch-specific events are also available" - batchEditingStarted and
            // batchEditingStopped.
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.logEvent('batchEditingStarted', []);
            await remoteApi.logEvent('batchEditingStopped', ['changes']);

            const cell = agIdFor.cell('0', 'gold');
            await expect(cell).toBeVisible();

            await remoteApi.startBatchEdit();
            await cell.dblclick();
            await expect(cell.locator('input')).toBeVisible();
            await page.keyboard.type('100');
            await page.keyboard.press('Enter');
            await expect(cell).toHaveText('100');

            // The started event is dispatched on the first real edit, before any commit.
            let eventLog = await remoteGrid.waitForEventlog(250);
            expect(eventLog.map(([type]) => type)).toEqual(['batchEditingStarted']);

            await remoteApi.commitBatchEdit();

            eventLog = await remoteGrid.waitForEventlog(250);
            expect(eventLog.map(([type]) => type)).toEqual(['batchEditingStarted', 'batchEditingStopped']);
            expect(eventLog[1][1].changes).toEqual([
                expect.objectContaining({ columnId: 'gold', newValue: 100, oldValue: 1 }),
            ]);
        }
    );

    test.eachFramework(
        'Aggregation uses committed data until the batch is committed',
        async ({ agIdFor, page, remoteGrid }) => {
            // Documented claim: "Data features (sorting, filtering, grouping, aggregation) use committed data
            // until the batch is committed." Age has aggFunc 'avg' and grandTotalRow is 'bottom'.
            const remoteApi = remoteGrid(page, '1');
            const ageCell = agIdFor.cell('0', 'age');
            const grandTotalAge = agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'age').first();

            await expect(ageCell).toBeVisible();
            await expect(grandTotalAge).toBeVisible();
            const committedAverage = (await grandTotalAge.innerText()).trim();
            expect(committedAverage).not.toBe('');

            await remoteApi.startBatchEdit();
            await ageCell.dblclick();
            await expect(ageCell.locator('input')).toBeVisible();
            await page.keyboard.type('999');
            await page.keyboard.press('Enter');

            // The edited cell shows the pending value...
            await expect(ageCell).toHaveText('999');
            await expect(ageCell).toHaveClass(/ag-cell-batch-edit/);
            // ...but the grand total row still aggregates the committed data.
            await expect(grandTotalAge).toHaveText(committedAverage);

            await remoteApi.commitBatchEdit();

            await expect(ageCell).not.toHaveClass(/ag-cell-batch-edit/);
            await expect(grandTotalAge).not.toHaveText(committedAverage);
        }
    );

    test.eachFramework('Get Editing Cells reports the open editor', async ({ agIdFor, page, remoteGrid }) => {
        // The example exposes api.getEditingCells() behind the 'Get Editing Cells' button.
        const remoteApi = remoteGrid(page, '1');
        const consoleLines: string[] = [];
        page.on('console', (message) => consoleLines.push(message.text()));

        const cell = agIdFor.cell('0', 'gold');
        await expect(cell).toBeVisible();

        await remoteApi.startBatchEdit();
        await cell.dblclick();
        await expect(cell.locator('input')).toBeVisible();

        const editingCellCount = await page.evaluate(() => (window as any).getGridApi('1').getEditingCells().length);
        expect(editingCellCount).toBe(1);

        await page.locator('button', { hasText: 'Get Editing Cells' }).click();
        await expect.poll(() => consoleLines.some((line) => line.includes('Editing cells:'))).toBe(true);
    });
});
