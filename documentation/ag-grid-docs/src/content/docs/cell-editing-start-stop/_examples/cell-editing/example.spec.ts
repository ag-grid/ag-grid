import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('dblclick', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'firstName');

        // initiate cell editing by double clicking the cell
        await cell.dblclick();
        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.type('Fred'); // type in a new value
        await page.keyboard.press('Enter'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('Fred'); // verify the cell has the new value
    });

    test.eachFramework('click + commit', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'firstName');

        await cell.click(); // click the cell to focus it
        await page.keyboard.type('Fred'); // type in a new value

        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.press('Enter'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('Fred'); // verify the cell has the new value
    });

    test.eachFramework('type start + cancel', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'firstName');

        await cell.click(); // click the cell to focus it
        await page.keyboard.type('Fred'); // type in a new value

        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        await page.keyboard.press('Escape'); // press Enter to save the value

        await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
        await expect(cell).toHaveText('Bob'); // verify the cell has the new value
    });

    test.vanilla('Events', async ({ page, agIdFor, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');
        await remoteApi.updateGridOptions({
            columnDefs: [
                {
                    field: 'firstName',
                    editable: true,
                },
            ],
        });

        await remoteApi.logEvent('cellEditingStarted', []);
        await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
        await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

        const cell = agIdFor.cell('0', 'firstName');
        await cell.click();
        await page.keyboard.type('Fred');
        await page.keyboard.press('Enter');

        const eventLog = remoteGrid.eventLog;

        expect(eventLog.length).toBe(3);
        expect(eventLog).toEqual([
            ['cellEditingStarted', {}],
            [
                'cellValueChanged',
                {
                    newValue: 'Fred',
                    oldValue: 'Bob',
                    source: 'edit',
                },
            ],
            [
                'cellEditingStopped',
                {
                    newValue: 'Fred',
                    oldValue: 'Bob',
                },
            ],
        ]);
    });
});
