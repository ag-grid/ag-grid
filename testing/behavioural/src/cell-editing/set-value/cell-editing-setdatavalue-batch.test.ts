import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';
import { expect } from '../../test-utils/matchers';

/**
 * Tests for setDataValue behavior during batch editing.
 *
 * Key behavior:
 * - All sources create pending batch values during batch mode
 * - `'data'` source bypasses batch mode and writes directly to the underlying data
 * - `'batch'` source writes to batch if active, otherwise writes to data (ignores editor state)
 * - `'edit'` source writes to the current edit state (editor if editing, batch if in batch mode, data otherwise)
 */
describe('Cell Editing: setDataValue in Batch Mode', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [BatchEditModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // Sources in SET_DATA_SOURCE_AS_API that participate in batch mode
    const batchSources = ['paste', 'rangeSvc', 'cellClear', 'undo', 'redo'] as const;

    // Other sources that also participate in batch mode when batch editing is active
    const otherSources = [undefined, 'ui', 'api', 'edit', 'fillHandle', 'bulk'] as const;

    // All sources that participate in batch mode
    const allBatchSources = [...batchSources, ...otherSources] as const;

    describe('sources that create pending batch values', () => {
        test.each(batchSources)("'%s' creates pending value during batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before batch edit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            // GridRows shows rendered values (pending in batch mode)
            await new GridRows(api, `after ${eventSource} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('initial'); // Data unchanged
            expect(rowNode.getDataValue('a')).toBe('initial'); // getDataValue returns committed data
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed'); // Default returns pending
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed'); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial'); // Data unchanged
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed'); // Edit value

            api.cancelBatchEdit();
        });

        test.each(batchSources)("'%s' pending value is committed on commitBatchEdit", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'committed', eventSource);

            await new GridRows(api, 'before commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"committed"
            `);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"committed"
            `);

            expect(rowNode.data.a).toBe('committed');
        });

        test.each(batchSources)("'%s' pending value is reverted on cancelBatchEdit", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'pending', eventSource);

            await new GridRows(api, 'before cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"pending"
            `);

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            expect(rowNode.data.a).toBe('initial');
        });
    });

    describe('other sources also participate in batch mode', () => {
        test.each(otherSources)("'%s' creates pending value during batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before batch edit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('initial'); // Data unchanged - still pending
            expect(rowNode.getDataValue('a')).toBe('initial'); // getDataValue returns committed data
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed'); // Default returns pending
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed'); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial'); // Data unchanged
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed'); // Edit value

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            // After cancel, data should be unchanged
            expect(rowNode.data.a).toBe('initial');
        });
    });

    describe("'data' source bypasses batch mode", () => {
        test("'data' writes directly to data during batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before batch edit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', 'data');

            await new GridRows(api, 'after data setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed'); // Written directly to data
            expect(rowNode.getDataValue('a')).toBe('changed'); // getDataValue returns committed data
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            // After cancel, data should still have the value (was not staged)
            expect(rowNode.data.a).toBe('changed');
        });

        test("'data' writes directly to data when not in batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', 'data');

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed');
            expect(rowNode.getDataValue('a')).toBe('changed');
        });
    });

    describe("'batch' source writes to batch, ignoring editor state", () => {
        test("'batch' writes to batch pendingValue during batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'batch-value', 'batch');

            await new GridRows(api, 'after batch setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"batch-value"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('initial'); // Data unchanged - staged in batch
            expect(rowNode.getDataValue('a')).toBe('initial');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('batch-value'); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-value');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('batch-value'); // Committed to data
        });

        test("'batch' writes to data when not in batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', 'batch');

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed'); // Written directly to data
            expect(rowNode.getDataValue('a')).toBe('changed');
        });

        test("'batch' does not affect open editor during batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            await asyncSetTimeout(1);

            // Double-click to start editing the cell
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Type something in the editor
            const input = await waitForInput(gridDiv, cell, { popup: false });
            await userEvent.clear(input);
            await userEvent.type(input, 'typed-in-editor');
            await asyncSetTimeout(1);

            // Verify editor has the typed value
            expect(input.value).toBe('typed-in-editor');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed-in-editor');

            // Use 'batch' source - should write to pendingValue, NOT editorValue
            rowNode.setDataValue('a', 'batch-value', 'batch');

            // Editor value should be unchanged (still showing what user typed)
            expect(input.value).toBe('typed-in-editor');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed-in-editor');

            // But batch value should be updated
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-value');
            expect(rowNode.data.a).toBe('initial'); // Data unchanged

            // Stop editing (commits the editor value to pendingValue)
            api.stopEditing();
            await asyncSetTimeout(1);

            // After stopping editor, pending value should be the editor value (typed-in-editor)
            // because the editor was active and its value takes precedence
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('typed-in-editor');

            api.cancelBatchEdit();
        });

        test("editor value can still be changed after 'batch' setDataValue", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            await asyncSetTimeout(1);

            // Double-click to start editing the cell
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Type initial value in editor
            const input = await waitForInput(gridDiv, cell, { popup: false });
            await userEvent.clear(input);
            await userEvent.type(input, 'first-typed');
            await asyncSetTimeout(1);
            expect(input.value).toBe('first-typed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('first-typed');

            // Use 'batch' source - writes to pendingValue, NOT editorValue
            rowNode.setDataValue('a', 'batch-value', 'batch');

            // Editor still has user's typed value
            expect(input.value).toBe('first-typed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('first-typed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-value');

            // User continues typing in the editor
            await userEvent.clear(input);
            await userEvent.type(input, 'second-typed');
            await asyncSetTimeout(1);

            // Editor value is updated
            expect(input.value).toBe('second-typed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('second-typed');
            // Batch value still shows what 'batch' source wrote (until editor is synced)
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-value');

            // Stop editing - editor value should be committed
            api.stopEditing();
            await asyncSetTimeout(1);

            // After stopping, the editor's value takes precedence
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('second-typed');

            // Commit batch edit
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            // Final committed value is what the user typed
            expect(rowNode.data.a).toBe('second-typed');
        });

        test("'batch' value is committed when no editor is open", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Use 'batch' source without an open editor
            rowNode.setDataValue('a', 'batch-value', 'batch');

            // Batch value should be set
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-value');
            expect(rowNode.data.a).toBe('initial'); // Data unchanged

            // Commit batch - should apply the batch value
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('batch-value'); // Committed
        });
    });

    describe('escape key reverts editor changes', () => {
        test('pressing ESC during batch editing reverts cell to source value', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // First set a batch pending value via API
            rowNode.setDataValue('a', 'batch-pending', 'batch');
            await asyncSetTimeout(1);

            await new GridRows(api, 'after batch setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"batch-pending"
            `);

            // Double-click to start editing the cell
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            // Type in the editor (this creates an editor value different from batch pending value)
            const input = await waitForInput(gridDiv, cell, { popup: false });
            await userEvent.clear(input);
            await userEvent.type(input, 'typed-value');
            await asyncSetTimeout(1);

            expect(input.value).toBe('typed-value');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed-value');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('batch-pending');

            // Press ESC to cancel editing - this reverts the entire cell edit (including batch pending value)
            await userEvent.type(input, '{Escape}');
            await asyncSetTimeout(1);

            // After ESC, the cell reverts to the source value (not the typed value or batch pending)
            await new GridRows(api, 'after escape').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            expect(rowNode.data.a).toBe('initial'); // Data unchanged

            api.cancelBatchEdit();
        });

        test('pressing ESC during batch editing with no prior batch value reverts to source value', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            await asyncSetTimeout(1);

            // Double-click to start editing without setting a batch value first
            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Type in the editor
            const input = await waitForInput(gridDiv, cell, { popup: false });
            await userEvent.clear(input);
            await userEvent.type(input, 'typed-value');
            await asyncSetTimeout(1);

            expect(input.value).toBe('typed-value');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typed-value');

            // Press ESC to cancel editing
            await userEvent.type(input, '{Escape}');
            await asyncSetTimeout(1);

            // After ESC, the cell should show the original source value
            await new GridRows(api, 'after escape').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            expect(rowNode.data.a).toBe('initial'); // Data unchanged

            api.cancelBatchEdit();
        });
    });

    describe('behavior outside batch mode', () => {
        test.each(allBatchSources)("'%s' updates data directly when not in batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed');
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
        });

        test("'paste' writes directly to data when not in batch mode and not editing", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before paste').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'pasted', 'paste');

            await new GridRows(api, 'after paste').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"pasted"
            `);

            // 'paste' bypasses editSvc when not in batch mode, so value is written directly
            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('pasted');
            expect(rowNode.getDataValue('a')).toBe('pasted');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('pasted');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('pasted');
        });
    });

    describe('multiple cells', () => {
        test('multiple setDataValue calls during batch are all applied on commit', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [{ id: '0', a: 'a-initial', b: 'b-initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial state').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-initial" b:"b-initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'a-changed', 'paste');
            rowNode.setDataValue('b', 'b-changed', 'paste');

            await new GridRows(api, 'after setDataValue calls').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-changed" b:"b-changed"
            `);

            expect(rowNode.data.a).toBe('a-initial');
            expect(rowNode.data.b).toBe('b-initial');
            expect(rowNode.getDataValue('a')).toBe('a-initial');
            expect(rowNode.getDataValue('b')).toBe('b-initial');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('a-changed');
            expect(api.getCellValue({ rowNode, colKey: 'b', from: 'batch' })).toBe('b-changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('a-initial');
            expect(api.getCellValue({ rowNode, colKey: 'b', from: 'data' })).toBe('b-initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-changed" b:"b-changed"
            `);

            expect(rowNode.data.a).toBe('a-changed');
            expect(rowNode.data.b).toBe('b-changed');
            expect(rowNode.getDataValue('a')).toBe('a-changed');
            expect(rowNode.getDataValue('b')).toBe('b-changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('a-changed');
            expect(api.getCellValue({ rowNode, colKey: 'b' })).toBe('b-changed');
        });
    });
});
