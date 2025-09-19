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
});
