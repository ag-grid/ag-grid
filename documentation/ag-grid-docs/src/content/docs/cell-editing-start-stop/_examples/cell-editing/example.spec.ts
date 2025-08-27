import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

import type { ICellEditorParams } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.skip(true, 'Skipped until Math.random() fixed');
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
        await expect(cell).toHaveText('Mary'); // verify the cell has the new value
    });

    test.describe('Events', () => {
        test.use({ agModules: ['CustomEditorModule'] });

        test.beforeEach(async ({ page }) => {
            // TestEditor to capture non-event actions
            addCustomEditor(page);
        });

        test.eachFramework('Start - Change - Stop', async ({ page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await cellEditor.focus();
            await expect(cellEditor).toBeVisible();
            await expect(cellEditor).toHaveValue('Alice');
            await expect(cellEditor).toBeFocused();

            await page.keyboard.type('Fred');
            await page.keyboard.press('Enter');

            const eventLog = remoteGrid.eventLog;

            expect(eventLog).toEqual([
                ['isCancelBeforeStart', []],
                ['cellEditingStarted', {}],
                ['isCancelAfterEnd', []],
                ['getValue', []],
                ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                ['cellEditingStopped', { newValue: 'AliceFred', oldValue: 'Alice' }],
            ]);
        });

        test.eachFramework('Edit + Enter', async ({ page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await cellEditor.focus();
            await expect(cellEditor).toBeVisible();
            await expect(cellEditor).toHaveValue('Alice');
            await expect(cellEditor).toBeFocused();

            await page.keyboard.type('Fred');
            await page.keyboard.press('Enter');

            const eventLog = remoteGrid.eventLog;
            expect(eventLog).toEqual([
                ['isCancelBeforeStart', []],
                ['cellEditingStarted', {}],
                ['isCancelAfterEnd', []],
                ['getValue', []],
                ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                ['cellEditingStopped', { newValue: 'AliceFred', oldValue: 'Alice' }],
            ]);
        });

        test.eachFramework('Edit + Cancel', async ({ page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await cellEditor.focus();
            await expect(cellEditor).toBeVisible();
            await expect(cellEditor).toHaveValue('Alice');
            await expect(cellEditor).toBeFocused();

            await page.keyboard.type('Fred');
            await page.keyboard.press('Escape');

            const eventLog = remoteGrid.eventLog;

            expect(eventLog).toEqual([
                ['isCancelBeforeStart', []],
                ['cellEditingStarted', {}],
                ['cellEditingStopped', { newValue: undefined, oldValue: 'Alice' }],
            ]);
            expect(cell).toHaveText('Alice');
        });

        test.eachFramework('Edit + CancelBeforeStart', async ({ page, remoteGrid, agFramework }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            await page.evaluate(() => {
                (window as any).isCancelBeforeStart = true;
            });

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await expect(cellEditor).not.toBeAttached();

            const eventLog = remoteGrid.eventLog;

            if (agFramework.startsWith('react')) {
                expect(eventLog).toEqual([
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', {}],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Alice' }],
                ]);
            } else {
                expect(eventLog).toEqual([
                    ['isCancelBeforeStart', []],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Alice' }],
                    ['cellEditingStarted', {}],
                ]);
            }

            expect(cell).toHaveText('Alice');
        });

        test.eachFramework('Edit + Enter + CancelAfterEnd', async ({ page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            await page.evaluate(() => {
                (window as any).isCancelAfterEnd = true;
            });

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await cellEditor.focus();
            await expect(cellEditor).toBeVisible();
            await expect(cellEditor).toHaveValue('Alice');
            await expect(cellEditor).toBeFocused();

            await page.keyboard.type('Fred');
            await page.keyboard.press('Enter');

            const eventLog = remoteGrid.eventLog;

            expect(eventLog).toEqual([
                ['isCancelBeforeStart', []],
                ['cellEditingStarted', {}],
                ['isCancelAfterEnd', []],
                ['cellEditingStopped', { newValue: undefined, oldValue: 'Alice' }],
            ]);

            expect(cell).toHaveText('Alice');
        });

        test.eachFramework('Edit + Editor + stopEdit commit', async ({ page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
            await setEditor(page, 'firstName', 'TestEditor');

            await remoteApi.logEvent('cellEditingStarted', []);
            await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
            await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue']);

            const cell = page.getByRole('gridcell', { name: 'Alice' });
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await cellEditor.focus();
            await expect(cellEditor).toBeVisible();
            await expect(cellEditor).toHaveValue('Alice');
            await expect(cellEditor).toBeFocused();

            await page.keyboard.type('Fred');

            await remoteApi.stopEditing();

            const eventLog = remoteGrid.eventLog;
            expect(eventLog).toEqual([
                ['isCancelBeforeStart', []],
                ['cellEditingStarted', {}],
                ['isCancelAfterEnd', []],
                ['getValue', []],
                ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                ['cellEditingStopped', { newValue: 'AliceFred', oldValue: 'Alice' }],
            ]);

            await expect(cell).toHaveText('AliceFred');
        });
    });

    test.vanilla('Double-click Edit and click another cell', async ({ page, agIdFor, remoteGrid }) => {
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
        await cell.dblclick();
        await page.keyboard.type('Fred');

        const anotherCell = agIdFor.cell('1', 'firstName');
        await anotherCell.click();

        const eventLog = remoteGrid.eventLog;

        expect(eventLog.length).toBe(3);
        expect(eventLog).toEqual([
            ['cellEditingStarted', {}],
            [
                'cellValueChanged',
                {
                    newValue: 'Fred',
                    oldValue: 'Mary',
                    source: 'edit',
                },
            ],
            [
                'cellEditingStopped',
                {
                    newValue: 'Fred',
                    oldValue: 'Mary',
                },
            ],
        ]);
    });
});

const addCustomEditor = (page: Page) => {
    page.addInitScript(() => {
        (window as any).TestEditor = class TestEditor {
            eInput?: HTMLInputElement;
            params?: ICellEditorParams;

            getGui(): HTMLElement {
                return this.eInput!;
            }

            // @ts-ignore
            init(params: ICellEditorParams) {
                // (window as any).logEvent?.('init', []);
                this.eInput = document.createElement('input');
                this.eInput.type = 'text';
                this.eInput.value = params.value;
            }

            getValue(): string | null {
                (window as any).logEvent?.('getValue', []);
                return this.eInput?.value ?? null;
            }

            isCancelAfterEnd(): boolean {
                (window as any).logEvent?.('isCancelAfterEnd', []);
                return (window as any).isCancelAfterEnd;
            }

            isCancelBeforeStart?(): boolean {
                (window as any).logEvent?.('isCancelBeforeStart', []);
                return (window as any).isCancelBeforeStart;
            }

            afterGuiAttached() {
                this.eInput?.focus();
            }
        };
    });
};

const setEditor = async (page: Page, field: string, editor: string) =>
    await page.evaluate(`
        window.getGridApi('1').updateGridOptions({
            columnDefs: [
                {
                    field: '${field}',
                    editable: true,
                    cellEditor: window.${editor},
                },
            ],
        })
`);
