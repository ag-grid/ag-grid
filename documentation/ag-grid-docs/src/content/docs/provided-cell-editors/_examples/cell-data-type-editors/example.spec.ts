import { expect, test } from '@utils/grid/test-utils';

import type { GridOptions } from 'ag-grid-community';

test.agExample(import.meta, () => {
    let gridOptions: GridOptions;

    test.beforeEach(() => {
        gridOptions = {
            columnDefs: [
                { field: 'string', cellEditor: 'agTextCellEditor', editable: true },
                { field: 'number', cellEditor: 'agNumberCellEditor', editable: true },
            ],
            rowData: [{ string: 'red', number: 123 }],
        };
    });

    // AG-14947 - Safari doesn't focus string input fields when typing-to-start editing
    [
        { field: 'string', testInput: 'G' },
        { field: 'number', testInput: '1' },
    ].forEach(({ field, testInput }) => {
        test.vanilla(`click-type-edit ${field}`, async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.updateGridOptions(gridOptions);

            const cell = agIdFor.cell('0', field);
            await cell.click(); // click the cell to focus it
            await cell.press(testInput); // type in a new value

            const editor = cell.locator('input');
            await expect(editor).toBeVisible();
            await expect(editor).toBeFocused();

            await page.keyboard.press('Escape'); // press Enter to save the value
            await expect(editor).toHaveCount(0); // verify the cell editor is closed
        });
    });
});
