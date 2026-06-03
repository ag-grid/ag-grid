import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { CellValueChangedEvent, ColDef, NewValueParams } from 'ag-grid-community';
import {
    CheckboxEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    TextEditorModule,
    ValueCacheModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../test-utils';

/** Asserts the value of a form control, handling number/date/checkbox inputs correctly. */
function expectInputValue(input: HTMLInputElement, expected: unknown): void {
    const type = input.type;
    if (type === 'number' || type === 'range') {
        if (expected == null || (typeof expected === 'number' && isNaN(expected))) {
            expect(input.valueAsNumber).toBeNaN();
        } else {
            expect(input.valueAsNumber).toBe(Number(expected));
        }
    } else if (type === 'checkbox' || type === 'radio') {
        expect(input.checked).toBe(Boolean(expected));
    } else if (type === 'date' || type === 'datetime-local' || type === 'time') {
        if (expected == null || expected === undefined) {
            expect(input.value).toBe('');
        } else if (expected instanceof Date) {
            expect(input.valueAsDate?.getTime()).toBe(expected.getTime());
        } else {
            expect(input.value).toBe(String(expected));
        }
    } else {
        expect(input.value).toBe(expected == null ? '' : String(expected));
    }
}

describe('Cell Editing Start', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            RenderApiModule,
            ValueCacheModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            LargeTextEditorModule,
            CheckboxEditorModule,
        ],
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
            expectInputValue(inputElement, expected);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── number "Number" width:200 editable
                ├── string1 "String1" width:200 editable
                ├── string2 "String2" width:200 editable
                ├── date "Date" width:200 editable
                ├── dateStr "Date Str" width:200 editable
                └── boolean "Boolean" width:200 editable
            `);
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
            expectInputValue(inputElement, expected);

            expect(inputElement.selectionStart).toEqual(selectionStart);
            expect(inputElement.selectionEnd).toEqual(selectionEnd);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── number "Number" width:200 editable
                ├── string1 "String1" width:200 editable
                ├── string2 "String2" width:200 editable
                ├── date "Date" width:200 editable
                ├── dateStr "Date Str" width:200 editable
                └── boolean "Boolean" width:200 editable
            `);
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
            expectInputValue(inputElement, expected);

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

            // Row 0 shows 🖍️ (row is editing) but column values still show committed data —
            // Backspace clears the editor input without changing the data model until editing stops.
            await new GridRows(api, `during Backspace edit of ${field}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:"test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expectInputValue(inputElement, expectedValue);

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
        test('agLargeTextCellEditor popup editing state', async () => {
            // Tests that the 🖍️ editing indicator shows correctly for popup editors (agLargeTextCellEditor),
            // and that the DOM validator correctly handles cells with popup editors (input is outside the cell).
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'string2'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            // Editor is open — the row has a 🖍️ editing indicator.
            // The cell value shows the committed value (popup editors render outside the cell,
            // so the cell DOM is not replaced with an editor and there's no 🖍️ on the cell value).
            await new GridRows(api, 'during large text popup edit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:"test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            // Find the popup textarea and update its value
            const textarea = await waitForInput(gridDiv, cell, { popup: true });
            await userEvent.clear(textarea);
            await userEvent.type(textarea, 'updated text');
            await asyncSetTimeout(1);

            // Editor still open — row shows 🖍️, and the cell value shows 🖍️editValue dataValue
            // because the grid has synced the typed value with the edit model
            await new GridRows(api, 'during large text popup edit - after typing').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:🖍️"updated text" "test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            // Commit by stopping editing programmatically (avoids starting a new edit on the next cell)
            api.stopEditing();
            await asyncSetTimeout(1);

            // After commit: string2 is updated, no more editing indicator
            await new GridRows(api, 'after large text popup edit committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:10 string1:"test" string2:"updated text" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);
        });

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

            await new GridRows(api, 'during edit, dblClick opened editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10
                └── LEAF id:1
            `);

            await userEvent.keyboard('12{Enter}');

            await asyncSetTimeout(1);

            await new GridRows(api, 'after edit committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:12
                └── LEAF id:1
            `);

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

            await new GridRows(api, 'during edit with valueSetter, dblClick opened editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10
                └── LEAF id:1
            `);

            await userEvent.keyboard('12{Enter}');

            await asyncSetTimeout(1);

            await new GridRows(api, 'after edit with valueSetter committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:12
                └── LEAF id:1
            `);

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
        await new GridColumns(api, `valueGetter does not read live value from another cell editor (AG-16448) setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200
            `);
        await new GridRows(api, `valueGetter does not read live value from another cell editor (AG-16448) setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial" b:"initial"
            `
        );
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
        await new GridRows(api, `valueGetter does not read live value from another cell editor (AG-16448) final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"xx" b:"xx"
            `);
    });

    test('valueCache does not store or cache editing values; cancel and commit both correct (AG-16448)', async () => {
        // This test verifies BOTH:
        // 1. The cell being edited shows its editing value (UI feedback via input.value)
        // 2. valueGetter using getValue() NEVER receives the editing value — verified by tracking the
        //    actual values passed to the callback, not just the cell display
        // 3. Cancel does not leak a cached editing value
        // 4. Commit correctly expires the cache and updates the dependent column
        let valueGetterValues: string[] = [];
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    colId: 'computed',
                    headerName: 'Computed',
                    valueGetter: (params) => {
                        const value = params.getValue('a');
                        valueGetterValues.push(value);
                        return `Echo: ${value}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        await new GridColumns(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc setup`
        ).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── computed "Computed" width:200
        `);
        await new GridRows(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc setup`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:"Echo: undefined"
            └── LEAF id:0 a:"initial" computed:"Echo: initial"
        `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellComputed = getByTestId(gridDiv, agTestIdFor.cell('0', 'computed'));

        // Initial state
        expect(cellA).toHaveTextContent('initial');
        expect(cellComputed).toHaveTextContent('Echo: initial');

        // Reset tracking before the edit session
        valueGetterValues = [];

        // Phase A: during edit, valueGetter never receives the editing value
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'typing');
        await asyncSetTimeout(1);

        // The editor input itself shows the live typing value
        expect(input.value).toBe('typing');

        // Multiple refreshes during edit — valueGetter should never see the typing value
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);

        expect(valueGetterValues.every((v) => v === 'initial')).toBe(true);
        expect(cellComputed).toHaveTextContent('Echo: initial');

        // Phase B: cancel — should not leak a cached editing value
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);

        expect(cellComputed).toHaveTextContent('Echo: initial');

        // Phase C: commit — cache expires on data change; dependent column updates
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const input2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input2);
        await userEvent.type(input2, 'committed');
        await asyncSetTimeout(1);

        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('committed');
        expect(cellComputed).toHaveTextContent('Echo: committed');

        // Refresh again — cached value should be correct post-commit
        api.refreshCells({ columns: ['computed'], force: true });
        await asyncSetTimeout(1);
        expect(cellComputed).toHaveTextContent('Echo: committed');

        // 2 sessions: first cancelled (no value change), second committed (1 value change)
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
        await new GridRows(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc final state`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:"Echo: undefined"
            └── LEAF id:0 a:"committed" computed:"Echo: committed"
        `);
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
        await new GridColumns(api, `valueCache is actually caching values setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── computed width:200
        `);
        await new GridRows(api, `valueCache is actually caching values setup`).check(`
            ROOT id:ROOT_NODE_ID computed:"call-2"
            └── LEAF id:0 a:"test" computed:"call-1"
        `);

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
        await new GridRows(api, `valueCache is actually caching values final state`).check(`
            ROOT id:ROOT_NODE_ID computed:"call-4"
            └── LEAF id:0 a:"changed" computed:"call-3"
        `);
    });

    test('cellValueChanged newRawValue is the raw edit value, newValue is the resolved value via valueGetter', async () => {
        const cellValueChangedEvents: Pick<CellValueChangedEvent, 'oldValue' | 'newValue' | 'newRawValue'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    valueGetter: (params) => (params.data?.a != null ? `prefix_${params.data.a}` : null),
                    valueSetter: (params) => {
                        params.data.a = params.newValue;
                        return true;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue });
            },
        });
        await new GridColumns(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val setup`
        ).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual({
            oldValue: 'prefix_initial',
            newValue: 'prefix_changed',
            newRawValue: 'changed',
        });
        await new GridRows(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val final state`
        ).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_changed"
        `);
    });

    test('cellValueChanged newRawValue equals newValue when no valueGetter is configured', async () => {
        const cellValueChangedEvents: Pick<CellValueChangedEvent, 'oldValue' | 'newValue' | 'newRawValue'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue });
            },
        });
        await new GridColumns(
            api,
            `cellValueChanged newRawValue equals newValue when no valueGetter is configured setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `cellValueChanged newRawValue equals newValue when no valueGetter is configured setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual({
            oldValue: 'initial',
            newValue: 'changed',
            newRawValue: 'changed',
        });
        await new GridRows(
            api,
            `cellValueChanged newRawValue equals newValue when no valueGetter is configured final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"changed"
        `);
    });

    test('colDef onCellValueChanged receives newRawValue and source', async () => {
        const colDefEvents: Pick<NewValueParams, 'oldValue' | 'newValue' | 'newRawValue' | 'source'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    valueGetter: (params) => (params.data?.a != null ? `prefix_${params.data.a}` : null),
                    valueSetter: (params) => {
                        params.data.a = params.newValue;
                        return true;
                    },
                    onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                        colDefEvents.push({ oldValue, newValue, newRawValue, source });
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `colDef onCellValueChanged receives newRawValue and source setup`).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `colDef onCellValueChanged receives newRawValue and source setup`).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        expect(colDefEvents).toHaveLength(1);
        expect(colDefEvents[0]).toEqual({
            oldValue: 'prefix_initial',
            newValue: 'prefix_changed',
            newRawValue: 'changed',
            source: undefined,
        });
        await new GridRows(api, `colDef onCellValueChanged receives newRawValue and source final state`).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_changed"
        `);
    });
});
