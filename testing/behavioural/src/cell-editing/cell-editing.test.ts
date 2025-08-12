import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { ColDef } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

describe('Cell Editing Start', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
    });

    const rowDataFactory = () => [
        {
            number: 10,
            string1: 'test',
            string2: 'test',
            date: new Date('2025-01-01'),
            dateStr: '2025-01-01',
            boolean: true,
        },
        {
            number: undefined,
            string1: undefined,
            string2: undefined,
            date: undefined,
            dateStr: undefined,
            boolean: undefined,
        },
    ];

    const columnDefs: ColDef[] = [
        { field: 'number', cellEditor: 'agNumberCellEditor' },
        { field: 'string1', cellEditor: 'agTextCellEditor' },
        { field: 'string2', cellEditor: 'agLargeTextCellEditor' },
        { field: 'date', cellEditor: 'agDateCellEditor' },
        { field: 'dateStr', cellEditor: 'agDateStringCellEditor' },
        { field: 'boolean', cellEditor: 'agCheckboxCellEditor' },
    ];

    let rowData: any[];

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    describe('Keydown start', () => {
        test.each([
            { field: 'number', input: '1', expected: '1', popup: false },
            { field: 'string1', input: '1', expected: '1', popup: false },
            { field: 'string2', input: '1', expected: '1', popup: true },
            { field: 'date', input: '1', expected: null, popup: false },
            { field: 'dateStr', input: '1', expected: null, popup: false },
            { field: 'boolean', input: '1', expected: true, popup: false },
        ])('$field', async ({ field, input, expected, popup }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.click(cell);
            await userEvent.keyboard(input);

            await asyncSetTimeout(1);

            // get input element inside the cell and check text contents, don't use agTestIdFor
            // as it might not be available for all cell editors, use testing-library
            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expect(inputElement).toHaveValue(expected as any);
        });
    });

    describe('Double-click', () => {
        test.each([
            { field: 'number', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'string1', popup: false, selectionStart: 0, selectionEnd: 4 },
            { field: 'string2', popup: true, selectionStart: 0, selectionEnd: 4 },
            { field: 'date', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'dateStr', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'boolean', popup: false, selectionStart: null, selectionEnd: null },
        ])('$field (popup: $popup)', async ({ field, popup, selectionStart, selectionEnd }) => {
            console.log(`Running Double-click test for field: ${field}`);
            const expected = rowData[0][field!];

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            console.log('Grid initialized:', api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            console.log('Double-clicking cell:', cell);
            await userEvent.dblClick(cell);

            await asyncSetTimeout(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            console.log('Input element value:', inputElement.value);
            expect(inputElement).toHaveValue(expected);

            expect(inputElement.selectionStart).toEqual(selectionStart);
            expect(inputElement.selectionEnd).toEqual(selectionEnd);
        });
    });

    describe('F2 key', () => {
        test.each([
            { field: 'number', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'string1', popup: false, selectionStart: 4, selectionEnd: 4 },
            { field: 'string2', popup: true, selectionStart: 4, selectionEnd: 4 },
            { field: 'date', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'dateStr', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'boolean', popup: false, selectionStart: null, selectionEnd: null },
        ])('$field (popup: $popup)', async ({ field, popup, selectionStart, selectionEnd }) => {
            const expected = rowData[0][field!];

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.click(cell);
            await userEvent.keyboard(`{F2}`);

            await asyncSetTimeout(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expect(inputElement).toHaveValue(expected);

            expect(inputElement.selectionStart).toEqual(selectionStart);
            expect(inputElement.selectionEnd).toEqual(selectionEnd);
        });
    });

    describe('Backspace key', () => {
        // Backspace starts editing with an empty value
        // For non-popup editors, this also removes the renderer and hence clears the cell text.
        // For popup editors, the renderer remains so cell text remains unchanged
        test.each([
            { field: 'number', popup: false, expectedValue: NaN, expectedText: '' },
            { field: 'string1', popup: false, expectedValue: '', expectedText: '' },
            { field: 'string2', popup: true, expectedValue: '', expectedText: 'test' },
            { field: 'date', popup: false, expectedValue: undefined, expectedText: '' },
            { field: 'dateStr', popup: false, expectedValue: undefined, expectedText: '' },
            { field: 'boolean', popup: false, expectedValue: true, expectedText: '' },
        ])('$field (popup: $popup)', async ({ field, popup, expectedValue, expectedText }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.click(cell);
            await userEvent.keyboard(`{Backspace}`);

            await asyncSetTimeout(1);

            expect(api.getCellEditorInstances()).toHaveLength(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expect(inputElement).toHaveValue(expectedValue as any);

            expect(cell).toHaveTextContent(expectedText as any);
        });
    });

    describe('Delete key', () => {
        // Delete key bypasses editors and clears the value of the cell.
        test.each([
            { field: 'number', expectedText: '' },
            { field: 'string1', expectedText: '' },
            { field: 'string2', expectedText: '' },
            { field: 'date', expectedText: '' },
            { field: 'dateStr', expectedText: '' },
            { field: 'boolean', expectedText: '' },
        ])('$field', async ({ field, expectedText }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.click(cell);
            await userEvent.keyboard(`{Delete}`);

            await asyncSetTimeout(1);

            expect(api.getCellEditorInstances()).toHaveLength(0);

            expect(cell).toHaveTextContent(expectedText as any);
        });
    });

    describe('Editing Events', () => {
        test('onValueChanged', async () => {
            const onCellValueChangedGrid = vi.fn();
            const onCellValueChangedColumn = vi.fn();

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'number',
                        cellEditor: 'agNumberCellEditor',
                        onCellValueChanged: () => onCellValueChangedColumn(),
                    },
                ],
                rowData,
                defaultColDef: {
                    editable: true,
                },
                onCellValueChanged: () => onCellValueChangedGrid(),
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);
            await userEvent.keyboard('12{Enter}');

            await asyncSetTimeout(1);

            expect(cell).toHaveTextContent('12');
            expect(onCellValueChangedColumn).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedGrid).toHaveBeenCalledTimes(1);
        });

        test('onValueChanged - valueSetter', async () => {
            const onCellValueChangedGrid = vi.fn();
            const onCellValueChangedColumn = vi.fn();
            const valueSetter = vi.fn();

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'number',
                        cellEditor: 'agNumberCellEditor',
                        editable: true,
                        valueSetter: vi.fn((params) => {
                            valueSetter(params);
                            params.data.number = params.newValue;
                            return true;
                        }),
                        onCellValueChanged: () => onCellValueChangedColumn(),
                    },
                ],
                rowData,
                onCellValueChanged: () => onCellValueChangedGrid(),
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));
            await userEvent.dblClick(cell);

            await asyncSetTimeout(1);

            await userEvent.keyboard('12{Enter}');

            await asyncSetTimeout(1);

            expect(cell).not.toHaveTextContent('10');
            expect(cell).toHaveTextContent('12');
            expect(valueSetter).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColumn).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedGrid).toHaveBeenCalledTimes(1);
        });
    });
});
