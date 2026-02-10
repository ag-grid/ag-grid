import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { ColDef } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { EditEventTracker, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
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
            await userEvent.dblClick(cell);

            await asyncSetTimeout(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
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
            const eventTracker = new EditEventTracker(api);

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

            // 1 editor started/stopped with 1 value change
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 1,
                cellEditingStopped: 1,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
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
            const eventTracker = new EditEventTracker(api);

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

            // 1 editor started/stopped with 1 value change
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 1,
                cellEditingStopped: 1,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
        });
    });

    test('valueGetter does not read live value from another cell editor (AG-16448)', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    field: 'b',
                    valueGetter: (params) => params.getValue('a'),
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('initial');

        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);

        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'xx');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // AG-16448: valueGetter should NOT see live editing value - should still show original value
        expect(cellB).toHaveTextContent('initial');

        // Commit first edit and start a new edit session to test cancel
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // After commit, cellB should update to the committed value
        expect(cellB).toHaveTextContent('xx');

        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input2);
        await userEvent.type(input2, 'yy');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // AG-16448: valueGetter should NOT see live editing value - should show last committed value
        expect(cellB).toHaveTextContent('xx');

        // Cancel edit by pressing ESC, should stay at last committed value
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        // 2 edit sessions: first committed with value change, second cancelled
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('valueCache does not store editing values (AG-16448)', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    field: 'b',
                    valueGetter: (params) => {
                        return params.getValue('a');
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            valueCache: true, // Enable value caching
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('initial');

        // Start editing
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'edited');
        await asyncSetTimeout(1);

        // Force refresh to trigger valueGetter evaluation during edit
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // Should still show 'initial' - not the editing value
        expect(cellB).toHaveTextContent('initial');

        // Cancel the edit
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        // After cancel, refresh again
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // Value should still be 'initial' (from original data, not from any cached edited value)
        expect(cellB).toHaveTextContent('initial');

        // Now do an edit that commits
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input2);
        await userEvent.type(input2, 'committed{Enter}');
        await asyncSetTimeout(1);

        // After commit, value should update (cache expires on data change)
        expect(cellB).toHaveTextContent('committed');

        // Refresh again - cached value should be correct
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('committed');

        // 2 edit sessions: first cancelled, second committed with value change
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('valueCache does not cache editing values even during edit (AG-16448)', async () => {
        // This test verifies that while editing, the valueGetter using getValue() on the edited
        // column does NOT cache the editing value. The cache should only ever contain
        // committed data values.
        let valueGetterValues: string[] = [];
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    field: 'b',
                    valueGetter: (params) => {
                        const value = params.getValue('a');
                        valueGetterValues.push(value);
                        return `Computed: ${value}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('Computed: initial');

        // Reset tracking
        valueGetterValues = [];

        // Start editing and type something
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'typing');
        await asyncSetTimeout(1);

        // Force multiple refreshes during editing
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // All valueGetter calls during edit should have returned 'initial', not 'typing'
        // This proves the editing value was never passed to the valueGetter
        expect(valueGetterValues.every((v) => v === 'initial')).toBe(true);

        // Cell B should show 'initial', not the typing value
        expect(cellB).toHaveTextContent('Computed: initial');

        // Commit the edit
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // Now the value should update
        expect(cellB).toHaveTextContent('Computed: typing');

        // 1 editor started/stopped with 1 value change
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('edited cell shows editing value while dependent valueGetter shows committed value (AG-16448)', async () => {
        // This test verifies BOTH:
        // 1. The cell being edited shows its editing value (UI feedback)
        // 2. A dependent column using valueGetter with getValue() shows committed value
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    colId: 'computed',
                    headerName: 'Computed',
                    valueGetter: (params) => `Echo: ${params.getValue('a')}`,
                },
            ],
            rowData: [{ id: '0', a: 'original' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellComputed = getByTestId(gridDiv, agTestIdFor.cell('0', 'computed'));

        // Initial state
        expect(cellA).toHaveTextContent('original');
        expect(cellComputed).toHaveTextContent('Echo: original');

        // Start editing cell A
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'editing');
        await asyncSetTimeout(1);

        // Refresh to update computed column
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);

        // Cell A (the editor) should show the editing value 'editing'
        expect(input.value).toBe('editing');

        // Cell Computed should still show 'original' (not the editing value)
        expect(cellComputed).toHaveTextContent('Echo: original');

        // Commit the edit
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // Now both should be updated
        expect(cellA).toHaveTextContent('editing');
        expect(cellComputed).toHaveTextContent('Echo: editing');

        // 1 editor started/stopped with 1 value change
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('valueCache is actually caching values', async () => {
        // This test verifies that the value cache is actually active and caching
        let valueGetterCallCount = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    colId: 'computed',
                    valueGetter: () => {
                        valueGetterCallCount++;
                        return `call-${valueGetterCallCount}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'test' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellComputed = getByTestId(gridDiv, agTestIdFor.cell('0', 'computed'));
        const initialCallCount = valueGetterCallCount;

        // Multiple refreshes should use cached value (no new calls)
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);

        // With valueCache enabled, the call count should NOT have increased
        // because the cached value is being reused
        expect(valueGetterCallCount).toBe(initialCallCount);

        // The cell should show the first computed value (cached)
        expect(cellComputed).toHaveTextContent('call-1');

        // Now expire the cache by making a data change
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        // After data change, cache should expire and valueGetter should be called again
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);

        expect(valueGetterCallCount).toBeGreaterThan(initialCallCount);
    });
});
