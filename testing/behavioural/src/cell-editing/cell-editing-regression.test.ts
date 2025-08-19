import { fireEvent, getByTestId, waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    DragAndDropModule,
    RichSelectModule,
    RowDragModule,
} from 'ag-grid-enterprise';

import {
    TestGridsManager,
    asyncSetTimeout,
    fakeElementAttribute,
    getAllRows,
    waitForInput,
    waitForPopup,
} from '../test-utils';
import { expect } from '../test-utils/matchers';

describe('Cell Editing Regression', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule, CellSelectionModule, ClipboardModule, DragAndDropModule, RowDragModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    // AG-15694
    describe('when data is null', () => {
        test.each([
            { field: 'string1', expected: '', popup: false },
            { field: 'string2', expected: '', popup: true },
        ])('valueFormatter', async ({ field, expected, popup }) => {
            const valueFormatter = vi.fn((params) => `Formatted: ${params.value}`);

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'string1', cellEditor: 'agTextCellEditor', valueFormatter },
                    { field: 'string2', cellEditor: 'agLargeTextCellEditor', valueFormatter },
                ],
                rowData: [
                    {
                        string1: undefined,
                        string2: undefined,
                    },
                ],
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.dblClick(cell);

            await asyncSetTimeout(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expect(inputElement).toHaveValue(expected as any);
            expect(valueFormatter).toHaveBeenCalled();
        });
    });

    // AG-15698 - row doesn't rerender after value is selected in rich select editor
    test('cell not refreshed after richSelectEditor select', async () => {
        // virtualList doesn't add option elements if the offsetHeight is 0, so we need to fake it
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'code',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        values: [0, 1, 2, 3],
                    },
                    valueGetter: ({ data: { code } }) => {
                        return {
                            0: '0 - zero',
                            1: '1 - one',
                            2: '2 - two',
                            3: '3 - three',
                        }[code];
                    },
                    valueSetter: ({ newValue, data }) => {
                        const valueChanged = data.code !== newValue;
                        if (valueChanged) {
                            data.code = newValue;
                        }

                        return valueChanged;
                    },
                    editable: true,
                },
            ],
            rowData: [{ code: 0 }, { code: 2 }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // FIRST EDIT
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'code'));
        await userEvent.dblClick(cell0);

        await asyncSetTimeout(1);

        const popup0 = await waitForPopup(gridDiv);
        const option0 = await waitFor(() => within(popup0).getByRole('option', { name: '1' }));

        const rect0 = option0.getBoundingClientRect();

        // agRichSelectCellEditor derives the item clicked from the click event, so we need to simulate a click with clientY
        // to ensure the correct item is selected
        fireEvent(
            option0,
            new MouseEvent('click', {
                bubbles: true,
                clientY: rect0.height * 2 - 1,
            })
        );

        await userEvent.click(option0);
        await asyncSetTimeout(1);

        expect(getAllRows(api)[0].data.code).toBe(1);
        expect(getAllRows(api)[1].data.code).toBe(2);
        expect(cell0).toHaveTextContent('1 - one');

        // SECOND EDIT
        const cell1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'code'));
        await userEvent.dblClick(cell1);

        await asyncSetTimeout(100);

        const popup1 = await waitForPopup(gridDiv);
        const option1 = await waitFor(() => within(popup1).getByRole('option', { name: '3' }));

        const rect1 = option1.getBoundingClientRect();

        // agRichSelectCellEditor derives the item clicked from the click event, so we need to simulate a click with clientY
        // to ensure the correct item is selected
        fireEvent(
            option1,
            new MouseEvent('click', {
                bubbles: true,
                clientY: rect1.height * 10 - 1,
            })
        );

        await userEvent.click(option1);
        await asyncSetTimeout(100);

        expect(getAllRows(api)[0].data.code).toBe(1);
        expect(getAllRows(api)[1].data.code).toBe(3);
        expect(cell1).toHaveTextContent('3 - three');
    });

    // Regression test for first cell edit event newValue is Symbol(unedited)
    test('newValue=Symbol', async () => {
        const onCellEditingStopped = vi.fn();
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'field',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            editType: 'fullRow',
            rowData: [{ field: 0 }, { field: 1 }],
            onCellEditingStopped: ({ newValue }) => onCellEditingStopped(newValue),
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
        await userEvent.click(cell);

        await userEvent.keyboard('1');
        const inputElement = await waitForInput(gridDiv, cell, { popup: false });
        await userEvent.type(inputElement, '2');
        await userEvent.keyboard('{Enter}');

        expect(cell).toHaveTextContent('12');

        expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
        expect(onCellEditingStopped).toHaveBeenCalledWith(12);
    });

    // onCellEditingStopped.newValue for v33 returns the editor value, even if no edit occurred
    describe('onCellEditingStopped', () => {
        test.each([
            { action: undefined, expected: 'A Value' },
            { action: 'Test', expected: 'Test' },
        ])('newValue is $expected', async ({ action, expected }) => {
            const onCellEditingStopped = vi.fn();
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'field',
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                    },
                ],
                readOnlyEdit: true,
                rowData: [{ field: 'A Value' }],
                onCellEditingStopped: ({ newValue }) => onCellEditingStopped(newValue),
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
            await userEvent.dblClick(cell);

            const inputElement = await waitForInput(gridDiv, cell, { popup: false });
            if (action) {
                await userEvent.clear(inputElement);
                await userEvent.type(inputElement, action);
            }
            expect(inputElement).toHaveValue(expected);

            await userEvent.type(inputElement, '{Enter}');

            expect(cell).toHaveTextContent('A Value');

            expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
            expect(onCellEditingStopped).toHaveBeenCalledWith(expected);
        });
    });

    describe('AG-15699 - cellValueChange source', () => {
        let user: ReturnType<typeof userEvent.setup>;

        const testACell = async (
            onCellValueChanged: jest.Mock<any, any, any>,
            editAction: (api: GridApi, gridDiv: HTMLElement, cell: HTMLElement) => Promise<void>,
            extraOptions?: GridOptions
        ) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'field',
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                    },
                ],
                rowData: [{ field: 'A Value' }, { field: 'A 2nd Value' }],
                onCellValueChanged: ({ source }) => onCellValueChanged(source),
                ...extraOptions,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
            await editAction(api, gridDiv, cell);
            return onCellValueChanged;
        };

        beforeEach(() => {
            user = userEvent.setup({ skipHover: true });
        });

        test('dblClick edit should have source=edit', async () => {
            const onCellValueChanged = await testACell(jest.fn(), async (api, gridDiv, cell) => {
                await user.dblClick(cell);
                const inputElement = await waitForInput(gridDiv, cell);
                await user.type(inputElement, '15');
                await user.keyboard('{Enter}');
                expect(cell).toHaveTextContent('15');
            });

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith('edit');
        });

        test.skip('fillHandle edit should have source=rangeSvc', async () => {
            const onCellValueChanged = await testACell(
                jest.fn(),
                async (api, gridDiv, source) => {
                    const target = getByTestId(gridDiv, agTestIdFor.cell('1', 'field'));

                    // Use the abstracted helper function for complete fill handle operation
                    await performFillHandleDrag({ api, source, target });

                    expect(source).toHaveTextContent('A Value');
                    expect(target).toHaveTextContent('A Value');

                    expect(api.getCellValue({ rowNode: api.getRowNode('0')!, colKey: 'field' })).toEqual('A Value');
                    expect(api.getCellValue({ rowNode: api.getRowNode('1')!, colKey: 'field' })).toEqual('A Value');
                },
                {
                    cellSelection: {
                        handle: {
                            mode: 'fill',
                        },
                    },
                }
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
        });

        test('copy/paste edit should have source=paste', async () => {
            const onCellValueChanged = await testACell(jest.fn(), async (api, gridDiv, cell) => {
                await user.click(cell);
                const target = getByTestId(gridDiv, agTestIdFor.cell('1', 'field'));

                // Use the grid's built-in selection API, because jsdom's events click event doesn't trigger mouseDown correctly
                api.setFocusedCell(0, 'field');
                await user.keyboard('{Control>}c{/Control}');

                api.setFocusedCell(1, 'field');
                await user.keyboard('{Control>}v{/Control}');

                // give the grid time to re-render
                await asyncSetTimeout(1);

                expect(target).toHaveTextContent('A Value');
            });

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith('paste');
        });

        test('bulk edit should have source=bulk', async () => {
            const onCellValueChanged = await testACell(
                jest.fn(() => {
                    console.log();
                }),
                async (api, gridDiv, source) => {
                    const target = getByTestId(gridDiv, agTestIdFor.cell('1', 'field'));

                    await user.click(source);
                    api.setFocusedCell(0, 'field');
                    api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['field'] });

                    await userEvent.keyboard('1');
                    const input = await waitForInput(gridDiv, source);
                    await userEvent.type(input, '5');
                    await asyncSetTimeout(1);
                    expect(api.getEditingCells()).toHaveLength(1);
                    await userEvent.keyboard('{Control>}{Enter}{/Control}');
                    await asyncSetTimeout(100);

                    expect(source).toHaveTextContent('15');
                    expect(target).toHaveTextContent('15');

                    expect(api.getCellValue({ rowNode: api.getRowNode('0')!, colKey: 'field' })).toEqual('15');
                    expect(api.getCellValue({ rowNode: api.getRowNode('1')!, colKey: 'field' })).toEqual('15');
                },
                {
                    cellSelection: true,
                }
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(2);
            expect(onCellValueChanged).toHaveBeenNthCalledWith(1, 'bulk');
            expect(onCellValueChanged).toHaveBeenNthCalledWith(2, 'bulk');
        });

        test('ctrl-d should have source=paste', async () => {
            const onCellValueChanged = await testACell(
                jest.fn(),
                async (api, gridDiv, source) => {
                    const target = getByTestId(gridDiv, agTestIdFor.cell('1', 'field'));

                    api.setFocusedCell(0, 'field');
                    api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['field'] });

                    await userEvent.keyboard('{Control>}d{/Control}');
                    await asyncSetTimeout(1);

                    expect(source).toHaveTextContent('A Value');
                    expect(target).toHaveTextContent('A Value');

                    expect(api.getCellValue({ rowNode: api.getRowNode('0')!, colKey: 'field' })).toEqual('A Value');
                    expect(api.getCellValue({ rowNode: api.getRowNode('1')!, colKey: 'field' })).toEqual('A Value');
                },
                {
                    cellSelection: true,
                }
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith('paste');
        });
    });
});
