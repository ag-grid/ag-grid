import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    CheckboxEditorModule,
    CustomEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

/**
 * Tests for setDataValue('edit') behaviour — verifying that pushing a value via the 'edit'
 * source correctly updates each built-in editor type and custom editors.
 */
describe('Cell Editing: setDataValue in Batch Mode — editor updates', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            BatchEditModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            SelectEditorModule,
            CheckboxEditorModule,
            LargeTextEditorModule,
            CustomEditorModule,
            RenderApiModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test("'edit' updates editor value during batch and preserves focus", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `'edit' updates editor value during batch and preserves focus setup`).checkColumns(
            `
                CENTER
                └── a "A" width:200 editable
            `
        );
        await new GridRows(api, `'edit' updates editor value during batch and preserves focus setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open editor on the cell
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        expect(editor).toBeInTheDocument();

        // Type something in the editor
        await userEvent.clear(editor);
        await userEvent.keyboard('typed');
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Verify editor has the typed value
        expect(editor).toHaveValue('typed');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed');

        // Push a different value using 'edit' source
        rowNode.setDataValue('a', 'pushed', 'edit');
        await asyncSetTimeout(1);

        // Built-in editors implement setEditValue — same element, no recreation
        const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
        expect(editorAfter).toBe(editor);
        expect(editorAfter).toHaveFocus();

        // getCellValue with 'edit' returns the pushed value from the model
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');

        // Data should NOT be changed (not committed yet)
        expect(rowNode.data.a).toBe('initial');
        expect(rowNode.getDataValue('a')).toBe('initial');

        api.cancelBatchEdit();
        await new GridRows(api, `'edit' updates editor value during batch and preserves focus final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
    });

    test("'batch' source with open editor: stages pending value without closing or modifying the editor", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `'batch' source with open editor: stages pending value without closing or modifyi setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `'batch' source with open editor: stages pending value without closing or modifyi setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open editor and type a value
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        expect(editor).toBeInTheDocument();

        await userEvent.clear(editor);
        await userEvent.keyboard('typed');
        await asyncSetTimeout(1);

        expect(editor).toHaveValue('typed');

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a different value using 'batch' source — should NOT modify the editor
        rowNode.setDataValue('a', 'staged', 'batch');
        await asyncSetTimeout(1);

        // Editor is still open and still shows what the user typed
        const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
        expect(editorAfter).toBe(editor); // same element, not recreated
        expect(editorAfter).toHaveValue('typed'); // editor value unchanged

        // The 'edit' layer (active editor) takes precedence over the pending 'batch' value
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('staged');

        // Data unchanged
        expect(rowNode.data.a).toBe('initial');
        expect(rowNode.getDataValue('a')).toBe('initial');

        api.cancelBatchEdit();
        await new GridRows(
            api,
            `'batch' source with open editor: stages pending value without closing or modifyi final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
    });

    test("'batch' source with open editor: ESC closes editor and cell shows batch pending value", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open editor and type a value
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        expect(editor).toBeInTheDocument();

        await userEvent.clear(editor);
        await userEvent.keyboard('typed');
        await asyncSetTimeout(1);

        expect(editor).toHaveValue('typed');

        // Editor open, user typed 'typed', data still 'initial'
        await new GridRows(api, 'editor open — user typed value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed" "initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a different value using 'batch' source — editor stays open with 'typed'
        rowNode.setDataValue('a', 'staged', 'batch');
        await asyncSetTimeout(1);

        // Editor is still open and still shows what the user typed
        expect(gridDiv.querySelector<HTMLInputElement>('input')).toBe(editor);
        expect(editor).toHaveValue('typed');

        // After batch setDataValue: editor still open showing 'typed', batch pending is 'staged'
        await new GridRows(api, 'after batch setDataValue — editor still open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed" ⏳"staged" "initial"
        `);

        // Press ESC — editor should close and cell should show the batch pending value
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        // Editor is closed
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // Cell shows the batch pending value, not the typed value
        await new GridRows(api, 'after ESC — pending value from batch source').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"staged" "initial"
        `);

        // Data is still initial (batch not committed)
        expect(rowNode.data.a).toBe('initial');

        api.cancelBatchEdit();
    });

    test("'batch' source with open editor: Enter commits editor typed value as pending", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open editor and type a value
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        expect(editor).toBeInTheDocument();

        await userEvent.clear(editor);
        await userEvent.keyboard('typed');
        await asyncSetTimeout(1);

        expect(editor).toHaveValue('typed');

        // Editor open, user typed 'typed', data still 'initial'
        await new GridRows(api, 'editor open — user typed value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed" "initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a different value using 'batch' source — editor stays open with 'typed'
        rowNode.setDataValue('a', 'staged', 'batch');
        await asyncSetTimeout(1);

        // Editor is still open
        expect(gridDiv.querySelector<HTMLInputElement>('input')).toBe(editor);
        expect(editor).toHaveValue('typed');

        // After batch setDataValue: editor still open showing 'typed', batch pending is 'staged'
        await new GridRows(api, 'after batch setDataValue — editor still open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed" ⏳"staged" "initial"
        `);

        // Press Enter — editor value ('typed') should become the pending value
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // Editor is closed
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // Cell shows the typed value as pending (overrides the 'staged' batch value)
        await new GridRows(api, 'after Enter — typed value becomes pending').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"typed" "initial"
        `);

        // Data is still initial (batch not committed)
        expect(rowNode.data.a).toBe('initial');

        // Commit and verify the typed value is committed
        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('typed');
    });

    test("'batch' source with open editor in fullRow mode: ESC closes editor and cell shows batch pending value", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            editType: 'fullRow',
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                { field: 'b', editable: true, cellEditor: 'agTextCellEditor' },
            ],
            rowData: [{ id: '0', a: 'A0', b: 'B0' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open full-row editor
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await waitForInput(gridDiv, cellA, { popup: false });

        // Both cells should have editors in full-row mode
        const inputs = gridDiv.querySelectorAll<HTMLInputElement>('input');
        expect(inputs).toHaveLength(2);

        // Type in the 'a' editor
        const inputA = Array.from(inputs).find((i) => i.value === 'A0')!;
        await userEvent.clear(inputA);
        await userEvent.type(inputA, 'typed-a');
        await asyncSetTimeout(1);

        // Full-row editor open: user typed 'typed-a' in col a, col b still 'B0'
        await new GridRows(api, 'full-row editor open — user typed in col a').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed-a" "A0" b:"B0"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a batch value to col a — editor stays open
        rowNode.setDataValue('a', 'staged-a', 'batch');
        await asyncSetTimeout(1);

        // Editor still open with typed value
        expect(inputA).toHaveValue('typed-a');

        // After batch setDataValue: editor still open, batch pending staged
        await new GridRows(api, 'after batch setDataValue — full-row editor still open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed-a" ⏳"staged-a" "A0" b:"B0"
        `);

        // Press ESC — editors close, cell shows batch pending value
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        expect(api.getCellEditorInstances()).toHaveLength(0);

        await new GridRows(api, 'after ESC — pending value from batch source').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"staged-a" "A0" b:"B0"
        `);

        expect(rowNode.data.a).toBe('A0');
        expect(rowNode.data.b).toBe('B0');

        api.cancelBatchEdit();
    });

    test("'batch' source with open editor in fullRow mode: Enter commits editor typed value as pending", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            editType: 'fullRow',
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                { field: 'b', editable: true, cellEditor: 'agTextCellEditor' },
            ],
            rowData: [{ id: '0', a: 'A0', b: 'B0' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open full-row editor
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await waitForInput(gridDiv, cellA, { popup: false });

        // Both cells should have editors in full-row mode
        const inputs = gridDiv.querySelectorAll<HTMLInputElement>('input');
        expect(inputs).toHaveLength(2);

        // Type in the 'a' editor
        const inputA = Array.from(inputs).find((i) => i.value === 'A0')!;
        await userEvent.clear(inputA);
        await userEvent.type(inputA, 'typed-a');
        await asyncSetTimeout(1);

        // Full-row editor open: user typed 'typed-a' in col a
        await new GridRows(api, 'full-row editor open — user typed in col a').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed-a" "A0" b:"B0"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a batch value to col a — editor stays open
        rowNode.setDataValue('a', 'staged-a', 'batch');
        await asyncSetTimeout(1);

        // Editor still open with typed value
        expect(inputA).toHaveValue('typed-a');

        // After batch setDataValue: editor still open, batch pending staged
        await new GridRows(api, 'after batch setDataValue — full-row editor still open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typed-a" ⏳"staged-a" "A0" b:"B0"
        `);

        // Press Enter — editor typed value becomes pending
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(api.getCellEditorInstances()).toHaveLength(0);

        // Typed value overrides the batch-staged value
        await new GridRows(api, 'after Enter — typed value becomes pending').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"typed-a" "A0" b:"B0"
        `);

        expect(rowNode.data.a).toBe('A0');
        expect(rowNode.data.b).toBe('B0');

        // Commit and verify the typed value is committed
        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('typed-a');
        expect(rowNode.data.b).toBe('B0');
    });

    test("'edit' updates editor value outside batch mode and preserves focus", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `'edit' updates editor value outside batch mode and preserves focus setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `'edit' updates editor value outside batch mode and preserves focus setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        // Open editor on the cell (no batch mode)
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        expect(editor).toBeInTheDocument();

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push a value using 'edit' source
        rowNode.setDataValue('a', 'pushed', 'edit');
        await asyncSetTimeout(1);

        // Built-in editors implement setEditValue — same element, no recreation
        const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
        expect(editorAfter).toBe(editor);
        expect(editorAfter).toHaveFocus();

        // getCellValue with 'edit' returns the pushed value from the model
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');

        // Data should NOT be changed (editor still open, not committed)
        expect(rowNode.data.a).toBe('initial');
        await new GridRows(api, `'edit' updates editor value outside batch mode and preserves focus final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:🖍️"pushed" "initial"
            `
        );
    });

    test("'edit' stages as pending when no editor is open during batch", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'staged', 'edit');

        await new GridRows(api, 'after edit setDataValue no editor').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"staged" "initial"
        `);

        expect(rowNode.data.a).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('staged');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('staged');
    });

    test("'edit' writes directly to data when no editor and no batch", async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `'edit' writes directly to data when no editor and no batch setup`).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `'edit' writes directly to data when no editor and no batch setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        const result = rowNode.setDataValue('a', 'direct', 'edit');

        expect(result).toBe(true);
        expect(rowNode.data.a).toBe('direct');
        expect(rowNode.getDataValue('a')).toBe('direct');
        await new GridRows(api, `'edit' writes directly to data when no editor and no batch final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"direct"
        `);
    });

    test("'edit' does not fire cellValueChanged when updating editor value", async () => {
        const cellValueChangedSpy = vi.fn();
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: cellValueChangedSpy,
        });
        await new GridColumns(api, `'edit' does not fire cellValueChanged when updating editor value setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `'edit' does not fire cellValueChanged when updating editor value setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        api.startBatchEdit();
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Open editor
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);

        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await waitForInput(gridDiv, cellA, { popup: false });

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push value via 'edit' source — should NOT fire cellValueChanged
        cellValueChangedSpy.mockClear();
        rowNode.setDataValue('a', 'pushed', 'edit');
        await asyncSetTimeout(1);

        expect(cellValueChangedSpy).not.toHaveBeenCalled();
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');

        api.cancelBatchEdit();
        await new GridRows(api, `'edit' does not fire cellValueChanged when updating editor value final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `
        );
    });

    describe('built-in editor types', () => {
        test('agTextCellEditor: DOM value is updated in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const editorBefore = gridDiv.querySelector<HTMLInputElement>('input');

            // Push a value via 'edit' source — built-in editors use setEditValue (no recreation)
            rowNode.setDataValue('a', 'new-value', 'edit');
            await asyncSetTimeout(1);

            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBe(editorBefore);
            expect(editorAfter).toHaveFocus();
            expect(editorAfter!.value).toBe('new-value');

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"new-value" "initial"
            `);

            api.cancelBatchEdit();
        });

        test('agNumberCellEditor: DOM value is updated in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agNumberCellEditor' }],
                rowData: [{ id: '0', a: 10 }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const editorBefore = gridDiv.querySelector<HTMLInputElement>('input');

            rowNode.setDataValue('a', 42, 'edit');
            await asyncSetTimeout(1);

            // Built-in editors use setEditValue — same element, no recreation
            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBe(editorBefore);
            expect(editorAfter).toHaveFocus();

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe(42);
            expect(rowNode.data.a).toBe(10);

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳42 10
            `);

            api.cancelBatchEdit();
        });

        test('agDateCellEditor: DOM value is updated in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateCellEditor' }],
                rowData: [{ id: '0', a: new Date('2024-01-15') }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `agDateCellEditor: DOM value is updated in-place setup`).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(api, `agDateCellEditor: DOM value is updated in-place setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"2024-01-15"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const editorBefore = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorBefore).toBeInTheDocument();
            expect(editorBefore!.value).toBe('2024-01-15');

            // Push a new Date value
            const newDate = new Date('2025-06-20');
            rowNode.setDataValue('a', newDate, 'edit');
            await asyncSetTimeout(1);

            // Same element, no recreation
            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBe(editorBefore);
            expect(editorAfter!.value).toBe('2025-06-20');

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toEqual(newDate);
            expect(rowNode.data.a).toEqual(new Date('2024-01-15'));

            api.cancelBatchEdit();
            await new GridRows(api, `agDateCellEditor: DOM value is updated in-place final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"2024-01-15"
            `);
        });

        test('agDateStringCellEditor: DOM value is updated in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateStringCellEditor' }],
                rowData: [{ id: '0', a: '2024-01-15' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const editorBefore = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorBefore).toBeInTheDocument();
            expect(editorBefore!.value).toBe('2024-01-15');

            rowNode.setDataValue('a', '2025-06-20', 'edit');
            await asyncSetTimeout(1);

            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBe(editorBefore);
            expect(editorAfter!.value).toBe('2025-06-20');

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('2025-06-20');
            expect(rowNode.data.a).toBe('2024-01-15');

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"2025-06-20" "2024-01-15"
            `);

            api.cancelBatchEdit();
        });

        test('agSelectCellEditor: editor value is updated', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'alpha' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            rowNode.setDataValue('a', 'gamma', 'edit');
            await asyncSetTimeout(1);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('gamma');
            expect(rowNode.data.a).toBe('alpha');

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"gamma" "alpha"
            `);

            api.cancelBatchEdit();
        });

        test('agCheckboxCellEditor: DOM checkbox is toggled in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: false }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const checkboxBefore = gridDiv.querySelector<HTMLInputElement>('input[type="checkbox"]');
            expect(checkboxBefore).toBeInTheDocument();
            expect(checkboxBefore!.checked).toBe(false);

            rowNode.setDataValue('a', true, 'edit');
            await asyncSetTimeout(1);

            // Same element, no recreation
            const checkboxAfter = gridDiv.querySelector<HTMLInputElement>('input[type="checkbox"]');
            expect(checkboxAfter).toBe(checkboxBefore);
            expect(checkboxAfter!.checked).toBe(true);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe(true);
            expect(rowNode.data.a).toBe(false);

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳true false
            `);

            api.cancelBatchEdit();
        });

        test('agLargeTextCellEditor: DOM textarea is updated in-place', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true },
                ],
                rowData: [{ id: '0', a: 'initial text' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const textareaBefore = gridDiv.querySelector<HTMLTextAreaElement>('textarea');
            expect(textareaBefore).toBeInTheDocument();

            rowNode.setDataValue('a', 'updated long text', 'edit');
            await asyncSetTimeout(1);

            // Same element, no recreation
            const textareaAfter = gridDiv.querySelector<HTMLTextAreaElement>('textarea');
            expect(textareaAfter).toBe(textareaBefore);
            expect(textareaAfter!.value).toBe('updated long text');

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('updated long text');
            expect(rowNode.data.a).toBe('initial text');

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"updated long text" "initial text"
            `);

            api.cancelBatchEdit();
        });

        test('agTextCellEditor with useFormatter: formatted value is updated', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agTextCellEditor',
                        cellEditorParams: { useFormatter: true },
                        valueFormatter: (params: any) => `$${params.value}`,
                    },
                ],
                rowData: [{ id: '0', a: '100' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `agTextCellEditor with useFormatter: formatted value is updated setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `agTextCellEditor with useFormatter: formatted value is updated setup`).check(`
                ROOT id:ROOT_NODE_ID a:"$undefined"
                └── LEAF id:0 a:"$100"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            const editorBefore = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorBefore).toBeInTheDocument();
            // With useFormatter, the initial display should be formatted
            expect(editorBefore!.value).toBe('$100');

            // Push a new raw value — setEditValue should apply the formatter
            rowNode.setDataValue('a', '200', 'edit');
            await asyncSetTimeout(1);

            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBe(editorBefore);
            expect(editorAfter!.value).toBe('$200');

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('200');
            expect(rowNode.data.a).toBe('100');

            api.cancelBatchEdit();
            await new GridRows(api, `agTextCellEditor with useFormatter: formatted value is updated final state`).check(
                `
                    ROOT id:ROOT_NODE_ID a:"$undefined"
                    └── LEAF id:0 a:"$100"
                `
            );
        });
    });

    describe('batch value resolution', () => {
        test("'edit' push is visible via getCellValue with from:'batch'", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `'edit' push is visible via getCellValue with from:'batch' setup`).checkColumns(
                `
                    CENTER
                    └── a "A" width:200 editable
                `
            );
            await new GridRows(api, `'edit' push is visible via getCellValue with from:'batch' setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            rowNode.setDataValue('a', 'pushed', 'edit');
            await asyncSetTimeout(1);

            // The pushed value should be visible via all resolution modes
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');
            expect(rowNode.data.a).toBe('initial');

            api.cancelBatchEdit();
            await new GridRows(api, `'edit' push is visible via getCellValue with from:'batch' final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);
        });

        test("'edit' supports multiple sequential pushes", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `'edit' supports multiple sequential pushes setup`).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(api, `'edit' supports multiple sequential pushes setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push multiple values in sequence
            rowNode.setDataValue('a', 'first', 'edit');
            await asyncSetTimeout(1);
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('first');

            rowNode.setDataValue('a', 'second', 'edit');
            await asyncSetTimeout(1);
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('second');

            rowNode.setDataValue('a', 'third', 'edit');
            await asyncSetTimeout(1);
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('third');

            // Editor should still be open with the last value
            const editorAfter = gridDiv.querySelector<HTMLInputElement>('input');
            expect(editorAfter).toBeInTheDocument();
            expect(editorAfter).toHaveFocus();
            expect(editorAfter!.value).toBe('third');

            expect(rowNode.data.a).toBe('initial');

            api.cancelBatchEdit();
            await new GridRows(api, `'edit' supports multiple sequential pushes final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);
        });

        test("'edit' pushed value is committed on commitBatchEdit", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            rowNode.setDataValue('a', 'committed-value', 'edit');
            await asyncSetTimeout(1);

            // Commit the batch — value should now be written to data
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"committed-value"
            `);

            expect(rowNode.data.a).toBe('committed-value');
            expect(rowNode.getDataValue('a')).toBe('committed-value');
        });
    });

    describe('custom editors', () => {
        test('custom editor with refresh() uses fast path', async () => {
            const refreshSpy = vi.fn();

            class RefreshableEditor implements ICellEditorComp {
                private params!: ICellEditorParams;
                private eGui!: HTMLInputElement;

                getGui(): HTMLElement {
                    return this.eGui;
                }

                init(params: ICellEditorParams): void {
                    this.params = params;
                    this.eGui = document.createElement('input');
                    this.eGui.value = String(params.value ?? '');
                    this.eGui.classList.add('refreshable-editor');
                }

                getValue(): any {
                    return this.eGui.value;
                }

                refresh(params: ICellEditorParams): void {
                    refreshSpy(params.value);
                    this.params = params;
                    this.eGui.value = String(params.value ?? '');
                }

                focusIn(): void {
                    this.eGui.focus();
                }

                afterGuiAttached(): void {
                    this.eGui.focus();
                }
            }

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: RefreshableEditor }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push value — should call refresh() instead of destroying/recreating
            rowNode.setDataValue('a', 'refreshed', 'edit');
            await asyncSetTimeout(1);

            expect(refreshSpy).toHaveBeenCalledWith('refreshed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('refreshed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('refreshed');

            // The editor's input should have the new value
            const editor = gridDiv.querySelector<HTMLInputElement>('.refreshable-editor');
            expect(editor).toBeInTheDocument();
            expect(editor!.value).toBe('refreshed');

            expect(rowNode.data.a).toBe('initial');

            await new GridRows(api, 'after edit push').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"refreshed" "initial"
            `);

            api.cancelBatchEdit();
        });

        test('custom editor with refresh() uses refresh path, not setEditValue', async () => {
            const refreshSpy = vi.fn();

            class CustomEditorWithBoth implements ICellEditorComp {
                private eGui!: HTMLInputElement;

                getGui(): HTMLElement {
                    return this.eGui;
                }

                init(params: ICellEditorParams): void {
                    this.eGui = document.createElement('input');
                    this.eGui.value = String(params.value ?? '');
                    this.eGui.classList.add('custom-both-editor');
                }

                getValue(): any {
                    return this.eGui.value;
                }

                // Custom editors may define setEditValue, but it should NOT be called —
                // only built-in editors (extending AgAbstractCellEditor) use the setEditValue path.
                setEditValue(_value: any): void {
                    throw new Error('Should not be called for custom editors');
                }

                refresh(params: ICellEditorParams): void {
                    refreshSpy(params.value);
                    this.eGui.value = String(params.value ?? '');
                }

                afterGuiAttached(): void {
                    this.eGui.focus();
                }
            }

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: CustomEditorWithBoth }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `custom editor with refresh() uses refresh path, not setEditValue setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `custom editor with refresh() uses refresh path, not setEditValue setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Custom editors always use refresh(), never setEditValue
            rowNode.setDataValue('a', 'via-refresh', 'edit');
            await asyncSetTimeout(1);

            expect(refreshSpy).toHaveBeenCalledWith('via-refresh');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('via-refresh');

            const editor = gridDiv.querySelector<HTMLInputElement>('.custom-both-editor');
            expect(editor).toBeInTheDocument();
            expect(editor!.value).toBe('via-refresh');

            api.cancelBatchEdit();
            await new GridRows(api, `custom editor with refresh() uses refresh path, not setEditValue final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 a:"initial"
                `);
        });

        test('custom editor without refresh() recreates editor and preserves focus', async () => {
            let initCount = 0;

            class NoRefreshEditor implements ICellEditorComp {
                private eGui!: HTMLInputElement;

                getGui(): HTMLElement {
                    return this.eGui;
                }

                init(params: ICellEditorParams): void {
                    initCount++;
                    this.eGui = document.createElement('input');
                    this.eGui.value = String(params.value ?? '');
                    this.eGui.classList.add('no-refresh-editor');
                }

                getValue(): any {
                    return this.eGui.value;
                }

                focusIn(): void {
                    this.eGui.focus();
                }

                afterGuiAttached(): void {
                    this.eGui.focus();
                }
            }

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: NoRefreshEditor }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `custom editor without refresh() recreates editor and preserves focus setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `custom editor without refresh() recreates editor and preserves focus setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 a:"initial"
                `
            );

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            expect(initCount).toBe(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push value — should destroy and recreate the editor (no refresh())
            rowNode.setDataValue('a', 'recreated', 'edit');
            await asyncSetTimeout(1);

            // Editor was recreated (init called again)
            expect(initCount).toBe(2);
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('recreated');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('recreated');

            // The new editor should show the pushed value and have focus
            const editor = gridDiv.querySelector<HTMLInputElement>('.no-refresh-editor');
            expect(editor).toBeInTheDocument();
            expect(editor).toHaveFocus();
            expect(editor!.value).toBe('recreated');

            expect(rowNode.data.a).toBe('initial');

            api.cancelBatchEdit();
            await new GridRows(api, `custom editor without refresh() recreates editor and preserves focus final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 a:"initial"
                `);
        });
    });

    describe('null and undefined initial values (UNEDITED editor state)', () => {
        test("'edit' pushes value into UNEDITED open editor on null cell during batch", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: null }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial state').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:null
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            // Open editor — cell is UNEDITED: editor open but value unchanged (pendingValue=UNEDITED)
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            expect(editor).toBeInTheDocument();

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Editor is UNEDITED: no pending value yet — row shows editing state, cell shows null source
            await new GridRows(api, 'UNEDITED editor open').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:null
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBeNull();
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBeNull();
            expect(rowNode.getDataValue('a')).toBeNull();

            // Push a value via 'edit' source — editor value and pending value are set
            rowNode.setDataValue('a', 'pushed', 'edit');
            await asyncSetTimeout(1);

            // Editor DOM reflects the pushed value
            expect(editor).toHaveValue('pushed');

            await new GridRows(api, 'after edit push on null cell').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"pushed" null
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBeNull();

            // getDataValue always returns committed data (null)
            expect(rowNode.getDataValue('a')).toBeNull();
            expect(rowNode.data.a).toBeNull();

            // Commit — null cell becomes 'pushed'
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"pushed"
            `);

            expect(rowNode.data.a).toBe('pushed');
        });

        test("'edit' on UNEDITED editor with same-as-source null does not create a pending change", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: null }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push null — same as source value: should be treated as no change
            rowNode.setDataValue('a', null, 'edit');
            await asyncSetTimeout(1);

            // No ⏳ indicator — pending value equals source value
            await new GridRows(api, 'after null push on null cell').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:null
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBeNull();
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBeNull();
            expect(rowNode.getDataValue('a')).toBeNull();

            // After commit nothing changes
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBeNull();
        });

        test("'batch' source creates pending from null cell without open editor", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: null }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'val', 'batch');

            await new GridRows(api, 'after batch push on null cell').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"val" null
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('val');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBeNull();
            expect(rowNode.getDataValue('a')).toBeNull();
            expect(rowNode.data.a).toBeNull();

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('val');
        });

        test("'batch' source creates pending from undefined cell (field absent from row data)", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0' }], // 'a' field absent — effectively undefined
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(
                api,
                `'batch' source creates pending from undefined cell (field absent from row data) setup`
            ).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(
                api,
                `'batch' source creates pending from undefined cell (field absent from row data) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            expect(rowNode.data.a).toBeUndefined();
            expect(rowNode.getDataValue('a')).toBeUndefined();

            rowNode.setDataValue('a', 'val', 'batch');

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('val');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBeUndefined();

            // getDataValue always returns committed data (undefined)
            expect(rowNode.getDataValue('a')).toBeUndefined();
            expect(rowNode.data.a).toBeUndefined();

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('val');
            expect(rowNode.getDataValue('a')).toBe('val');
            await new GridRows(
                api,
                `'batch' source creates pending from undefined cell (field absent from row data) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"val"
            `);
        });

        test("'edit' on UNEDITED editor on null cell then 'batch' on second null cell both create pending, editor stays open", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                    { field: 'b', editable: true },
                ],
                rowData: [{ id: '0', a: null, b: null }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            // Open editor on 'a' (UNEDITED)
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push value to open UNEDITED editor via 'edit'
            rowNode.setDataValue('a', 'a-val', 'edit');
            // Push value to closed null cell via 'batch'
            rowNode.setDataValue('b', 'b-val', 'batch');
            await asyncSetTimeout(1);

            // 'batch' source does not call cleanupEditors(), so it does not forcibly
            // close the editor. Cell 'a' may still transition to pending-only state
            // due to async rendering; both cells have the expected pending values.
            await new GridRows(api, 'both cells pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ ⏳ id:0 a:⏳"a-val" null b:⏳"b-val" null
            `);

            expect(rowNode.data.a).toBeNull();
            expect(rowNode.data.b).toBeNull();
            expect(rowNode.getDataValue('a')).toBeNull();
            expect(rowNode.getDataValue('b')).toBeNull();

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('a-val');
            expect(rowNode.data.b).toBe('b-val');
        });
    });

    describe("'batch' source without open editor", () => {
        test("'batch' source on fresh cell creates a new batch edit", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'initial — no pending edits').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'staged', 'batch');
            await asyncSetTimeout(1);

            // Pending batch edit created, data unchanged
            await new GridRows(api, 'after batch setDataValue — pending created').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"staged" "initial"
            `);

            expect(rowNode.data.a).toBe('initial');
            expect(rowNode.getDataValue('a')).toBe('initial');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('staged');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('staged');

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"staged"
            `);
        });

        test("'batch' source updates an existing pending batch edit without writing to data", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // First batch write
            rowNode.setDataValue('a', 'first', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'after first batch setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"first" "initial"
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('first');
            expect(rowNode.data.a).toBe('initial');

            // Second batch write — updates the pending value
            rowNode.setDataValue('a', 'second', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'after second batch setDataValue — pending updated').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"second" "initial"
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('second');
            expect(rowNode.data.a).toBe('initial');

            // Commit writes the latest pending value
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('second');
        });

        test("'batch' source setting pending value back to source value removes the edit", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Create a pending edit
            rowNode.setDataValue('a', 'changed', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'pending edit exists').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"changed" "initial"
            `);

            // Set back to original value — should remove the pending edit
            rowNode.setDataValue('a', 'initial', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'after setting back to source — no pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            expect(rowNode.data.a).toBe('initial');

            // Commit — nothing to commit, data unchanged
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('initial');
        });

        test('cell already has pending batch edit, then editor opens — editor shows source value, batch pending preserved', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Stage a batch value before opening editor
            rowNode.setDataValue('a', 'staged', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'batch pending before editor opens').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"staged" "initial"
            `);

            // Now open the editor on the same cell
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            expect(editor).toBeInTheDocument();

            // Editor shows the pending value (what the user would expect to edit)
            await new GridRows(api, 'editor open on cell with existing batch pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳"staged" "initial"
            `);

            // Batch pending value is still accessible
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('staged');
            expect(rowNode.data.a).toBe('initial');

            // Type a new value and press Enter — typed value becomes pending
            await userEvent.clear(editor);
            await userEvent.keyboard('typed{Enter}');
            await asyncSetTimeout(1);

            expect(api.getCellEditorInstances()).toHaveLength(0);

            await new GridRows(api, 'after Enter — typed value becomes pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"typed" "initial"
            `);

            expect(rowNode.data.a).toBe('initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('typed');
        });

        test("cell already has pending batch edit, editor opens, then setDataValue('batch') updates pending without affecting editor", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Stage a batch value before opening editor
            rowNode.setDataValue('a', 'first-batch', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'first batch pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"first-batch" "initial"
            `);

            // Open the editor
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            expect(editor).toBeInTheDocument();

            // Type in the editor
            await userEvent.clear(editor);
            await userEvent.keyboard('typed');
            await asyncSetTimeout(1);

            expect(editor).toHaveValue('typed');

            await new GridRows(api, 'editor open with typed value, first batch pending').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:🖍️"typed" ⏳"first-batch" "initial"
            `);

            // Now call setDataValue('batch') again — should update pending, leave editor alone
            rowNode.setDataValue('a', 'second-batch', 'batch');
            await asyncSetTimeout(1);

            // Editor is still open with typed value
            expect(gridDiv.querySelector<HTMLInputElement>('input')).toBe(editor);
            expect(editor).toHaveValue('typed');

            await new GridRows(api, 'after second batch setDataValue — editor untouched, pending updated').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:🖍️"typed" ⏳"second-batch" "initial"
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('second-batch');
            expect(rowNode.data.a).toBe('initial');

            // ESC — editor closes, cell shows latest batch pending value
            await userEvent.keyboard('{Escape}');
            await asyncSetTimeout(1);

            expect(api.getCellEditorInstances()).toHaveLength(0);

            await new GridRows(api, 'after ESC — latest batch pending shown').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"second-batch" "initial"
            `);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('second-batch');
        });
    });

    describe('validation triggers after setDataValue', () => {
        test("setDataValue 'edit' with out-of-range value: validateEdit() reports error and sets ag-cell-editing-error class", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: { min: 0, max: 100 },
                    },
                ],
                rowData: [{ id: '0', a: 50 }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(
                api,
                `setDataValue 'edit' with out-of-range value: validateEdit() reports error and se setup`
            ).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(
                api,
                `setDataValue 'edit' with out-of-range value: validateEdit() reports error and se setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:50
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // No validation errors initially
            expect(api.validateEdit()).toEqual([]);
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(false);

            // Push a value that exceeds max=100
            rowNode.setDataValue('a', 200, 'edit');
            await asyncSetTimeout(1);

            // Validation errors appear after validateEdit()
            const errors = api.validateEdit();
            expect(errors).not.toEqual([]);
            expect(errors).toHaveLength(1);
            expect(errors![0].messages).toEqual(expect.arrayContaining([expect.stringContaining('100')]));

            // ag-cell-editing-error class is set on the cell after validateEdit() refreshes styles
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(true);

            expect(rowNode.data.a).toBe(50);

            api.cancelBatchEdit();
            await new GridRows(
                api,
                `setDataValue 'edit' with out-of-range value: validateEdit() reports error and se final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:50
            `);
        });

        test("setDataValue 'edit' restoring valid value: validateEdit() clears errors and removes ag-cell-editing-error class", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: { min: 0, max: 100 },
                    },
                ],
                rowData: [{ id: '0', a: 50 }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push invalid value — produce errors
            rowNode.setDataValue('a', 200, 'edit');
            await asyncSetTimeout(1);

            expect(api.validateEdit()).not.toEqual([]);
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(true);

            // Push valid value — errors should clear
            rowNode.setDataValue('a', 75, 'edit');
            await asyncSetTimeout(1);

            const errors = api.validateEdit();
            expect(errors).toEqual([]);
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(false);

            await new GridRows(api, 'valid value restored').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF 🖍️ id:0 a:⏳75 50
            `);

            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe(75);
            expect(rowNode.data.a).toBe(50);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe(75);
        });

        test("setDataValue 'edit' with custom getValidationErrors function: errors reported and cleared", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agTextCellEditor',
                        cellEditorParams: {
                            getValidationErrors: ({ value }: any) => {
                                if (!value || value.length < 3) {
                                    return ['Must be at least 3 characters'];
                                }
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ id: '0', a: 'hello' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(
                api,
                `setDataValue 'edit' with custom getValidationErrors function: errors reported an setup`
            ).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(
                api,
                `setDataValue 'edit' with custom getValidationErrors function: errors reported an setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"hello"
            `);

            api.startBatchEdit();
            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await waitForInput(gridDiv, cellA, { popup: false });

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // No errors initially
            expect(api.validateEdit()).toEqual([]);

            // Push a value that is too short
            rowNode.setDataValue('a', 'ab', 'edit');
            await asyncSetTimeout(1);

            const errors = api.validateEdit();
            expect(errors).not.toEqual([]);
            expect(errors![0].messages).toEqual(['Must be at least 3 characters']);
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(true);

            // Push a valid value
            rowNode.setDataValue('a', 'valid-value', 'edit');
            await asyncSetTimeout(1);

            expect(api.validateEdit()).toEqual([]);
            expect(cellA.classList.contains('ag-cell-editing-error')).toBe(false);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('valid-value');
            await new GridRows(
                api,
                `setDataValue 'edit' with custom getValidationErrors function: errors reported an final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"valid-value"
            `);
        });
    });
});
