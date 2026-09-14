import { describe, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

import type { ICellEditorParams } from 'ag-grid-community';

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

    describe('edit + stop/cancel', () => {
        test.eachFramework('dblclick + stop', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page);
            const cell = agIdFor.cell('0', 'firstName');

            // initiate cell editing by double clicking the cell
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await expect(cellEditor).toBeVisible();

            await page.keyboard.type('Fred'); // type in a new value

            await remoteApi.stopEditing();

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell).toHaveText('Fred'); // verify the cell has the new value
        });

        test.eachFramework('dblclick + cancel', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page);
            const cell = agIdFor.cell('0', 'firstName');

            // initiate cell editing by double clicking the cell
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await expect(cellEditor).toBeVisible();

            await page.keyboard.type('Fred'); // type in a new value

            await remoteApi.stopEditing(true);

            await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
            await expect(cell).toHaveText('Bob'); // verify the cell has the new value
        });
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

    test.describe('Events', () => {
        test.use({ agModules: ['CustomEditorModule'] });

        test.beforeEach(async ({ page }) => {
            // TestEditor to capture non-event actions
            addCustomEditor(page);
        });

        [{ readOnlyEdit: false }, { readOnlyEdit: true }].forEach(({ readOnlyEdit }) => {
            test.eachFramework(`Start - Change - Stop [readOnlyEdit=${readOnlyEdit}]`, async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');
                await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);

                await remoteApi.setGridOption('readOnlyEdit', false);

                await setEditor(page, 'firstName', 'TestEditor');

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = page.getByRole('gridcell', { name: 'Alice' });
                await cell.dblclick();
                const cellEditor = cell.locator('input');
                await cellEditor.focus();
                await expect(cellEditor).toBeVisible();
                await expect(cellEditor).toHaveValue('Alice');
                await expect(cellEditor).toBeFocused();

                await page.keyboard.type('Fred');
                await page.keyboard.press('Enter');

                const eventLog = await remoteGrid.waitForEventlog(250);

                if (readOnlyEdit) {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        [
                            'cellEditingStarted',
                            {
                                value: 'Alice',
                            },
                        ],
                        ['isCancelAfterEnd', []],
                        ['getValue', []],
                        [
                            'cellValueChanged',
                            {
                                newValue: 'AliceFred',
                                oldValue: 'Alice',
                                source: 'edit',
                            },
                        ],
                        [
                            'cellEditingStopped',
                            {
                                newValue: 'AliceFred',
                                oldValue: 'Alice',
                                value: 'AliceFred',
                                valueChanged: true,
                            },
                        ],
                    ]);
                } else {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        ['cellEditingStarted', { value: 'Alice' }],
                        ['isCancelAfterEnd', []],
                        ['getValue', []],
                        ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                        [
                            'cellEditingStopped',
                            { newValue: 'AliceFred', oldValue: 'Alice', value: 'AliceFred', valueChanged: true },
                        ],
                    ]);
                }
            });

            test.eachFramework(`Edit + Enter [readOnlyEdit=${readOnlyEdit}]`, async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');
                await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
                await setEditor(page, 'firstName', 'TestEditor');

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = page.getByRole('gridcell', { name: 'Alice' });
                await cell.dblclick();
                const cellEditor = cell.locator('input');
                await cellEditor.focus();
                await expect(cellEditor).toBeVisible();
                await expect(cellEditor).toHaveValue('Alice');
                await expect(cellEditor).toBeFocused();

                await page.keyboard.type('Fred');
                await page.keyboard.press('Enter');

                const eventLog = await remoteGrid.waitForEventlog(250);

                if (readOnlyEdit) {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        [
                            'cellEditingStarted',
                            {
                                value: 'Alice',
                            },
                        ],
                        ['isCancelAfterEnd', []],
                        ['getValue', []],
                        [
                            'cellValueChanged',
                            {
                                newValue: 'AliceFred',
                                oldValue: 'Alice',
                                source: 'edit',
                            },
                        ],
                        [
                            'cellEditingStopped',
                            {
                                newValue: 'AliceFred',
                                oldValue: 'Alice',
                                value: 'AliceFred',
                                valueChanged: true,
                            },
                        ],
                    ]);
                } else {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        ['cellEditingStarted', { value: 'Alice' }],
                        ['isCancelAfterEnd', []],
                        ['getValue', []],
                        ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                        [
                            'cellEditingStopped',
                            { newValue: 'AliceFred', oldValue: 'Alice', value: 'AliceFred', valueChanged: true },
                        ],
                    ]);
                }
            });

            test.eachFramework(`Edit + Cancel [readOnlyEdit=${readOnlyEdit}]`, async ({ page, remoteGrid }) => {
                const remoteApi = remoteGrid(page, '1');
                await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
                await setEditor(page, 'firstName', 'TestEditor');

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = page.getByRole('gridcell', { name: 'Alice' });
                await cell.dblclick();
                const cellEditor = cell.locator('input');
                await cellEditor.focus();
                await expect(cellEditor).toBeVisible();
                await expect(cellEditor).toHaveValue('Alice');
                await expect(cellEditor).toBeFocused();

                await page.keyboard.type('Fred');
                await page.keyboard.press('Escape');

                const eventLog = await remoteGrid.waitForEventlog(250);

                if (readOnlyEdit) {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        [
                            'cellEditingStarted',
                            {
                                value: 'Alice',
                            },
                        ],
                        [
                            'cellEditingStopped',
                            {
                                newValue: undefined,
                                oldValue: 'Alice',
                                value: 'Alice',
                                valueChanged: false,
                            },
                        ],
                    ]);
                } else {
                    expect(eventLog).toEqual([
                        ['isCancelBeforeStart', []],
                        ['cellEditingStarted', { value: 'Alice' }],
                        [
                            'cellEditingStopped',
                            { newValue: undefined, oldValue: 'Alice', value: 'Alice', valueChanged: false },
                        ],
                    ]);
                    await expect(cell).toHaveText('Alice');
                }
            });

            test.eachFramework(
                `Edit + CancelBeforeStart [readOnlyEdit=${readOnlyEdit}]`,
                async ({ page, remoteGrid, agFramework }) => {
                    const remoteApi = remoteGrid(page, '1');
                    await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
                    await setEditor(page, 'firstName', 'TestEditor');

                    await remoteApi.logEvent('cellEditingStarted', ['value']);
                    await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                    await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                    await page.evaluate(() => {
                        (window as any).isCancelBeforeStart = true;
                    });

                    const cell = page.getByRole('gridcell', { name: 'Alice' });
                    await cell.dblclick();
                    const cellEditor = cell.locator('input');
                    await expect(cellEditor).not.toBeAttached();

                    const eventLog = await remoteGrid.waitForEventlog(250);

                    if (readOnlyEdit) {
                        if (agFramework.startsWith('react')) {
                            expect(eventLog).toEqual([
                                ['isCancelBeforeStart', []],
                                [
                                    'cellEditingStarted',
                                    {
                                        value: 'Alice',
                                    },
                                ],
                                [
                                    'cellEditingStopped',
                                    {
                                        newValue: undefined,
                                        oldValue: 'Alice',
                                        value: 'Alice',
                                        valueChanged: false,
                                    },
                                ],
                            ]);
                        } else {
                            expect(eventLog).toEqual([['isCancelBeforeStart', []]]);
                        }
                    } else {
                        if (agFramework.startsWith('react')) {
                            expect(eventLog).toEqual([
                                ['isCancelBeforeStart', []],
                                ['cellEditingStarted', { value: 'Alice' }],
                                [
                                    'cellEditingStopped',
                                    { newValue: undefined, oldValue: 'Alice', value: 'Alice', valueChanged: false },
                                ],
                            ]);
                        } else {
                            expect(eventLog).toEqual([['isCancelBeforeStart', []]]);
                        }

                        await expect(cell).toHaveText('Alice');
                    }
                }
            );

            test.eachFramework(
                `Edit + Enter + CancelAfterEnd [readOnlyEdit=${readOnlyEdit}]`,
                async ({ page, remoteGrid }) => {
                    const remoteApi = remoteGrid(page, '1');
                    await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
                    await setEditor(page, 'firstName', 'TestEditor');

                    await remoteApi.logEvent('cellEditingStarted', ['value']);
                    await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                    await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

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

                    const eventLog = await remoteGrid.waitForEventlog(250);

                    if (readOnlyEdit) {
                        expect(eventLog).toEqual([
                            ['isCancelBeforeStart', []],
                            [
                                'cellEditingStarted',
                                {
                                    value: 'Alice',
                                },
                            ],
                            ['isCancelAfterEnd', []],
                            [
                                'cellEditingStopped',
                                {
                                    newValue: undefined,
                                    oldValue: 'Alice',
                                    value: 'Alice',
                                    valueChanged: false,
                                },
                            ],
                        ]);
                    } else {
                        expect(eventLog).toEqual([
                            ['isCancelBeforeStart', []],
                            ['cellEditingStarted', { value: 'Alice' }],
                            ['isCancelAfterEnd', []],
                            [
                                'cellEditingStopped',
                                { newValue: undefined, oldValue: 'Alice', value: 'Alice', valueChanged: false },
                            ],
                        ]);

                        await expect(cell).toHaveText('Alice');
                    }
                }
            );

            test.eachFramework(
                `Edit + Editor + stopEdit commit [readOnlyEdit=${readOnlyEdit}]`,
                async ({ page, remoteGrid }) => {
                    const remoteApi = remoteGrid(page, '1');
                    await remoteApi.setGridOption('rowData', [{ firstName: 'Alice', lastName: 'Johnson' }]);
                    await setEditor(page, 'firstName', 'TestEditor');

                    await remoteApi.logEvent('cellEditingStarted', ['value']);
                    await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                    await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                    const cell = page.getByRole('gridcell', { name: 'Alice' });
                    await cell.dblclick();
                    const cellEditor = cell.locator('input');
                    await cellEditor.focus();
                    await expect(cellEditor).toBeVisible();
                    await expect(cellEditor).toHaveValue('Alice');
                    await expect(cellEditor).toBeFocused();

                    await page.keyboard.type('Fred');

                    await remoteApi.stopEditing();

                    const eventLog = await remoteGrid.waitForEventlog(250);

                    if (readOnlyEdit) {
                        expect(eventLog).toEqual([
                            ['isCancelBeforeStart', []],
                            [
                                'cellEditingStarted',
                                {
                                    value: 'Alice',
                                },
                            ],
                            ['isCancelAfterEnd', []],
                            ['getValue', []],
                            [
                                'cellValueChanged',
                                {
                                    newValue: 'AliceFred',
                                    oldValue: 'Alice',
                                    source: 'edit',
                                },
                            ],
                            [
                                'cellEditingStopped',
                                {
                                    newValue: 'AliceFred',
                                    oldValue: 'Alice',
                                    value: 'AliceFred',
                                    valueChanged: true,
                                },
                            ],
                        ]);
                    } else {
                        expect(eventLog).toEqual([
                            ['isCancelBeforeStart', []],
                            ['cellEditingStarted', { value: 'Alice' }],
                            ['isCancelAfterEnd', []],
                            ['getValue', []],
                            ['cellValueChanged', { newValue: 'AliceFred', oldValue: 'Alice', source: 'edit' }],
                            [
                                'cellEditingStopped',
                                { newValue: 'AliceFred', oldValue: 'Alice', value: 'AliceFred', valueChanged: true },
                            ],
                        ]);

                        await expect(cell).toHaveText('AliceFred');
                    }
                }
            );

            test.vanilla(
                `Double-click Edit and click another cell [readOnlyEdit=${readOnlyEdit}]`,
                async ({ page, agIdFor, remoteGrid }) => {
                    const remoteApi = remoteGrid(page, '1');
                    await remoteApi.updateGridOptions({
                        columnDefs: [
                            {
                                field: 'firstName',
                                editable: true,
                            },
                        ],
                    });

                    await remoteApi.logEvent('cellEditingStarted', ['value']);
                    await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                    await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                    const cell = agIdFor.cell('0', 'firstName');
                    await cell.dblclick();
                    await page.keyboard.type('Fred');

                    const anotherCell = agIdFor.cell('1', 'firstName');
                    await anotherCell.click();

                    const eventLog = await remoteGrid.waitForEventlog(250);

                    if (readOnlyEdit) {
                        expect(eventLog).toEqual([
                            [
                                'cellEditingStarted',
                                {
                                    value: 'Bob',
                                },
                            ],
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
                                    value: 'Fred',
                                    valueChanged: true,
                                },
                            ],
                        ]);
                    } else {
                        expect(eventLog.length).toBe(3);
                        expect(eventLog).toEqual([
                            ['cellEditingStarted', { value: 'Bob' }],
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
                                    value: 'Fred',
                                    valueChanged: true,
                                },
                            ],
                        ]);
                    }
                }
            );
        });
    });

    describe('editing API buttons', () => {
        // Every `edit...` button calls api.startEditingCell on row 0 of the 'lastName' column,
        // differing only in the `key` and `rowPinned` it passes.
        const editingInput = (page: Page) => page.locator('.ag-cell-inline-editing input.ag-input-field-input');

        test.eachFramework('edit (0) starts editing with the existing value', async ({ page, agIdFor }) => {
            await page.getByRole('button', { name: 'edit (0)' }).click();

            const cell = agIdFor.cell('0', 'lastName');
            await expect(cell.locator('input')).toBeVisible();
            // No key was passed, so the editor opens on the current value.
            await expect(cell.locator('input')).toHaveValue('Harrison');
        });

        test.eachFramework('edit (0, Backspace) clears the contents first', async ({ page, agIdFor }) => {
            await page.getByRole('button', { name: 'edit (0, Backspace)' }).click();

            const cell = agIdFor.cell('0', 'lastName');
            await expect(cell.locator('input')).toBeVisible();
            await expect(cell.locator('input')).toHaveValue('');
        });

        test.eachFramework("edit (0, 'T') seeds the editor with the pressed character", async ({ page, agIdFor }) => {
            await page.getByRole('button', { name: "edit (0, 'T')" }).click();

            const cell = agIdFor.cell('0', 'lastName');
            await expect(cell.locator('input')).toBeVisible();
            await expect(cell.locator('input')).toHaveValue('T');
        });

        // rowPinned: 'top' / 'bottom' target row 0 of pinnedTopRowData / pinnedBottomRowData,
        // whose lastName is '##' in both.
        for (const { label, container } of [
            { label: 'edit (0, Top)', container: '.ag-grid-pinned-top-rows-container' },
            { label: 'edit (0, Bottom)', container: '.ag-grid-pinned-bottom-rows-container' },
        ]) {
            test.eachFramework(`${label} edits the pinned row`, async ({ page }) => {
                await page.getByRole('button', { name: label }).click();

                const input = page.locator(`${container} .ag-cell-inline-editing input.ag-input-field-input`);
                await expect(input).toBeVisible();
                await expect(input).toHaveValue('##');
            });
        }

        test.eachFramework('stop () ends editing, keeping the typed value', async ({ page, agIdFor }) => {
            await page.getByRole('button', { name: 'edit (0)' }).click();

            const cell = agIdFor.cell('0', 'lastName');
            await cell.locator('input').fill('Smith');

            await page.getByRole('button', { name: 'stop ()' }).click();

            await expect(editingInput(page)).toHaveCount(0);
            await expect(cell).toHaveText('Smith');
        });

        test.eachFramework('next () and previous () move the edit between cells', async ({ page, agIdFor }) => {
            await page.getByRole('button', { name: 'edit (0)' }).click();
            await expect(agIdFor.cell('0', 'lastName').locator('input')).toBeVisible();

            // tabToNextCell() moves editing on to the column after 'lastName'.
            await page.getByRole('button', { name: 'next ()' }).click();
            await expect(agIdFor.cell('0', 'gender').locator('input')).toBeVisible();
            await expect(agIdFor.cell('0', 'lastName').locator('input')).toHaveCount(0);

            // tabToPreviousCell() moves it back.
            await page.getByRole('button', { name: 'previous ()' }).click();
            await expect(agIdFor.cell('0', 'lastName').locator('input')).toBeVisible();
            await expect(agIdFor.cell('0', 'gender').locator('input')).toHaveCount(0);
        });

        test.eachFramework('which () reports the editing cell to the console', async ({ page }) => {
            const logs: string[] = [];
            page.on('console', (message) => logs.push(message.text()));

            // With nothing editing, getEditingCells() returns an empty array.
            await page.getByRole('button', { name: 'which ()' }).click();
            await expect.poll(() => logs).toContain('no cells are editing');

            await page.getByRole('button', { name: 'edit (0)' }).click();
            await expect(editingInput(page)).toBeVisible();

            await page.getByRole('button', { name: 'which ()' }).click();
            await expect.poll(() => logs).toContain('editing cell is: row = 0, col = lastName, floating = undefined');
        });
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
