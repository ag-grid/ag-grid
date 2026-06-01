import { fireEvent, getByTestId, waitFor, within } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import {
    CheckboxEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    DragAndDropModule,
    RichSelectModule,
    RowDragModule,
} from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    fakeElementAttribute,
    getAllRows,
    getRowHtmlElement,
    waitForInput,
    waitForPopup,
} from '../test-utils';

describe('Cell Editing Regression', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            TextEditorModule,
            LargeTextEditorModule,
            NumberEditorModule,
            CheckboxEditorModule,
            RichSelectModule,
            CellSelectionModule,
            ClipboardModule,
            DragAndDropModule,
            RowDragModule,
        ],
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
            expect(inputElement.value).toBe(expected);
            expect(valueFormatter).toHaveBeenCalled();
        });
    });

    test('full-row editing tab to next row starts editors when focusing read-only cell', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'readOnly', headerName: 'Read Only', editable: false },
                { field: 'make' },
                { field: 'model' },
            ],
            defaultColDef: {
                editable: true,
            },
            editType: 'fullRow',
            rowData: [
                { readOnly: 'RO-0', make: 'Toyota', model: 'Celica' },
                { readOnly: 'RO-1', make: 'Ford', model: 'Mondeo' },
            ],
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const makeCellRow0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'make'));
        await userEvent.dblClick(makeCellRow0);
        await waitForInput(gridDiv, makeCellRow0, { popup: false });

        // Mid-edit: row 0 is being edited
        await new GridRows(api, 'during full-row edit of row 0').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 readOnly:"RO-0" make:"Toyota" model:"Celica"
            └── LEAF id:1 readOnly:"RO-1" make:"Ford" model:"Mondeo"
        `);

        await userEvent.keyboard('{Tab}{Tab}');
        await asyncSetTimeout(1);

        const modelCellRow1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'model'));
        const editor = await waitForInput(gridDiv, modelCellRow1, { popup: false });

        // Mid-edit: row 1 is now being edited after tabbing from row 0
        await new GridRows(api, 'during full-row edit of row 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 readOnly:"RO-0" make:"Toyota" model:"Celica"
            └── LEAF 🖍️ id:1 readOnly:"RO-1" make:"Ford" model:"Mondeo"
        `);

        await userEvent.clear(editor);
        await userEvent.type(editor, 'Updated');
        await userEvent.keyboard('{Enter}');

        expect(modelCellRow1).toHaveTextContent('Updated');

        await new GridRows(api, 'after committing edit on row 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 readOnly:"RO-0" make:"Toyota" model:"Celica"
            └── LEAF id:1 readOnly:"RO-1" make:"Ford" model:"Updated"
        `);

        // Row 0: 2 editors started (make, model - readOnly is not editable)
        // Row 0: 2 editors stopped when tabbing to row 1
        // Row 1: 2 editors started
        // Row 1: 2 editors stopped on Enter, with 1 value changed
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 4,
            cellEditingStopped: 4,
            cellValueChanged: 1,
            rowValueChanged: 1,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('full-row editing fires rowEditingStopped on stopEditing', async () => {
        const onRowEditingStopped = vi.fn();

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'make' }, { field: 'model' }],
            defaultColDef: {
                editable: true,
            },
            editType: 'fullRow',
            rowData: [
                { make: 'Toyota', model: 'Celica' },
                { make: 'Ford', model: 'Mondeo' },
            ],
            onRowEditingStopped,
        });
        await new GridColumns(api, `full-row editing fires rowEditingStopped on stopEditing setup`).checkColumns(`
            CENTER
            ├── make "Make" width:200 editable
            └── model "Model" width:200 editable
        `);
        await new GridRows(api, `full-row editing fires rowEditingStopped on stopEditing setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Toyota" model:"Celica"
            └── LEAF id:1 make:"Ford" model:"Mondeo"
        `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const makeCellRow0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'make'));
        await userEvent.dblClick(makeCellRow0);
        await waitForInput(gridDiv, makeCellRow0, { popup: false });

        api.stopEditing();
        await asyncSetTimeout(1);

        expect(onRowEditingStopped).toHaveBeenCalledTimes(1);
        expect(onRowEditingStopped.mock.calls[0][0].rowIndex).toBe(0);

        // 2 editors started (make, model), 2 editors stopped
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `full-row editing fires rowEditingStopped on stopEditing final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Toyota" model:"Celica"
            └── LEAF id:1 make:"Ford" model:"Mondeo"
        `);
    });

    test('full-row editing closes empty editors when tabbing to next row', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'model3' }],
            defaultColDef: {
                editable: true,
            },
            editType: 'fullRow',
            rowData: [
                { make: 'Toyota', model: 'Celica', model3: undefined },
                { make: 'Ford', model: 'Mondeo', model3: undefined },
            ],
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const makeCellRow0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'make'));
        await userEvent.dblClick(makeCellRow0);
        await waitForInput(gridDiv, makeCellRow0, { popup: false });
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(true);
        expect(getRowHtmlElement(api, '1')?.classList.contains('ag-row-editing')).toBe(false);
        expect(api.isEditing({ rowIndex: 0, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(true);

        // Mid-edit: row 0 is being full-row edited
        await new GridRows(api, 'during full-row edit of row 0').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 make:"Toyota" model:"Celica"
            └── LEAF id:1 make:"Ford" model:"Mondeo"
        `);

        await userEvent.keyboard('{Tab}{Tab}{Tab}');
        const makeCellRow1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'make'));
        await waitForInput(gridDiv, makeCellRow1, { popup: false });

        await waitFor(() => {
            const editingCells = api.getEditingCells();
            expect(editingCells.length).toBeGreaterThan(0);
            expect(editingCells.every((cell) => cell.rowIndex === 1)).toBe(true);
        });
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(false);
        expect(getRowHtmlElement(api, '1')?.classList.contains('ag-row-editing')).toBe(true);
        expect(api.isEditing({ rowIndex: 0, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(false);
        expect(api.isEditing({ rowIndex: 1, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(true);

        // After tabbing: row 1 is now being full-row edited, row 0 editors closed
        await new GridRows(api, 'after tab to row 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Toyota" model:"Celica"
            └── LEAF 🖍️ id:1 make:"Ford" model:"Mondeo"
        `);

        const emptyCellRow0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'model3'));
        expect(emptyCellRow0.querySelector('input')).toBeNull();

        // Row 0: 3 editors started, then 1 extra start/stop during tab navigation, then 3 editors stopped
        // Row 1: 3 editors started (still open at end of test)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 7,
            cellEditingStopped: 4,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });

    test('full-row editing closes empty editors when shift-tabbing to previous row', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'model3' }],
            defaultColDef: {
                editable: true,
            },
            editType: 'fullRow',
            rowData: [
                { make: 'Toyota', model: 'Celica', model3: undefined },
                { make: 'Ford', model: 'Mondeo', model3: undefined },
            ],
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const makeCellRow1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'make'));
        await userEvent.dblClick(makeCellRow1);
        await waitForInput(gridDiv, makeCellRow1, { popup: false });
        expect(getRowHtmlElement(api, '1')?.classList.contains('ag-row-editing')).toBe(true);
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(false);
        expect(api.isEditing({ rowIndex: 0, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(false);
        expect(api.isEditing({ rowIndex: 1, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(true);

        // Mid-edit: row 1 is being full-row edited
        await new GridRows(api, 'during full-row edit of row 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Toyota" model:"Celica"
            └── LEAF 🖍️ id:1 make:"Ford" model:"Mondeo"
        `);

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        const model3CellRow0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'model3'));
        await waitForInput(gridDiv, model3CellRow0, { popup: false });

        await waitFor(() => {
            const editingCells = api.getEditingCells();
            expect(editingCells.length).toBeGreaterThan(0);
            expect(editingCells.every((cell) => cell.rowIndex === 0)).toBe(true);
        });
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(true);
        expect(getRowHtmlElement(api, '1')?.classList.contains('ag-row-editing')).toBe(false);
        expect(api.isEditing({ rowIndex: 0, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(true);
        expect(api.isEditing({ rowIndex: 1, rowPinned: undefined, column: api.getColumn('model3')! })).toBe(false);

        // After shift-tab: row 0 is now being full-row edited, row 1 editors closed
        await new GridRows(api, 'after shift-tab to row 0').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 make:"Toyota" model:"Celica"
            └── LEAF id:1 make:"Ford" model:"Mondeo"
        `);

        const emptyCellRow1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'model3'));
        expect(emptyCellRow1.querySelector('input')).toBeNull();

        // Row 1: 3 editors started, then 1 extra start/stop during tab navigation, then 3 editors stopped
        // Row 0: 3 editors started (still open at end of test)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 7,
            cellEditingStopped: 4,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
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
                    valueGetter: ({ data }) => {
                        if (!data) {
                            return undefined;
                        }
                        return {
                            0: '0 - zero',
                            1: '1 - one',
                            2: '2 - two',
                            3: '3 - three',
                        }[data.code as number];
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

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"0 - zero"
            └── LEAF id:1 code:"2 - two"
        `);

        // FIRST EDIT
        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('0', 'code'));
        await userEvent.dblClick(cell0);

        await asyncSetTimeout(1);

        // Row 0 has a 🖍️ active popup editor (agRichSelectCellEditor is a popup editor).
        // The cell shows the committed value, not a live editor value.
        await new GridRows(api, 'row 0 rich select editor open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 code:"0 - zero"
            └── LEAF id:1 code:"2 - two"
        `);

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

        // After first edit committed: code changed from 0 to 1
        await new GridRows(api, 'after row 0 rich select edit committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"1 - one"
            └── LEAF id:1 code:"2 - two"
        `);

        // SECOND EDIT
        const cell1 = getByTestId(gridDiv, agTestIdFor.cell('1', 'code'));
        await userEvent.dblClick(cell1);

        await asyncSetTimeout(100);

        // Row 1 now has a 🖍️ active popup editor
        await new GridRows(api, 'row 1 rich select editor open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"1 - one"
            └── LEAF 🖍️ id:1 code:"2 - two"
        `);

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

        // After second edit committed: code changed from 2 to 3 (AG-15698 regression: cell was not refreshed)
        await new GridRows(api, 'after row 1 rich select edit committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"1 - one"
            └── LEAF id:1 code:"3 - three"
        `);
    });

    // AG-16998 - rich select editor throws error when cellRenderer is a function
    test('rich select editor opens without error when cellRenderer is a function', async () => {
        // virtualList doesn't add option elements if the offsetHeight is 0, so we need to fake it
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'value',
                    editable: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        values: ['Alpha', 'Beta', 'Gamma'],
                        cellRenderer: (params: { value: string }) => `<b>${params.value}</b>`,
                    },
                },
            ],
            rowData: [{ value: 'Alpha' }],
        });
        await new GridColumns(api, `rich select editor opens without error when cellRenderer is a function setup`)
            .checkColumns(`
                CENTER
                └── value "Value" width:200 editable
            `);
        await new GridRows(api, `rich select editor opens without error when cellRenderer is a function setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:"Alpha"
            `
        );

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'value'));
        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);

        // Editor popup should open without error
        await waitForPopup(gridDiv);

        // Display field (selected value area) should contain the rendered output for 'Alpha'
        const displayField = gridDiv.querySelector('.ag-picker-field-display');
        await waitFor(() => expect(displayField?.querySelector('b')).toHaveTextContent('Alpha'));

        // Each list row should render its value via the function renderer
        const listRows = await waitFor(() => {
            const rows = gridDiv.querySelectorAll('.ag-rich-select-row');
            expect(rows).toHaveLength(3);
            return rows;
        });
        expect(listRows[0].querySelector('b')).toHaveTextContent('Alpha');
        expect(listRows[1].querySelector('b')).toHaveTextContent('Beta');
        expect(listRows[2].querySelector('b')).toHaveTextContent('Gamma');
        await new GridRows(api, `rich select editor opens without error when cellRenderer is a function final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 value:"Alpha"
            `);
    });

    // AG-15794 - onCellEditRequest source
    test('onCellEditRequest should have source=edit', async () => {
        // virtualList doesn't add option elements if the offsetHeight is 0, so we need to fake it
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');

        const onCellEditRequest = vi.fn();

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'code',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        values: [0, 1, 2, 3],
                    },
                    valueGetter: ({ data }) => {
                        if (!data) {
                            return undefined;
                        }
                        return {
                            0: '0 - zero',
                            1: '1 - one',
                            2: '2 - two',
                            3: '3 - three',
                        }[data.code as number];
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
            readOnlyEdit: true,
            rowData: [{ code: 0 }, { code: 2 }],
            onCellEditRequest: ({ source }) => onCellEditRequest(source),
        });
        await new GridColumns(api, `onCellEditRequest should have source=edit setup`).checkColumns(`
            CENTER
            └── code "Code" width:200 editable
        `);
        await new GridRows(api, `onCellEditRequest should have source=edit setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"0 - zero"
            └── LEAF id:1 code:"2 - two"
        `);
        const eventTracker = new EditEventTracker(api);

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

        // // SECOND EDIT
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

        expect(onCellEditRequest).toHaveBeenCalledTimes(2);
        expect(onCellEditRequest).toHaveBeenNthCalledWith(1, 'edit');
        expect(onCellEditRequest).toHaveBeenNthCalledWith(2, 'edit');
        // 2 editors started/stopped, no value changes (readOnlyEdit mode)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 2,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `onCellEditRequest should have source=edit final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 code:"0 - zero"
            └── LEAF id:1 code:"2 - two"
        `);
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

        // Mid-edit: editor has typed value 12
        await new GridRows(api, 'during full-row edit with typed number').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 field:🖍️12 0
            └── LEAF id:1 field:1
        `);

        await userEvent.keyboard('{Enter}');

        expect(cell).toHaveTextContent('12');

        await new GridRows(api, 'after committing number edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:12
            └── LEAF id:1 field:1
        `);

        expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
        expect(onCellEditingStopped).toHaveBeenCalledWith(12);
    });

    // onCellEditingStopped.newValue for v33 returns the editor value, even if no edit occurred
    describe('onCellEditingStopped', () => {
        test.each([
            { action: undefined, expected: { newValue: 'A Value', valueChanged: false } },
            { action: 'Test', expected: { newValue: 'Test', valueChanged: true } },
        ])(
            `newValue:$expected.newValue, valueChanged:$expected.valueChanged after Enter`,
            async ({ action, expected }) => {
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
                    onCellEditingStopped: ({ newValue, valueChanged }) =>
                        onCellEditingStopped({ newValue, valueChanged }),
                });
                const eventTracker = new EditEventTracker(api);

                const gridDiv = getGridElement(api)! as HTMLElement;
                await asyncSetTimeout(1);

                const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
                await userEvent.dblClick(cell);

                const inputElement = await waitForInput(gridDiv, cell, { popup: false });
                if (action) {
                    await userEvent.clear(inputElement);
                    await userEvent.type(inputElement, action);
                }
                expect(inputElement.value).toBe(expected?.newValue);

                await userEvent.type(inputElement, '{Enter}');

                expect(cell).toHaveTextContent('A Value');

                expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
                expect(onCellEditingStopped).toHaveBeenCalledWith(expected);
                // 1 editor started/stopped, no value changes (readOnlyEdit mode)
                expect(eventTracker.counts).toEqual({
                    cellEditingStarted: 1,
                    cellEditingStopped: 1,
                    cellValueChanged: 0,
                    rowValueChanged: 0,
                    cellEditRequest: expected.valueChanged ? 1 : 0,
                    bulkEditingStarted: 0,
                    bulkEditingStopped: 0,
                    batchEditingStarted: 0,
                    batchEditingStopped: 0,
                });
            }
        );

        test.each([
            { action: undefined, expected: { newValue: undefined, valueChanged: false } },
            { action: 'Test', expected: { newValue: undefined, valueChanged: false } },
        ])(
            `newValue:$expected.newValue, valueChanged:$expected.valueChanged after Escape`,
            async ({ action, expected }) => {
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
                    onCellEditingStopped: ({ newValue, valueChanged }) =>
                        onCellEditingStopped({ newValue, valueChanged }),
                });
                const eventTracker = new EditEventTracker(api);

                const gridDiv = getGridElement(api)! as HTMLElement;
                await asyncSetTimeout(1);

                const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
                await userEvent.dblClick(cell);

                const inputElement = await waitForInput(gridDiv, cell, { popup: false });
                if (action) {
                    await userEvent.clear(inputElement);
                    await userEvent.type(inputElement, action);
                }
                expect(inputElement.value).toBe(action ?? 'A Value');

                await userEvent.type(inputElement, '{Escape}');

                await asyncSetTimeout(1);

                expect(cell).toHaveTextContent('A Value');

                expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
                expect(onCellEditingStopped).toHaveBeenCalledWith(expected);
                // 1 editor started/stopped, no value changes (Escape cancels)
                expect(eventTracker.counts).toEqual({
                    cellEditingStarted: 1,
                    cellEditingStopped: 1,
                    cellValueChanged: 0,
                    rowValueChanged: 0,
                    cellEditRequest: 0,
                    bulkEditingStarted: 0,
                    bulkEditingStopped: 0,
                    batchEditingStarted: 0,
                    batchEditingStopped: 0,
                });
            }
        );
    });

    describe('AG-15699 - cellValueChange source', () => {
        let user: ReturnType<typeof userEvent.setup>;

        const testACell = async (
            editAction: (api: GridApi, gridDiv: HTMLElement, cell: HTMLElement) => Promise<void>,
            onCellValueChanged: jest.Mock<any, any, any>,
            onCellValueChangedColDef?: jest.Mock<any, any, any>,
            extraOptions?: GridOptions
        ): Promise<{
            api: GridApi;
            eventTracker: EditEventTracker;
            onCellValueChanged: jest.Mock<any, any, any>;
            onCellValueChangedColDef?: jest.Mock<any, any, any>;
        }> => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'field',
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                        onCellValueChanged: ({ newValue, oldValue }) =>
                            onCellValueChangedColDef?.({ newValue, oldValue }),
                    },
                ],
                rowData: [{ field: 'A Value' }, { field: 'A 2nd Value' }],
                onCellValueChanged: ({ newValue, oldValue, source }) =>
                    onCellValueChanged({ newValue, oldValue, source }),
                ...extraOptions,
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
            await editAction(api, gridDiv, cell);
            return { api, eventTracker, onCellValueChanged, onCellValueChangedColDef };
        };

        beforeEach(() => {
            user = userEvent.setup({ skipHover: true });
        });

        test('dblClick edit should have source=edit', async () => {
            const { eventTracker, onCellValueChanged, onCellValueChangedColDef } = await testACell(
                async (api, gridDiv, cell) => {
                    await user.dblClick(cell);
                    const inputElement = await waitForInput(gridDiv, cell);
                    await user.type(inputElement, '15');
                    await user.keyboard('{Enter}');
                    expect(cell).toHaveTextContent('15');
                },
                jest.fn(),
                jest.fn()
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith({
                newValue: 'A Value15',
                oldValue: 'A Value',
                source: 'edit',
            });
            expect(onCellValueChangedColDef).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColDef).toHaveBeenCalledWith({
                newValue: 'A Value15',
                oldValue: 'A Value',
            });
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

        test('dblClick edit and click away should have source=edit', async () => {
            const { eventTracker, onCellValueChanged, onCellValueChangedColDef } = await testACell(
                async (api, gridDiv, cell) => {
                    await user.dblClick(cell);
                    const inputElement = await waitForInput(gridDiv, cell);
                    await user.type(inputElement, '15');
                    await asyncSetTimeout(10);

                    const target = getByTestId(gridDiv, agTestIdFor.cell('1', 'field'));
                    await user.click(target);
                    expect(cell).toHaveTextContent('15');
                },
                jest.fn(),
                jest.fn()
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith({
                newValue: 'A Value15',
                oldValue: 'A Value',
                source: 'edit',
            });
            expect(onCellValueChangedColDef).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColDef).toHaveBeenCalledWith({ newValue: 'A Value15', oldValue: 'A Value' });
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

        test('copy/paste edit should have source=paste', async () => {
            const { onCellValueChanged, onCellValueChangedColDef } = await testACell(
                async (api, gridDiv, cell) => {
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
                },
                jest.fn(),
                jest.fn()
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith({
                newValue: 'A Value',
                oldValue: 'A 2nd Value',
                source: 'paste',
            });
            expect(onCellValueChangedColDef).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColDef).toHaveBeenCalledWith({
                newValue: 'A Value',
                oldValue: 'A 2nd Value',
            });
        });

        test('bulk edit should have source=bulk', async () => {
            const { onCellValueChanged, onCellValueChangedColDef } = await testACell(
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
                jest.fn(),
                jest.fn(),
                {
                    cellSelection: true,
                }
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(2);
            expect(onCellValueChanged).toHaveBeenNthCalledWith(1, {
                newValue: '15',
                oldValue: 'A Value',
                source: 'bulk',
            });
            expect(onCellValueChanged).toHaveBeenNthCalledWith(2, {
                newValue: '15',
                oldValue: 'A 2nd Value',
                source: 'bulk',
            });
            expect(onCellValueChangedColDef).toHaveBeenCalledTimes(2);
            expect(onCellValueChangedColDef).toHaveBeenNthCalledWith(1, {
                newValue: '15',
                oldValue: 'A Value',
            });
            expect(onCellValueChangedColDef).toHaveBeenNthCalledWith(2, {
                newValue: '15',
                oldValue: 'A 2nd Value',
            });
        });

        test('ctrl-d should have source=paste', async () => {
            const { onCellValueChanged, onCellValueChangedColDef } = await testACell(
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
                jest.fn(),
                jest.fn(),
                {
                    cellSelection: true,
                }
            );

            expect(onCellValueChanged).toHaveBeenCalledTimes(1);
            expect(onCellValueChanged).toHaveBeenCalledWith({
                newValue: 'A Value',
                oldValue: 'A 2nd Value',
                source: 'paste',
            });
            expect(onCellValueChangedColDef).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColDef).toHaveBeenCalledWith({
                newValue: 'A Value',
                oldValue: 'A 2nd Value',
            });
        });
    });

    test('Delete key on cell with valueGetter passes correct oldValue to valueSetter', async () => {
        const valueSetterCalls: Array<{ oldValue: any; newValue: any }> = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'name' },
                {
                    headerName: 'Total Medals',
                    colId: 'totalMedals',
                    editable: true,
                    valueGetter: (params) => params.data.medals,
                    valueSetter: (params) => {
                        valueSetterCalls.push({
                            oldValue: structuredClone(params.oldValue),
                            newValue: params.newValue,
                        });
                        if (params.newValue == null) {
                            params.data.medals = { gold: 0, silver: 0, bronze: 0 };
                            return true;
                        }
                        return false;
                    },
                    valueFormatter: ({ value }) => value.gold + value.silver + value.bronze,
                },
                {
                    field: 'score',
                    editable: true,
                    valueGetter: (params) => params.data.scoreData.value,
                    valueSetter: (params) => {
                        valueSetterCalls.push({
                            oldValue: params.oldValue,
                            newValue: params.newValue,
                        });
                        params.data.scoreData.value = params.newValue ?? 0;
                        return true;
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
                editable: true,
                cellDataType: false,
            },
            rowData: [
                {
                    name: 'Michael Phelps',
                    medals: { gold: 8, silver: 2, bronze: 0 },
                    scoreData: { value: 42 },
                },
            ],
        });
        await new GridColumns(api, `Delete key on cell with valueGetter passes correct oldValue to valueSetter setup`)
            .checkColumns(`
                CENTER
                ├── name "Name" width:333 flex:1 editable
                ├── totalMedals "Total Medals" width:334 flex:1 editable
                └── score "Score" width:333 flex:1 editable
            `);
        await new GridRows(api, `Delete key on cell with valueGetter passes correct oldValue to valueSetter setup`)
            .check(`
                ROOT id:ROOT_NODE_ID totalMedals:"<ERROR>" score:"<ERROR>"
                └── LEAF id:0 name:"Michael Phelps" totalMedals:10 score:42
            `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Test object valueGetter
        const medalsCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'totalMedals'));
        expect(medalsCell).toHaveTextContent('10');

        await userEvent.click(medalsCell);
        await asyncSetTimeout(1);
        expect(api.getEditingCells()).toHaveLength(0);

        await userEvent.keyboard('{Delete}');
        await asyncSetTimeout(1);

        expect(valueSetterCalls).toHaveLength(1);
        expect(valueSetterCalls[0].newValue).toBeNull();
        expect(valueSetterCalls[0].oldValue).toEqual({ gold: 8, silver: 2, bronze: 0 });
        expect(medalsCell).toHaveTextContent('0');

        // Test primitive valueGetter
        const scoreCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'score'));
        expect(scoreCell).toHaveTextContent('42');

        await userEvent.click(scoreCell);
        await asyncSetTimeout(1);
        expect(api.getEditingCells()).toHaveLength(0);

        await userEvent.keyboard('{Delete}');
        await asyncSetTimeout(1);

        expect(valueSetterCalls).toHaveLength(2);
        expect(valueSetterCalls[1].newValue).toBeNull();
        expect(valueSetterCalls[1].oldValue).toBe(42);
        expect(scoreCell).toHaveTextContent('0');

        // Delete key triggers value change without opening editor
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(
            api,
            `Delete key on cell with valueGetter passes correct oldValue to valueSetter final state`
        ).check(`
            ROOT id:ROOT_NODE_ID totalMedals:"<ERROR>" score:"<ERROR>"
            └── LEAF id:0 name:"Michael Phelps" totalMedals:0 score:0
        `);
    });

    test.each(['ui', 'data'] as const)(
        'onCellValueChanged receives transformed value from valueSetter via %s',
        async (source) => {
            // This test verifies that when a valueSetter transforms the value (e.g., to uppercase),
            // the onCellValueChanged event receives the transformed value, not the original input.
            const cellValueChangedEvents: Array<{ oldValue: any; newValue: any }> = [];

            const api = await gridMgr.createGridAndWait(`myGrid-${source}`, {
                columnDefs: [
                    {
                        field: 'athlete',
                        editable: true,
                        valueSetter: (params) => {
                            // Transform value to uppercase
                            params.data.athlete = params.newValue.toUpperCase();
                            return true;
                        },
                    },
                    { field: 'age' },
                    { field: 'country' },
                ],
                rowData: [{ athlete: 'Michael Phelps', age: 30, country: 'USA' }],
                onCellValueChanged: (event) => {
                    cellValueChangedEvents.push({
                        oldValue: event.oldValue,
                        newValue: event.newValue,
                    });
                },
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            if (source === 'ui') {
                // Edit via UI: double-click and type
                const athleteCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete'));
                await userEvent.dblClick(athleteCell);
                await asyncSetTimeout(1);

                const input = await waitForInput(gridDiv, athleteCell, { popup: false });
                await userEvent.clear(input);
                await userEvent.type(input, 'usain bolt{Enter}');
                await asyncSetTimeout(1);
            } else {
                // Edit via data: use rowNode.setDataValue
                const rowNode = api.getDisplayedRowAtIndex(0)!;
                rowNode.setDataValue('athlete', 'usain bolt');
                await asyncSetTimeout(1);
            }

            // Verify the grid state with GridRows snapshot
            const afterRows = new GridRows(api, `after ${source} edit`);
            await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"USAIN BOLT" age:30 country:"USA"
            `);

            // Verify the cell displays the uppercase value
            const athleteCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete'));
            expect(athleteCell).toHaveTextContent('USAIN BOLT');

            // Verify the data was transformed
            expect(api.getDisplayedRowAtIndex(0)?.data?.athlete).toBe('USAIN BOLT');

            // Verify onCellValueChanged received the transformed (uppercase) value
            expect(cellValueChangedEvents).toHaveLength(1);
            expect(cellValueChangedEvents[0].oldValue).toBe('Michael Phelps');
            // The newValue should be the transformed uppercase value, not the original lowercase input
            expect(cellValueChangedEvents[0].newValue).toBe('USAIN BOLT');

            // UI edit: 1 editor started/stopped; data edit: no editors
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: source === 'ui' ? 1 : 0,
                cellEditingStopped: source === 'ui' ? 1 : 0,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
        }
    );

    test.each(['ui', 'data'] as const)(
        'onCellValueChanged receives correct newValue with nested valueGetter via %s',
        async (source) => {
            // This test verifies that when using a valueGetter that reads from nested data,
            // onCellValueChanged receives the correct primitive value, not an object.
            const cellValueChangedEvents: Array<{ oldValue: any; newValue: any }> = [];

            const api = await gridMgr.createGridAndWait(`myGrid-nested-${source}`, {
                columnDefs: [
                    { field: 'name' },
                    {
                        colId: 'country',
                        headerName: 'Country',
                        editable: true,
                        valueGetter: (params) => params.data?.person?.country,
                        valueSetter: (params) => {
                            params.data.person.country = params.newValue;
                            return true;
                        },
                    },
                ],
                rowData: [{ name: 'John', person: { country: 'United States' } }],
                onCellValueChanged: (event) => {
                    cellValueChangedEvents.push({
                        oldValue: event.oldValue,
                        newValue: event.newValue,
                    });
                },
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            if (source === 'ui') {
                // Edit via UI: double-click and type
                const countryCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'country'));
                await userEvent.dblClick(countryCell);
                await asyncSetTimeout(1);

                const input = await waitForInput(gridDiv, countryCell, { popup: false });
                await userEvent.clear(input);
                await userEvent.type(input, 'Canada{Enter}');
                await asyncSetTimeout(1);
            } else {
                // Edit via data: use rowNode.setDataValue
                const rowNode = api.getDisplayedRowAtIndex(0)!;
                rowNode.setDataValue('country', 'Canada');
                await asyncSetTimeout(1);
            }

            // Verify the grid state with GridRows snapshot
            const afterRows = new GridRows(api, `after ${source} edit`);
            await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"John" country:"Canada"
            `);

            // Verify the cell displays the new value
            const countryCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'country'));
            expect(countryCell).toHaveTextContent('Canada');

            // Verify the nested data was updated
            expect(api.getDisplayedRowAtIndex(0)?.data?.person?.country).toBe('Canada');

            // Verify onCellValueChanged received the correct primitive value, not an object
            expect(cellValueChangedEvents).toHaveLength(1);
            expect(cellValueChangedEvents[0].oldValue).toBe('United States');
            // The newValue should be the primitive string, not an object like {country: 'Canada'}
            expect(cellValueChangedEvents[0].newValue).toBe('Canada');

            // UI edit: 1 editor started/stopped; data edit: no editors
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: source === 'ui' ? 1 : 0,
                cellEditingStopped: source === 'ui' ? 1 : 0,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
        }
    );

    test('tabbing into empty cell then clicking another cell closes editor', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }],
            defaultColDef: {
                editable: true,
            },
            rowData: [
                // First row has missing price - this is key to reproducing the bug
                { make: 'Tesla', model: 'Model Y', electric: true },
                { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
                { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
            ],
        });
        await new GridColumns(api, `tabbing into empty cell then clicking another cell closes editor setup`)
            .checkColumns(`
                CENTER
                ├── make "Make" width:200 editable
                ├── model "Model" width:200 editable
                ├── price "Price" width:200 editable
                └── electric "Electric" width:200 editable
            `);
        await new GridRows(api, `tabbing into empty cell then clicking another cell closes editor setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Tesla" model:"Model Y" electric:true
            ├── LEAF id:1 make:"Ford" model:"F-Series" price:33850 electric:false
            └── LEAF id:2 make:"Toyota" model:"Corolla" price:29600 electric:false
        `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Step 1: Start editing the 'Tesla' cell (top-left)
        const makeCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'make'));
        await userEvent.dblClick(makeCell);
        await waitForInput(gridDiv, makeCell, { popup: false });
        expect(api.getCellEditorInstances()).toHaveLength(1);

        // Step 2: Press Tab twice to navigate to the empty price cell
        await userEvent.keyboard('{Tab}');
        await asyncSetTimeout(1);
        const modelCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'model'));
        await waitForInput(gridDiv, modelCell, { popup: false });
        expect(api.getCellEditorInstances()).toHaveLength(1);

        await userEvent.keyboard('{Tab}');
        await asyncSetTimeout(1);
        const priceCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'price'));
        await waitForInput(gridDiv, priceCell, { popup: false });
        expect(api.getCellEditorInstances()).toHaveLength(1);

        // Step 3: Click on another cell (e.g., Ford's make cell in row 1)
        // setFocusedCell triggers focus change which should stop editing through
        // the focus change handler. Then startEditingCell begins editing the new cell.
        api.setFocusedCell(1, 'make');
        await asyncSetTimeout(10);

        // Verify that the orphan editor from row 0 price cell is closed after focus change
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(priceCell.querySelector('input[type="text"]')).toBeNull();
        expect(api.getEditingCells()).toHaveLength(0);
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 3,
            cellEditingStopped: 3,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        // Start editing on the new cell (simulates what happens when clicking an editable cell)
        api.startEditingCell({ rowIndex: 1, colKey: 'make' });
        await asyncSetTimeout(10);

        // Step 4: Verify the editor is closed
        // The input field from price cell should be removed after clicking another cell
        // Row 1 make should be the only editing cell now
        expect(api.getCellEditorInstances()).toHaveLength(1);
        expect(priceCell.querySelector('input[type="text"]')).toBeNull();
        expect(api.getEditingCells()).toHaveLength(1);
        expect(api.getEditingCells()[0].rowIndex).toBe(1);

        // Stop editing to clean up
        api.stopEditing();
        await asyncSetTimeout(1);

        // Verify events: 4 starts (make, model, price in row 0, then make in row 1)
        // and 4 stops (make, model, price in row 0, then make in row 1)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 4,
            cellEditingStopped: 4,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `tabbing into empty cell then clicking another cell closes editor final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 make:"Tesla" model:"Model Y" electric:true
                ├── LEAF id:1 make:"Ford" model:"F-Series" price:33850 electric:false
                └── LEAF id:2 make:"Toyota" model:"Corolla" price:29600 electric:false
            `
        );
    });

    test('full row editing: tabbing into empty cell then clicking another cell closes editors', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }],
            defaultColDef: {
                editable: true,
            },
            editType: 'fullRow',
            rowData: [
                // First row has missing price - this is key to reproducing the bug
                { make: 'Tesla', model: 'Model Y', electric: true },
                { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
                { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
            ],
        });
        await new GridColumns(
            api,
            `full row editing: tabbing into empty cell then clicking another cell closes edit setup`
        ).checkColumns(`
            CENTER
            ├── make "Make" width:200 editable
            ├── model "Model" width:200 editable
            ├── price "Price" width:200 editable
            └── electric "Electric" width:200 editable
        `);
        await new GridRows(
            api,
            `full row editing: tabbing into empty cell then clicking another cell closes edit setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Tesla" model:"Model Y" electric:true
            ├── LEAF id:1 make:"Ford" model:"F-Series" price:33850 electric:false
            └── LEAF id:2 make:"Toyota" model:"Corolla" price:29600 electric:false
        `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Step 1: Start editing the 'Tesla' row by double-clicking the make cell
        const makeCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'make'));
        await userEvent.dblClick(makeCell);
        await waitForInput(gridDiv, makeCell, { popup: false });
        // Full row edit should have editors for all 4 columns
        expect(api.getCellEditorInstances().length).toBeGreaterThanOrEqual(3);
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(true);

        // Step 2: Press Tab twice to navigate to the empty price cell
        await userEvent.keyboard('{Tab}');
        await asyncSetTimeout(1);
        const modelCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'model'));
        await waitForInput(gridDiv, modelCell, { popup: false });

        await userEvent.keyboard('{Tab}');
        await asyncSetTimeout(1);
        const priceCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'price'));
        await waitForInput(gridDiv, priceCell, { popup: false });

        // Step 3: Click on another row (Ford's make cell in row 1)
        api.setFocusedCell(1, 'make');
        await asyncSetTimeout(10);

        // Verify that row 0 editors are closed after focus change
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(false);
        expect(priceCell.querySelector('input')).toBeNull();
        expect(api.getEditingCells()).toHaveLength(0);
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 4,
            cellEditingStopped: 4,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        // Start editing on the new row
        api.startEditingCell({ rowIndex: 1, colKey: 'make' });
        await asyncSetTimeout(10);

        // Step 4: Verify row 0 editors are closed
        // Row 0 should no longer be in edit mode
        expect(getRowHtmlElement(api, '0')?.classList.contains('ag-row-editing')).toBe(false);
        expect(getRowHtmlElement(api, '1')?.classList.contains('ag-row-editing')).toBe(true);

        // Row 0 price cell should not have an input anymore
        expect(priceCell.querySelector('input')).toBeNull();

        // All editing cells should be in row 1
        const editingCells = api.getEditingCells();
        expect(editingCells.length).toBeGreaterThan(0);
        expect(editingCells.every((cell) => cell.rowIndex === 1)).toBe(true);

        // Stop editing to clean up
        api.stopEditing();
        await asyncSetTimeout(1);

        // Verify events: row 0 starts 4 editors, row 0 stops 4 editors, row 1 starts 4 editors, row 1 stops 4 editors
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 8,
            cellEditingStopped: 8,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(
            api,
            `full row editing: tabbing into empty cell then clicking another cell closes edit final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 make:"Tesla" model:"Model Y" electric:true
            ├── LEAF id:1 make:"Ford" model:"F-Series" price:33850 electric:false
            └── LEAF id:2 make:"Toyota" model:"Corolla" price:29600 electric:false
        `);
    });

    // Test for valueSetter returning false preventing Delete key changes with cellSelection
    test('Delete key on cell with valueSetter returning false and cellSelection should not change value', async () => {
        // 1. Focus on a cell that has a value and select it (create cell range)
        // 2. Press DELETE - the value should NOT be removed because valueSetter returns false
        // 3. Double-click another cell to enter edit mode
        // 4. Press ESC to exit edit mode
        // Expected: The original value should persist because valueSetter returned false

        const valueSetterCalls: Array<{ oldValue: any; newValue: any }> = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'country',
                    flex: 1,
                    editable: true,
                    cellDataType: false,
                    valueSetter: (params) => {
                        valueSetterCalls.push({
                            oldValue: params.oldValue,
                            newValue: params.newValue,
                        });
                        // Return false to reject the change
                        return false;
                    },
                },
                {
                    field: 'sport',
                    flex: 1,
                    editable: true,
                },
            ],
            cellSelection: {
                handle: { mode: 'fill' },
            },
            rowData: [
                { country: 'United States', sport: 'Swimming' },
                { country: 'China', sport: 'Gymnastics' },
            ],
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States" sport:"Swimming"
            └── LEAF id:1 country:"China" sport:"Gymnastics"
        `);

        // Step 1: Focus on a cell that has a value and create a cell range
        const countryCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'country'));
        expect(countryCell).toHaveTextContent('United States');

        await userEvent.click(countryCell);
        // Create a cell range for the clicked cell (simulating proper cell selection)
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['country'] });
        await asyncSetTimeout(1);

        // Verify we are not in edit mode
        expect(api.getEditingCells()).toHaveLength(0);

        // Step 2: Press DELETE - the valueSetter should be called but return false
        await userEvent.keyboard('{Delete}');
        await asyncSetTimeout(1);

        // Verify valueSetter was called with correct values
        expect(valueSetterCalls).toHaveLength(1);
        expect(valueSetterCalls[0].newValue).toBeNull();
        expect(valueSetterCalls[0].oldValue).toBe('United States');

        // Since valueSetter returned false, the value should remain unchanged
        expect(countryCell).toHaveTextContent('United States');
        expect(api.getDisplayedRowAtIndex(0)?.data.country).toBe('United States');

        // Verify grid data is unchanged after Delete
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States" sport:"Swimming"
            └── LEAF id:1 country:"China" sport:"Gymnastics"
        `);

        // Verify no cellValueChanged event was fired because valueSetter returned false
        expect(eventTracker.counts.cellValueChanged).toBe(0);

        // Step 3: Double-click another cell to enter edit mode
        const sportCell = getByTestId(gridDiv, agTestIdFor.cell('1', 'sport'));
        await userEvent.dblClick(sportCell);
        await asyncSetTimeout(1);

        // Verify we are now in edit mode on the sport cell
        const editingCells = api.getEditingCells();
        expect(editingCells).toHaveLength(1);
        expect(editingCells[0].colId).toBe('sport');
        expect(editingCells[0].rowIndex).toBe(1);

        // Verify cellEditingStarted was fired for the sport cell
        expect(eventTracker.counts.cellEditingStarted).toBe(1);

        // The country cell value should still be unchanged
        expect(countryCell).toHaveTextContent('United States');
        expect(api.getDisplayedRowAtIndex(0)?.data.country).toBe('United States');

        // Step 4: Press ESC to exit edit mode (cancel edit)
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        // Verify we exited edit mode
        expect(api.getEditingCells()).toHaveLength(0);

        // Step 5: The value in the initial cell should NOT have changed
        // Since valueSetter returned false, the original value should persist
        expect(countryCell).toHaveTextContent('United States');
        expect(api.getDisplayedRowAtIndex(0)?.data.country).toBe('United States');

        // Final grid state verification - all data should be unchanged
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"United States" sport:"Swimming"
            └── LEAF id:1 country:"China" sport:"Gymnastics"
        `);

        // Verify final event counts:
        // - cellValueChanged should be 0 (valueSetter returned false for Delete, and edit was cancelled)
        // - cellEditingStarted should be 1 (double-click on sport cell)
        // - cellEditingStopped: 1 for the cancelled edit (ESC on the sport cell)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
    });
});
