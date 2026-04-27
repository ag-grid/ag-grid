import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { NumberEditorModule, TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule } from 'ag-grid-enterprise';

import {
    DragEventDispatcher,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    initPointerEventPolyfill,
    waitForEvent,
    waitForInput,
} from '../test-utils';

describe('Cell Editing: batch clear bugs', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule, NumberEditorModule, CellSelectionModule],
    });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    /**
     * Edit → "Foo" → finish → Delete clears → Delete again should stay cleared.
     *
     * Steps:
     *   1. startBatchEdit()
     *   2. Double-click cell A0 ("A0"), type "Foo", press Enter → pendingValue = "Foo", state = 'changed'
     *   3. Press Delete → cell is cleared (pendingValue = deleteValue)
     *   4. Press Delete again → cell should STAY cleared (second Delete is a no-op on an already-cleared
     *      cell whose sourceValue differs from the original).
     */
    test('second Delete after edit-then-clear should keep cell cleared', async () => {
        const api = await gridMgr.createGridAndWait('tc1Grid', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Step 1: Edit cell A0 to "Foo"
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'Foo');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Verify cell now shows "Foo" and has batch edit style
        const cellA0Edited = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Edited).toHaveTextContent('Foo');
        expect(cellA0Edited).toHaveClass(/ag-cell-batch-edit/);

        const afterEdit = new GridRows(api, 'after editing to Foo');
        await afterEdit.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"Foo" "A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Step 2: Re-focus cell A0 (Enter may have navigated to next row), then press Delete to clear
        api.setFocusedCell(0, 'a');
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        await asyncSetTimeout(0);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0Cleared = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Cleared).toBeEmptyDOMElement();
        expect(cellA0Cleared).toHaveClass(/ag-cell-batch-edit/);

        const afterFirstDelete = new GridRows(api, 'after first Delete');
        await afterFirstDelete.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Step 3: Press Delete again — should stay cleared (the cell was explicitly edited then cleared)
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0AfterSecondDelete = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0AfterSecondDelete).toBeEmptyDOMElement();
        expect(cellA0AfterSecondDelete).toHaveClass(/ag-cell-batch-edit/);

        const afterSecondDelete = new GridRows(api, 'after second Delete — should stay cleared');
        await afterSecondDelete.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    /**
     * Fill handle reduction in batch mode should restore original values, not clear to deleteValue.
     *
     * When the fill handle is dragged to extend a range, cells get filled via setDataValue.
     * When the fill handle is then dragged back (reduction), `clearCellsInRange` →
     * `clearCellRangeCellValues` calls `batchResetToSourceValue` on each
     * formerly-filled cell. In batch mode, this restores them to their original sourceValue.
     *
     * This test exercises the real fill-handle UI flow:
     *   1. Start batch mode, select the top cell, dblClick fill handle → extends down
     *   2. Drag fill handle upward (reduction) so the range shrinks back to the first row
     *   3. Verify formerly-filled cells are restored to their original values
     */
    test('batch fill-handle reduce should restore original values, not clear to null', async () => {
        const api = await gridMgr.createGridAndWait('tc2Grid', {
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [
                { id: 'ROW_0', a: 'A0' },
                { id: 'ROW_1', a: 'A1' },
                { id: 'ROW_2', a: 'A2' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        api.startBatchEdit();

        const beforeFill = new GridRows(api, 'before fill');
        await beforeFill.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF id:ROW_1 a:"A1"
            └── LEAF id:ROW_2 a:"A2"
        `);

        // Step 1: Select ROW_0 and dblClick fill handle to fill down
        api.setFocusedCell(0, 'a');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;
        await asyncSetTimeout(0);

        const afterFill = new GridRows(api, 'after fill extend via dblClick');
        await afterFill.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF ⏳ id:ROW_1 a:⏳"A0" "A1"
            └── LEAF ⏳ id:ROW_2 a:⏳"A0" "A2"
        `);

        // Step 2: Drag fill handle upward to reduce the range back to ROW_0 only.
        // dblClick fill doesn't update the selection range, so we need to select
        // the full filled range explicitly so the fill handle is at ROW_2.
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['a'] });
        await asyncSetTimeout(10);
        const fillHandle2 = getByTestId(gridDiv, agTestIdFor.fillHandle());

        const drag = new DragEventDispatcher('pointer', null, /* html5DragDrop */ false);

        // pointerdown on fill handle — DragService starts immediately (dragStartPixels: 0)
        await drag.startDrag(fillHandle2, 50, 100);
        await asyncSetTimeout(1);

        // Drag upward through ROW_1 then to ROW_0 so fill handle detects vertical reduction
        const cellR1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        const cellR0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));

        await drag.movePointer(cellR1, 50, 50);
        await drag.movePointer(cellR0After, 50, 0);
        await asyncSetTimeout(1);

        // Release — triggers onDragEnd → performFill → handleValueChanged → clearCellsInRange
        const fillEnd2 = waitForEvent('fillEnd', api);
        await drag.finishDrag();
        await fillEnd2;

        // After reduction: ROW_1 and ROW_2 should be restored to their original values ("A1" and "A2").
        const afterReduction = new GridRows(api, 'after fill reduction — should restore originals');
        await afterReduction.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF id:ROW_1 a:"A1"
            └── LEAF id:ROW_2 a:"A2"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
    });

    /**
     * Edit → "Foo" → finish (persisted) → Delete clears → Delete again should stay cleared.
     */
    test('no batch: second Delete after edit-then-clear should keep cell cleared', async () => {
        const api = await gridMgr.createGridAndWait('tc1NoBatchGrid', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        // No batch — edit is persisted immediately
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'Foo');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        const afterEdit = new GridRows(api, 'after editing to Foo');
        await afterEdit.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Foo" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Re-focus cell A0 and press Delete to clear
        api.setFocusedCell(0, 'a');
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        await asyncSetTimeout(0);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterFirstDelete = new GridRows(api, 'after first Delete');
        await afterFirstDelete.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:null b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Press Delete again — should stay cleared
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterSecondDelete = new GridRows(api, 'after second Delete — should stay cleared');
        await afterSecondDelete.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:null b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
    });

    /**
     * Fill handle reduction without batch mode should clear cells.
     * When not in batch mode, reducing the fill range should clear the data outside
     * the reduced range (to deleteValue), not restore previously filled data.
     */
    test('no batch: fill-handle reduce should clear data outside reduced range', async () => {
        const api = await gridMgr.createGridAndWait('tc2NoBatchGrid', {
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [
                { id: 'ROW_0', a: 'A0' },
                { id: 'ROW_1', a: 'A1' },
                { id: 'ROW_2', a: 'A2' },
            ],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        // No batch mode

        const beforeFill = new GridRows(api, 'before fill');
        await beforeFill.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF id:ROW_1 a:"A1"
            └── LEAF id:ROW_2 a:"A2"
        `);

        // Fill down from ROW_0
        api.setFocusedCell(0, 'a');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;
        await asyncSetTimeout(0);

        const afterFill = new GridRows(api, 'after fill extend via dblClick');
        await afterFill.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF id:ROW_1 a:"A0"
            └── LEAF id:ROW_2 a:"A0"
        `);

        // Drag fill handle upward to reduce back to ROW_0
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['a'] });
        await asyncSetTimeout(10);
        const fillHandle2 = getByTestId(gridDiv, agTestIdFor.fillHandle());

        const drag = new DragEventDispatcher('pointer', null, /* html5DragDrop */ false);

        await drag.startDrag(fillHandle2, 50, 100);
        await asyncSetTimeout(1);

        const cellR1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        const cellR0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));

        await drag.movePointer(cellR1, 50, 50);
        await drag.movePointer(cellR0After, 50, 0);
        await asyncSetTimeout(1);

        const fillEnd2 = waitForEvent('fillEnd', api);
        await drag.finishDrag();
        await fillEnd2;

        // Without batch mode, reduction should clear the cells outside the range.
        // The fill overwrote the original values, so after clearing the cells revert to deleteValue (null).
        const afterReduction = new GridRows(api, 'after fill reduction — should clear cells');
        await afterReduction.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0"
            ├── LEAF id:ROW_1 a:null
            └── LEAF id:ROW_2 a:null
        `);
    });

    /**
     * In batch mode, calling `setDataValue(col, 'P1', 'paste')` followed by
     * `setDataValue(col, null, 'cellClear')` should return `true` for both calls,
     * because the pending value changes each time.
     *
     * Previously, the second call returned `false` even though the pending value
     * was successfully updated from 'P1' to null. The `cellClear` source was routed
     * through `applyExistingEdit` → `stopEditing` which returned `false` in batch mode,
     * causing the misleading return value.
     */
    test('batch setDataValue with cellClear after paste should return true', async () => {
        const api = await gridMgr.createGridAndWait('tc5Grid', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [
                { field: 'athlete', editable: true },
                { field: 'gold', editable: true },
                { field: 'silver', editable: true },
                { field: 'bronze', editable: true },
                {
                    field: 'total',
                    editable: false,
                    valueGetter: (params) => {
                        const { node, data, api: gridApi } = params;
                        const overlay = node ? gridApi.getEditRowValues(node) : undefined;
                        const row = Object.assign({}, data, overlay);
                        return (row.gold ?? 0) + (row.silver ?? 0) + (row.bronze ?? 0);
                    },
                },
            ],
            rowData: [
                { id: 'ROW_0', athlete: 'Michael Phelps', gold: 8, silver: 2, bronze: 1 },
                { id: 'ROW_1', athlete: 'Usain Bolt', gold: 3, silver: 0, bronze: 0 },
            ],
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        const rn = api.getDisplayedRowAtIndex(0)!;
        expect(rn).toBeDefined();

        // First setDataValue with 'paste' should return true
        const pasteResult = rn.setDataValue('athlete', 'P1', 'paste');
        expect(pasteResult).toBe(true);

        // Verify pending value changed
        const afterPaste = api.getCellValue({ rowNode: rn, colKey: 'athlete', from: 'batch' });
        expect(afterPaste).toBe('P1');

        // Second setDataValue with 'cellClear' (null) should also return true
        const clearResult = rn.setDataValue('athlete', null, 'cellClear');
        expect(clearResult).toBe(true);

        // Verify pending value changed to null
        const afterClear = api.getCellValue({ rowNode: rn, colKey: 'athlete', from: 'batch' });
        expect(afterClear).toBeNull();

        // Verify the total valueGetter still works with batch overlay
        const total = api.getCellValue({ rowNode: rn, colKey: 'total', from: 'batch' });
        expect(total).toBe(8 + 2 + 1); // gold + silver + bronze unchanged

        // Verify grid state
        const gridState = new GridRows(api, 'after paste then cellClear');
        await gridState.check(`
            ROOT id:ROOT_NODE_ID total:0
            ├── LEAF ⏳ id:ROW_0 athlete:⏳null "Michael Phelps" gold:8 silver:2 bronze:1 total:11
            └── LEAF id:ROW_1 athlete:"Usain Bolt" gold:3 silver:0 bronze:0 total:3
        `);
    });
});
