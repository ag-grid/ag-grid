import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

import type { ICellEditorParams } from 'ag-grid-community';

test.agExample(import.meta, () => {
    ['Enter', 'Escape', 'Tab'].forEach((key) => {
        test.vanilla(
            `Edit on cell with [${key}] when enableGroupEdits=true`,
            async ({ page, agIdFor, remoteGrid, request }) => {
                const response = await request.get('/example-assets/small-olympic-winners.json', {
                    ignoreHTTPSErrors: true,
                });
                const data = await response.json();

                const remoteApi = remoteGrid(page, '1');

                // Integration Testing with initial options
                await remoteApi.recreateGrid({
                    columnDefs: [
                        { field: 'country', rowGroup: true },
                        { field: 'year', pivot: true },
                        {
                            field: 'gold',
                            aggFunc: 'sum',
                        },
                        { field: 'silver', aggFunc: 'sum' },
                        { field: 'bronze', aggFunc: 'sum' },
                    ],
                    defaultColDef: {
                        flex: 1,
                        minWidth: 130,
                        editable: true,
                    },
                    autoGroupColumnDef: {
                        minWidth: 200,
                        editable: true,
                    },
                    // singleClickEdit: true,
                    enableGroupEdit: true,
                    pivotMode: true,
                    rowData: data,
                });

                await remoteApi.logEvent('cellEditingStarted', ['value']);
                await remoteApi.logEvent('cellValueChanged', ['newValue', 'oldValue', 'source']);
                await remoteApi.logEvent('cellEditingStopped', ['newValue', 'oldValue', 'value', 'valueChanged']);

                const cell = agIdFor.cell('row-group-country-Australia', 'pivot_year_2000_gold');
                await cell.dblclick();
                await page.keyboard.type('1234');
                await page.keyboard.press('Enter');

                const eventLog = await remoteGrid.waitForEventlog(250);

                // Not really supported but unintentionally available in 34.0.0, so all keys have the same outcome
                expect(eventLog.length).toBe(2);
                expect(eventLog).toEqual([
                    [
                        'cellEditingStarted',
                        {
                            value: 3,
                        },
                    ],
                    [
                        'cellEditingStopped',
                        {
                            newValue: undefined,
                            oldValue: undefined,
                            value: 1234,
                            valueChanged: true,
                        },
                    ],
                ]);
            }
        );
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
