import { expect, test } from '@utils/grid/test-utils';

import type { GridOptions } from 'ag-grid-community';

test.agExample(import.meta, () => {
    // RTI-3051 - Undo/Redo stack should grow/shrink
    test.eachFramework(`undo/redo stack should grow/shrink`, async ({ page, agIdFor, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');

        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(0);

        let cell = undefined;
        cell = agIdFor.cell('0', 'a');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(1);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);
        await page.waitForTimeout(100);

        cell = agIdFor.cell('0', 'b');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(2);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);
        await page.waitForTimeout(100);

        cell = agIdFor.cell('0', 'c');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(3);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);
        await page.waitForTimeout(100);

        await remoteApi.undoCellEditing();
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(2);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(1);
        await page.waitForTimeout(100);

        await remoteApi.undoCellEditing();
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(1);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(2);
        await page.waitForTimeout(100);

        await remoteApi.undoCellEditing();
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(0);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(3);
        await page.waitForTimeout(100);
    });

    // RTI-3051 - Undo/Redo stack should be limited by max stack size
    test.vanilla(`undo/redo stack should be limited by max stack size`, async ({ page, agIdFor, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');
        const data = await remoteApi.getGridOption('rowData');
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'a' },
                { field: 'b' },
                { field: 'c' },
                { field: 'd' },
                { field: 'e' },
                { field: 'f' },
                { field: 'g' },
                { field: 'h' },
            ],
            defaultColDef: {
                flex: 1,
                editable: true,
                enableCellChangeFlash: true,
            },
            rowData: data,
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            undoRedoCellEditing: true,
            undoRedoCellEditingLimit: 2,
        };
        await remoteApi.recreateGrid(gridOptions);

        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(0);

        let cell = undefined;
        cell = agIdFor.cell('0', 'a');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await page.waitForTimeout(100);
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(1);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);

        cell = agIdFor.cell('0', 'b');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await page.waitForTimeout(100);
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(2);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);

        cell = agIdFor.cell('0', 'c');
        await cell.dblclick(); // click the cell to focus it
        await page.keyboard.type('123'); // type in a new value
        await page.keyboard.press('Tab'); // confirm the edit
        await page.waitForTimeout(100);
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(2);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(0);

        await remoteApi.undoCellEditing();
        await page.waitForTimeout(100);
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(1);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(1);

        await remoteApi.undoCellEditing();
        await page.waitForTimeout(100);
        await expect(remoteApi.getCurrentUndoSize()).resolves.toBe(0);
        await expect(remoteApi.getCurrentRedoSize()).resolves.toBe(2);
    });

    // Docs: "Undo API: use the 'Undo' button to invoke gridApi.undoCellEditing()" /
    // "Redo API: use the 'Redo' button to invoke gridApi.redoCellEditing()"
    test.eachFramework(
        `undo restores the previous cell value and redo re-applies it`,
        async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            const cell = agIdFor.cell('0', 'a');
            await expect(cell).toHaveText('a-0');

            await cell.dblclick();
            const editor = cell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('123');
            await page.keyboard.press('Tab');
            await expect(cell).toHaveText('123');

            // Undo puts the original value back in the cell (not just the stack size).
            await remoteApi.undoCellEditing();
            await expect(cell).toHaveText('a-0');

            // Redo re-applies the edited value.
            await remoteApi.redoCellEditing();
            await expect(cell).toHaveText('123');
        }
    );

    // Docs: "Undo / Redo Limit: only 5 actions are allowed as `undoRedoCellEditingLimit=5`"
    test.eachFramework(`undo stack is capped at the example limit of 5`, async ({ page, agIdFor, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');

        for (const col of ['a', 'b', 'c', 'd', 'e', 'f']) {
            const cell = agIdFor.cell('0', col);
            await cell.dblclick();
            // fill() replaces the whole value: a double click only selects the word under the
            // pointer, which would leave the 'x-' prefix of 'x-0' in place.
            const editor = cell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('123');
            await page.keyboard.press('Tab');
            await expect(cell).toHaveText('123');
        }

        // Six edits were made, but the stack never grows past the configured limit of 5.
        await expect.poll(() => remoteApi.getCurrentUndoSize()).toBe(5);

        for (let i = 0; i < 5; i++) {
            await remoteApi.undoCellEditing();
        }
        await expect.poll(() => remoteApi.getCurrentUndoSize()).toBe(0);

        // The oldest edit (column 'a') was evicted from the stack, so it keeps the edited value...
        await expect(agIdFor.cell('0', 'a')).toHaveText('123');
        // ...while the five retained edits are reverted.
        for (const col of ['b', 'c', 'd', 'e', 'f']) {
            await expect(agIdFor.cell('0', col)).toHaveText(`${col}-0`);
        }
    });

    // Docs: "use the 'Undo' button to invoke gridApi.undoCellEditing()", plus the example's
    // "Available Undo's" / "Available Redo's" counters.
    test.eachFramework(`Undo button and counters track the undo stack`, async ({ page, agIdFor }) => {
        const undoBtn = page.locator('#undoBtn');
        const redoBtn = page.locator('#redoBtn');
        const undoInput = page.locator('#undoInput');
        const redoInput = page.locator('#redoInput');

        // On first render there is nothing to undo or redo.
        await expect(undoBtn).toBeDisabled();
        await expect(redoBtn).toBeDisabled();
        await expect(undoInput).toHaveValue('0');
        await expect(redoInput).toHaveValue('0');

        const cell = agIdFor.cell('0', 'a');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('123');
        await page.keyboard.press('Tab');
        await expect(cell).toHaveText('123');

        // After one edit the Undo button is enabled and the counter reports one available undo.
        await expect(undoBtn).toBeEnabled();
        await expect(undoInput).toHaveValue('1');

        // Clicking 'Undo' invokes gridApi.undoCellEditing() and reverts the cell.
        await undoBtn.click();
        await expect(cell).toHaveText('a-0');
    });

    // Docs: "Ctrl+Z: will undo the last cell edit(s)." The redo shortcut is platform specific
    // (Ctrl+Y on Windows/Linux, Cmd+Shift+Z on mac), so the shortcut for the current platform is used.
    test.eachFramework(`Ctrl+Z and the redo shortcut undo and redo an edit`, async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'a');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('123');
        await page.keyboard.press('Tab');
        await expect(cell).toHaveText('123');

        // "the grid needs focus for these shortcuts to have an effect"
        await cell.click();
        await page.keyboard.press('Control+z');
        await expect(cell).toHaveText('a-0');

        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+y');
        await expect(cell).toHaveText('123');
    });

    // Docs: an undo fires one `undoStarted`, zero to many `cellValueChanged`, then one `undoEnded`;
    // with nothing to undo the ended event still fires, with `operationPerformed: false`.
    test.eachFramework(
        `undo fires undoStarted, cellValueChanged and undoEnded in order`,
        async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            const cell = agIdFor.cell('0', 'a');
            await cell.dblclick();
            const editor = cell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('123');
            await page.keyboard.press('Tab');
            await expect(cell).toHaveText('123');

            await remoteApi.logEvent('undoStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue']);
            await remoteApi.logEvent('undoEnded', ['operationPerformed']);

            await remoteApi.undoCellEditing();
            await expect(cell).toHaveText('a-0');

            const eventLog = await remoteGrid.waitForEventlog(250);
            expect(eventLog).toEqual([
                ['undoStarted', {}],
                ['cellValueChanged', { newValue: 'a-0' }],
                ['undoEnded', { operationPerformed: true }],
            ]);

            // Nothing left to undo: started / ended still fire, but no operation is performed.
            eventLog.length = 0;
            await remoteApi.undoCellEditing();
            const emptyLog = await remoteGrid.waitForEventlog(250);
            expect(emptyLog).toEqual([
                ['undoStarted', {}],
                ['undoEnded', { operationPerformed: false }],
            ]);
        }
    );
});
