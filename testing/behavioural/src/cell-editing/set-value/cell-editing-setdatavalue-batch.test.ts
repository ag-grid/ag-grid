import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    CheckboxEditorModule,
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

import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

/**
 * Tests for setDataValue behavior during batch editing.
 *
 * Key behavior after fix:
 * - All sources (except 'data') create pending batch values when batch mode is active
 * - 'data' source always writes directly to data, bypassing batch mode entirely
 * - 'batch' source writes to batch pending value when batch is active, otherwise directly to data
 */
describe('Cell Editing: setDataValue in Batch Mode', () => {
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
            RenderApiModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // All sources that create pending batch values during batch mode
    const allBatchSources = [
        undefined,
        'ui',
        'api',
        'edit',
        'fillHandle',
        'bulk',
        'paste',
        'rangeSvc',
        'cellClear',
        'undo',
        'redo',
        'batch',
    ] as const;

    describe('sources that create pending batch values', () => {
        test.each(allBatchSources)("'%s' creates pending value during batch mode", async (eventSource) => {
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
            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF ⏳ id:0 a:⏳"changed" "initial"
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

        test.each(allBatchSources)("'%s' pending value is committed on commitBatchEdit", async (eventSource) => {
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
                    └── LEAF ⏳ id:0 a:⏳"committed" "initial"
                `);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 a:"committed"
                `);

            expect(rowNode.data.a).toBe('committed');
        });

        test.each(allBatchSources)("'%s' pending value is reverted on cancelBatchEdit", async (eventSource) => {
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
                    └── LEAF ⏳ id:0 a:⏳"pending" "initial"
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
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed');

            api.cancelBatchEdit();
        });

        test("'data' writes directly to data when not in batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', 'data');

            await new GridRows(api, 'after data setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed');
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
        });
    });

    describe('behavior outside batch mode', () => {
        const outsideBatchSources = [undefined, 'ui', 'api', 'edit', 'batch'] as const;

        test.each(outsideBatchSources)("'%s' updates data directly when not in batch mode", async (eventSource) => {
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
                └── LEAF ⏳ id:0 a:⏳"a-changed" "a-initial" b:⏳"b-changed" "b-initial"
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

        test('default setDataValue stages as pending when no editor is open (TC1)', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', editable: true },
                    { field: 'age', editable: true },
                ],
                rowData: [{ id: '0', athlete: 'Michael Phelps', age: 23 }],
                getRowId: (params) => params.data.id,
            });

            // Start batch and immediately call setDataValue without opening any editor
            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('age', 10);

            // Value should be staged as pending, NOT written to data
            await new GridRows(api, 'after setDataValue in batch without editor').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 athlete:"Michael Phelps" age:⏳10 23
            `);

            expect(rowNode.data.age).toBe(23); // Data unchanged
            expect(api.getCellValue({ rowNode, colKey: 'age', from: 'batch' })).toBe(10); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'age', from: 'data' })).toBe(23); // Data unchanged

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            // After cancel, value should be reverted
            expect(rowNode.data.age).toBe(23);
            await new GridRows(api, 'after cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23
            `);
        });

        test('mass update via setDataValue stages all rows as pending (TC2)', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', editable: true },
                    { field: 'age', editable: true },
                ],
                rowData: [
                    { id: '0', athlete: 'Michael Phelps', age: 23 },
                    { id: '1', athlete: 'Natalie Coughlin', age: 25 },
                    { id: '2', athlete: 'Aleksey Nemov', age: 24 },
                ],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            // Mass update: call setDataValue on multiple rows without opening any editor
            const row0 = api.getDisplayedRowAtIndex(0)!;
            const row1 = api.getDisplayedRowAtIndex(1)!;
            row0.setDataValue('athlete', 'Mass Updated');
            row1.setDataValue('athlete', 'Mass Updated');

            // Both rows should have pending values, NOT written to data
            await new GridRows(api, 'after mass update').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:⏳"Mass Updated" "Michael Phelps" age:23
                ├── LEAF ⏳ id:1 athlete:⏳"Mass Updated" "Natalie Coughlin" age:25
                └── LEAF id:2 athlete:"Aleksey Nemov" age:24
            `);

            expect(row0.data.athlete).toBe('Michael Phelps'); // Data unchanged
            expect(row1.data.athlete).toBe('Natalie Coughlin'); // Data unchanged

            // Commit batch: values should now be written to data
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Mass Updated" age:23
                ├── LEAF id:1 athlete:"Mass Updated" age:25
                └── LEAF id:2 athlete:"Aleksey Nemov" age:24
            `);

            expect(row0.data.athlete).toBe('Mass Updated');
            expect(row1.data.athlete).toBe('Mass Updated');
        });
    });

    describe("'edit' source updates editor value", () => {
        test("'edit' updates editor value during batch and preserves focus", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

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
        });

        test("'edit' updates editor value outside batch mode and preserves focus", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

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

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'direct', 'edit');

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('direct');
            expect(rowNode.getDataValue('a')).toBe('direct');
        });

        test("'edit' does not fire cellValueChanged when updating editor value", async () => {
            const cellValueChangedSpy = vi.fn();
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
                onCellValueChanged: cellValueChangedSpy,
            });

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
        });

        test("'edit' updates editor DOM value for agTextCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agNumberCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agDateCellEditor", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateCellEditor' }],
                rowData: [{ id: '0', a: new Date('2024-01-15') }],
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
        });

        test("'edit' updates editor DOM value for agDateStringCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agSelectCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agCheckboxCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agLargeTextCellEditor", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' updates editor DOM value for agTextCellEditor with useFormatter", async () => {
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
        });

        test("'edit' push is visible via getCellValue with from:'batch'", async () => {
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

            rowNode.setDataValue('a', 'pushed', 'edit');
            await asyncSetTimeout(1);

            // The pushed value should be visible via all resolution modes
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('pushed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');
            expect(rowNode.data.a).toBe('initial');

            api.cancelBatchEdit();
        });

        test("'edit' supports multiple sequential pushes", async () => {
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

        test("'edit' with custom editor that implements refresh() uses fast path", async () => {
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

            api.cancelBatchEdit();
        });

        test("'edit' with custom editor uses refresh() path (setEditValue is internal only)", async () => {
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
        });

        test("'edit' with custom editor without refresh() recreates editor and preserves focus", async () => {
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
        });
    });
});
