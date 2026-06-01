import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../test-utils';

describe('Cell Editing: single-cell batch styles', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule],
    });

    const rangeGridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule, CellSelectionModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        rangeGridMgr.reset();
    });

    async function createGrid() {
        const api = await gridMgr.createGridAndWait('batchStyleGrid', {
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
                { id: 'ROW_2', a: 'A2', b: 'B2' },
            ],
            getRowId: (params) => params.data.id,
        });
        return api;
    }

    test('edited cell retains batch edit style after editing another cell', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Double-click to edit cell (0, a)
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');

        // Press Enter to stop editing — commits pending value in batch mode
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Snapshot: one cell pending
        await new GridRows(api, 'pending after first edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Cell A should have batch edit style
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        // Now edit a second cell (0, b)
        const cellB0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        await user.dblClick(cellB0);
        const inputB0 = await waitForInput(gridDiv, cellB0);
        await user.clear(inputB0);
        await user.type(inputB0, 'ALSO_CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Snapshot: two cells pending
        await new GridRows(api, 'pending after second edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED" "A0" b:⏳"ALSO_CHANGED" "B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Cell A should still have batch edit style after editing another cell
        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('CHANGED');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);

        // Cell B should also have batch edit style
        const cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellB0After).toHaveTextContent('ALSO_CHANGED');
        expect(cellB0After).toHaveClass(/ag-cell-batch-edit/);

        // Note: ag-row-batch-edit is only applied in fullRow edit mode,
        // so we only check cell-level styles here.

        // After commit, styles should be removed from both cells
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).not.toHaveClass(/ag-cell-batch-edit/);
        const cellB0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellB0Final).not.toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('multiple cells across rows retain batch edit styles', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a)
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'R0_CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Edit cell (1, a)
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        await user.dblClick(cellA1);
        const inputA1 = await waitForInput(gridDiv, cellA1);
        await user.clear(inputA1);
        await user.type(inputA1, 'R1_CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Snapshot: pending edits across two rows
        await new GridRows(api, 'pending across rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"R0_CHANGED" "A0" b:"B0"
            ├── LEAF ⏳ id:ROW_1 a:⏳"R1_CHANGED" "A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Both cells should have batch edit styles
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('R0_CHANGED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        const cellA1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1After).toHaveTextContent('R1_CHANGED');
        expect(cellA1After).toHaveClass(/ag-cell-batch-edit/);

        // Note: ag-row-batch-edit is only applied in fullRow edit mode

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('cancel removes batch edit styles and reverts data', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a)
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Snapshot: pending before cancel
        await new GridRows(api, 'pending before cancel').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Verify style exists before cancel
        const cellA0Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Before).toHaveClass(/ag-cell-batch-edit/);

        // Cancel batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        // All batch edit styles should be removed and data reverted
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).toHaveTextContent('A0');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
    });

    test('editing back to original value removes style, re-changing re-applies it', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a) to a new value
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Cell should have batch edit style
        let cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        // Snapshot: one cell pending after first edit
        await new GridRows(api, 'after first edit to CHANGED').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Re-edit cell (0, a) back to original value
        await user.dblClick(cellA0After);
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'A0');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Style should be removed because value matches original
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('A0');
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);

        // Snapshot: no pending edits after reverting to original
        await new GridRows(api, 'after reverting to original A0').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Re-edit cell (0, a) to a different value again
        await user.dblClick(cellA0After);
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'CHANGED_AGAIN');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Style should be re-applied
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED_AGAIN');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        // Snapshot: pending again after re-edit
        await new GridRows(api, 'after re-edit to CHANGED_AGAIN').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED_AGAIN" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 3,
            cellEditingStopped: 3,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
    });

    test('Escape cancels current cell edit without affecting other batch edits', async () => {
        const api = await createGrid();
        await new GridColumns(api, `Escape cancels current cell edit without affecting other batch edits setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `Escape cancels current cell edit without affecting other batch edits setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a) and confirm
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CONFIRMED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Cell (0, a) should have batch edit style
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CONFIRMED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        // Start editing cell (1, a), type something, then press Escape
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        await user.dblClick(cellA1);
        input = await waitForInput(gridDiv, cellA1);
        await user.clear(input);
        await user.type(input, 'WILL_CANCEL');
        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        // Cell (1, a) should revert to original and have no batch edit style
        const cellA1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1After).toHaveTextContent('A1');
        expect(cellA1After).not.toHaveClass(/ag-cell-batch-edit/);

        // Cell (0, a) batch edit should be preserved
        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('CONFIRMED');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 1,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `Escape cancels current cell edit without affecting other batch edits final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"CONFIRMED" "A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
    });

    test('Escape on a re-edited batch cell preserves the previous batch value', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a) and confirm with Enter
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'FIRST_EDIT');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('FIRST_EDIT');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);

        // Snapshot: pending batch value after first edit
        await new GridRows(api, 'after first edit to FIRST_EDIT').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"FIRST_EDIT" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Re-open the same cell, type a different value, then Escape
        const cellA0Again = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0Again);
        input = await waitForInput(gridDiv, cellA0Again);
        await user.clear(input);
        await user.type(input, 'SECOND_EDIT');
        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        // Should revert to the previous batch pending value, not the original
        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).toHaveTextContent('FIRST_EDIT');
        expect(cellA0Final).toHaveClass(/ag-cell-batch-edit/);

        // Snapshot: after Escape, still has FIRST_EDIT as pending (not reverted to A0)
        await new GridRows(api, 'after Escape reverts to previous batch value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"FIRST_EDIT" "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
    });

    test('clearing a batch-edited cell and typing original value removes batch style', async () => {
        const api = await createGrid();
        await new GridColumns(api, `clearing a batch-edited cell and typing original value removes batch style setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `clearing a batch-edited cell and typing original value removes batch style setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a) and confirm
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CHANGED');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);

        // Re-open, use Backspace to clear, then type original value
        const cellA0Again = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0Again);
        input = await waitForInput(gridDiv, cellA0Again);
        // Use repeated Backspace to clear the field
        while (input.value.length > 0) {
            await user.keyboard('{Backspace}');
        }
        await user.type(input, 'A0');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Cell should lose batch edit style because value matches original
        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).toHaveTextContent('A0');
        expect(cellA0Final).not.toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(
            api,
            `clearing a batch-edited cell and typing original value removes batch style final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('Delete on a cleared batch cell keeps value cleared', async () => {
        const api = await createGrid();
        await new GridColumns(api, `Delete on a cleared batch cell keeps value cleared setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `Delete on a cleared batch cell keeps value cleared setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Focus the cell and press Delete to clear it via cellClear
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        // Cell should be cleared and have batch style
        const cellA0Cleared = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Cleared).toHaveTextContent('');
        expect(cellA0Cleared).toHaveClass(/ag-cell-batch-edit/);

        // Press Delete again on the already-cleared cell — should stay cleared
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `Delete on a cleared batch cell keeps value cleared final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('Backspace to clear cell then Delete keeps value cleared', async () => {
        const api = await createGrid();
        await new GridColumns(api, `Backspace to clear cell then Delete keeps value cleared setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `Backspace to clear cell then Delete keeps value cleared setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Double-click to edit cell (0, a) — use Backspace to clear character-by-character
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        const input = await waitForInput(gridDiv, cellA0);
        // 'A0' is 2 chars — press Backspace 3 times (extra is harmless)
        await user.keyboard('{Backspace}{Backspace}{Backspace}');
        expect(input.value).toBe('');

        // Press Enter to stop editing — commits empty pending value
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Cell should show empty and have batch style
        const cellA0Cleared = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Cleared).toHaveTextContent('');
        expect(cellA0Cleared).toHaveClass(/ag-cell-batch-edit/);

        // Press Delete on the cleared cell — should stay cleared
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);
        await new GridRows(api, `Backspace to clear cell then Delete keeps value cleared final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('range Delete on cleared cells keeps them cleared', async () => {
        const api = await rangeGridMgr.createGridAndWait('rangeToggle', {
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
        await new GridColumns(api, `range Delete on cleared cells keeps them cleared setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `range Delete on cleared cells keeps them cleared setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Select range and delete to clear cells
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        // Both cells should be cleared with batch style
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'))).toHaveTextContent('');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'))).toHaveClass(/ag-cell-batch-edit/);

        // Delete again on the same range — should stay cleared
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'))).toHaveTextContent('');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        await new GridRows(api, `range Delete on cleared cells keeps them cleared final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            └── LEAF ⏳ id:ROW_1 a:⏳null "A1" b:"B1"
        `);
    });

    test('range Delete applies batch edit styles to cleared cells', async () => {
        const api = await rangeGridMgr.createGridAndWait('rangeBatchStyle', {
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
        await new GridColumns(api, `range Delete applies batch edit styles to cleared cells setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `range Delete applies batch edit styles to cleared cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Select a range covering both rows, column a
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        // Both cleared cells should have batch edit style
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0).toHaveClass(/ag-cell-batch-edit/);

        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1).toHaveClass(/ag-cell-batch-edit/);

        // Column b cells should NOT have batch edit style (not in range)
        const cellB0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellB0).not.toHaveClass(/ag-cell-batch-edit/);

        // Commit should clear styles
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `range Delete applies batch edit styles to cleared cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:null b:"B0"
            └── LEAF id:ROW_1 a:null b:"B1"
        `);
    });

    test('commitBatchEdit removes styles and persists values across multiple cells', async () => {
        const api = await createGrid();
        await new GridColumns(api, `commitBatchEdit removes styles and persists values across multiple cells setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `commitBatchEdit removes styles and persists values across multiple cells setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `
        );
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a)
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'COMMIT_A0');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Edit cell (1, b)
        const cellB1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        await user.dblClick(cellB1);
        input = await waitForInput(gridDiv, cellB1);
        await user.clear(input);
        await user.type(input, 'COMMIT_B1');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Both edited cells should have batch edit style
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).toHaveClass(/ag-cell-batch-edit/);

        // Commit batch edit
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // Styles should be removed
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).not.toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).not.toHaveClass(/ag-cell-batch-edit/);

        // Values should persist in the grid data
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('COMMIT_A0');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).toHaveTextContent('COMMIT_B1');

        // Underlying row data should reflect committed values
        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('COMMIT_A0');
        expect(rowData[1].b).toBe('COMMIT_B1');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `commitBatchEdit removes styles and persists values across multiple cells final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"COMMIT_A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"COMMIT_B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
    });

    test('cancelBatchEdit removes styles and reverts values across multiple cells', async () => {
        const api = await createGrid();
        await new GridColumns(api, `cancelBatchEdit removes styles and reverts values across multiple cells setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `cancelBatchEdit removes styles and reverts values across multiple cells setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `
        );
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell (0, a)
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cellA0);
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CANCEL_A0');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Edit cell (1, b)
        const cellB1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        await user.dblClick(cellB1);
        input = await waitForInput(gridDiv, cellB1);
        await user.clear(input);
        await user.type(input, 'CANCEL_B1');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Both edited cells should have batch edit style
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).toHaveClass(/ag-cell-batch-edit/);

        // Cancel batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        // Styles should be removed
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).not.toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).not.toHaveClass(/ag-cell-batch-edit/);

        // Values should revert to original
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('A0');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'))).toHaveTextContent('B1');

        // Underlying row data should reflect original values
        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('A0');
        expect(rowData[1].b).toBe('B1');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `cancelBatchEdit removes styles and reverts values across multiple cells final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
    });

    test('range Delete cancel reverts cleared cells and removes styles', async () => {
        const api = await rangeGridMgr.createGridAndWait('rangeBatchCancel', {
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
        await new GridColumns(api, `range Delete cancel reverts cleared cells and removes styles setup`).checkColumns(
            `
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `
        );
        await new GridRows(api, `range Delete cancel reverts cleared cells and removes styles setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Select and delete a multi-column range
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        // Verify batch styles on cleared cells
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0).toHaveClass(/ag-cell-batch-edit/);

        // Cancel should revert everything
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).toHaveTextContent('A0');

        const cellB1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        expect(cellB1After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellB1After).toHaveTextContent('B1');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `range Delete cancel reverts cleared cells and removes styles final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
    });
});
