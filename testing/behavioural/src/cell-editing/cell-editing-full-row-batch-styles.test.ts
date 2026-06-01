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

describe('Cell Editing: full-row batch styles', () => {
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
            editType: 'fullRow',
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

    test('edited row retains batch edit style after tabbing to next row', async () => {
        const api = await createGrid();
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Start editing row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');

        // Tab through column b of row 0
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Tab from row 0 col b to row 1 col a (crossing row boundary)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Snapshot: row 0 has pending edit after tabbing to row 1
        await new GridRows(api, 'pending after tab to next row').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED" "A0" b:"B0"
            ├── LEAF 🖍️ id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);

        // Row 0 cell a should retain the batch edit style because it was changed
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).toHaveTextContent('CHANGED');

        // Row 0 should have batch edit row style
        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Row 0 cell b should NOT have batch edit style (unchanged)
        const cellB0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellB0).not.toHaveClass(/ag-cell-batch-edit/);

        // After commit, styles should be removed
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).not.toHaveClass(/ag-cell-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 5,
            cellValueChanged: 1,
            rowValueChanged: 1,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
    });

    test('multiple rows retain batch edit styles when editing across rows', async () => {
        const api = await createGrid();
        await new GridColumns(api, `multiple rows retain batch edit styles when editing across rows setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `multiple rows retain batch edit styles when editing across rows setup`).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'R0_CHANGED');

        // Tab through b0 to row 1
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Now editing row 1, column a - change it
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        const inputA1 = await waitForInput(gridDiv, cellA1);
        await user.clear(inputA1);
        await user.type(inputA1, 'R1_CHANGED');

        // Tab through b1 to row 2
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Both row 0 and row 1 should still have batch edit styles
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('R0_CHANGED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        const cellA1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1After).toHaveClass(/ag-cell-batch-edit/);
        expect(cellA1After).toHaveTextContent('R1_CHANGED');

        // Row 2 should not have batch edit style (currently being edited, not yet changed)
        // Row 0 and 1 should have row-level batch edit style
        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        const row1 = cellA1After.closest('[row-index="1"]');
        expect(row1).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 8,
            cellEditingStopped: 6,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `multiple rows retain batch edit styles when editing across rows final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"R0_CHANGED" "A0" b:"B0"
                ├── LEAF ⏳ id:ROW_1 a:⏳"R1_CHANGED" "A1" b:"B1"
                └── LEAF 🖍️ id:ROW_2 a:"A2" b:"B2"
            `
        );
    });

    test('cancel removes batch edit styles from previously edited rows', async () => {
        const api = await createGrid();
        await new GridColumns(api, `cancel removes batch edit styles from previously edited rows setup`).checkColumns(
            `
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `
        );
        await new GridRows(api, `cancel removes batch edit styles from previously edited rows setup`).check(`
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

        // Edit row 0
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');

        // Tab to row 1
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Row 0 should have batch edit style before cancel
        const cellA0Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Before).toHaveClass(/ag-cell-batch-edit/);

        // Cancel batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        // All batch edit styles should be removed
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).toHaveTextContent('A0');

        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 5,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `cancel removes batch edit styles from previously edited rows final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('editing cell back to original value removes cell style, re-changing re-applies it', async () => {
        const api = await createGrid();
        await new GridColumns(
            api,
            `editing cell back to original value removes cell style, re-changing re-applies i setup`
        ).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(
            api,
            `editing cell back to original value removes cell style, re-changing re-applies i setup`
        ).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CHANGED');

        // Tab through b0 then to row 1 (crosses row boundary)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell a0 should have batch edit style
        let cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        // Tab back to row 0 (Shift+Tab from row 1 col a -> row 0 col b -> row 0 col a)
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Now editing row 0 col a — re-type original value
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'A0');

        // Tab away to commit (through b0 then to row 1)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell a0 should no longer have batch edit style (value matches original)
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('A0');
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);

        // Row 0 should not have row-level batch style either (no edits remain)
        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);

        // Tab back and re-edit to a new value
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'CHANGED_AGAIN');

        // Tab away
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell a0 should have batch edit style again
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED_AGAIN');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);

        const row0After = cellA0After.closest('[row-index="0"]');
        expect(row0After).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 17,
            cellEditingStopped: 15,
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
            `editing cell back to original value removes cell style, re-changing re-applies i final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"CHANGED_AGAIN" "A0" b:"B0"
            ├── LEAF 🖍️ id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('row style is removed only when all edited cells in the row are reverted to original', async () => {
        const api = await createGrid();
        await new GridColumns(
            api,
            `row style is removed only when all edited cells in the row are reverted to origi setup`
        ).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(
            api,
            `row style is removed only when all edited cells in the row are reverted to origi setup`
        ).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'A0_NEW');

        // Tab to column b in same row and edit it
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        const cellB0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        input = await waitForInput(gridDiv, cellB0);
        await user.clear(input);
        await user.type(input, 'B0_NEW');

        // Tab to row 1 (crosses row boundary, commits row 0 edits)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Both cells in row 0 should have batch edit style
        let cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        let cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);
        expect(cellB0After).toHaveClass(/ag-cell-batch-edit/);

        // Row 0 should have row-level batch edit style
        let row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Tab back to row 0 col b, then to col a
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Now editing row 0 col a — revert to original value
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'A0');

        // Tab away to commit row 0 (through b0 then to row 1)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell a0 should lose batch edit style (reverted), cell b0 should keep it
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellB0After).toHaveClass(/ag-cell-batch-edit/);

        // Row 0 should STILL have row-level batch edit style (cell b is still edited)
        row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Tab back to row 0 col b and revert it to original
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Now on row 0 col a — tab to col b
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        input = await waitForInput(gridDiv, cellB0After);
        await user.clear(input);
        await user.type(input, 'B0');

        // Tab away to commit
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Now BOTH cells are reverted — row should lose batch edit style too
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellB0After).not.toHaveClass(/ag-cell-batch-edit/);

        row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);

        // Re-edit both cells to new values to verify styles re-apply
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Edit col a
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0After);
        await user.clear(input);
        await user.type(input, 'A0_AGAIN');

        // Tab to col b and edit it
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        input = await waitForInput(gridDiv, cellB0After);
        await user.clear(input);
        await user.type(input, 'B0_AGAIN');

        // Tab to row 1
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Both cells and row should have batch edit styles again
        cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        cellB0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);
        expect(cellB0After).toHaveClass(/ag-cell-batch-edit/);

        row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 23,
            cellEditingStopped: 21,
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
            `row style is removed only when all edited cells in the row are reverted to origi final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"A0_AGAIN" "A0" b:⏳"B0_AGAIN" "B0"
            ├── LEAF 🖍️ id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('Escape cancels current row edit without affecting previously edited rows', async () => {
        const api = await createGrid();
        await new GridColumns(api, `Escape cancels current row edit without affecting previously edited rows setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `Escape cancels current row edit without affecting previously edited rows setup`).check(
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CONFIRMED');

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Row 0 should have batch edit styles
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CONFIRMED');
        expect(cellA0After).toHaveClass(/ag-cell-batch-edit/);
        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Now editing row 1, type something in col a, then press Escape
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        input = await waitForInput(gridDiv, cellA1);
        await user.clear(input);
        await user.type(input, 'WILL_CANCEL');
        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        // Row 1 should revert — no batch edit styles
        const cellA1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1After).toHaveTextContent('A1');
        expect(cellA1After).not.toHaveClass(/ag-cell-batch-edit/);
        const row1 = cellA1After.closest('[row-index="1"]');
        expect(row1).not.toHaveClass(/ag-row-batch-edit/);

        // Row 0 batch edits should be preserved
        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('CONFIRMED');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);
        const row0Still = cellA0Still.closest('[row-index="0"]');
        expect(row0Still).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 4,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `Escape cancels current row edit without affecting previously edited rows final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"CONFIRMED" "A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
    });

    test('Escape on a re-edited batch row preserves the previous batch values', async () => {
        const api = await createGrid();
        await new GridColumns(api, `Escape on a re-edited batch row preserves the previous batch values setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `Escape on a re-edited batch row preserves the previous batch values setup`).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'FIRST_EDIT');

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('FIRST_EDIT');
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);

        // Tab back to row 0
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Type a different value then press Escape
        const cellA0Again = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0Again);
        await user.clear(input);
        await user.type(input, 'SECOND_EDIT');
        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        // Should revert to the previous batch pending value, not the original
        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).toHaveTextContent('FIRST_EDIT');
        expect(cellA0Final).toHaveClass(/ag-cell-batch-edit/);
        const row0 = cellA0Final.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 8,
            cellEditingStopped: 8,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `Escape on a re-edited batch row preserves the previous batch values final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"FIRST_EDIT" "A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);
    });

    test('clearing a batch-edited cell with Backspace and typing original value removes styles', async () => {
        const api = await createGrid();
        await new GridColumns(
            api,
            `clearing a batch-edited cell with Backspace and typing original value removes st setup`
        ).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(
            api,
            `clearing a batch-edited cell with Backspace and typing original value removes st setup`
        ).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CHANGED');

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        const row0Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a')).closest('[row-index="0"]');
        expect(row0Before).toHaveClass(/ag-row-batch-edit/);

        // Tab back to row 0
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        await asyncSetTimeout(0);

        // Use Backspace to clear, then type original value
        const cellA0Again = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        input = await waitForInput(gridDiv, cellA0Again);
        while (input.value.length > 0) {
            await user.keyboard('{Backspace}');
        }
        await user.type(input, 'A0');

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell should lose batch edit style because value matches original
        const cellA0Final = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Final).toHaveTextContent('A0');
        expect(cellA0Final).not.toHaveClass(/ag-cell-batch-edit/);

        // Row should also lose batch style (no edits remain)
        const row0 = cellA0Final.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 11,
            cellEditingStopped: 9,
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
            `clearing a batch-edited cell with Backspace and typing original value removes st final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF 🖍️ id:ROW_1 a:"A1" b:"B1"
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

        // Edit row 0, clear column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell should show empty and have batch style
        const cellA0Cleared = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Cleared).toHaveTextContent('');
        expect(cellA0Cleared).toHaveClass(/ag-cell-batch-edit/);

        // Stop editing so the Delete key triggers cellClear instead of editor input
        api.stopEditing();
        await asyncSetTimeout(0);

        // Focus the cleared cell and press Delete — should stay cleared
        const cellA0ForToggle = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0ForToggle);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);

        // Row should still have batch style (cell is still edited/cleared)
        const row0 = cellA0Still.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 5,
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

    test('commitBatchEdit removes cell and row styles and persists values', async () => {
        const api = await createGrid();
        await new GridColumns(api, `commitBatchEdit removes cell and row styles and persists values setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `commitBatchEdit removes cell and row styles and persists values setup`).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'COMMIT_A0');

        // Tab through b0 to row 1
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Edit row 1, column b
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        const cellB1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        input = await waitForInput(gridDiv, cellB1);
        await user.clear(input);
        await user.type(input, 'COMMIT_B1');

        // Tab to row 2
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Verify batch styles exist before commit
        const cellA0Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Before).toHaveClass(/ag-cell-batch-edit/);
        const row0 = cellA0Before.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        const cellB1Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        expect(cellB1Before).toHaveClass(/ag-cell-batch-edit/);
        const row1 = cellB1Before.closest('[row-index="1"]');
        expect(row1).toHaveClass(/ag-row-batch-edit/);

        // Commit batch edit
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // All batch edit styles should be removed
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        const row0After = cellA0After.closest('[row-index="0"]');
        expect(row0After).not.toHaveClass(/ag-row-batch-edit/);

        const cellB1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        expect(cellB1After).not.toHaveClass(/ag-cell-batch-edit/);
        const row1After = cellB1After.closest('[row-index="1"]');
        expect(row1After).not.toHaveClass(/ag-row-batch-edit/);

        // Values should persist
        expect(cellA0After).toHaveTextContent('COMMIT_A0');
        expect(cellB1After).toHaveTextContent('COMMIT_B1');

        // Underlying row data should reflect committed values
        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('COMMIT_A0');
        expect(rowData[1].b).toBe('COMMIT_B1');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 8,
            cellEditingStopped: 8,
            cellValueChanged: 2,
            rowValueChanged: 2,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `commitBatchEdit removes cell and row styles and persists values final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"COMMIT_A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"COMMIT_B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `
        );
    });

    test('commitBatchEdit clears styles when Enter closed editors on an unchanged row', async () => {
        const api = await createGrid();
        await new GridColumns(api, `commitBatchEdit clears styles when Enter closed editors on an unchanged row setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `commitBatchEdit clears styles when Enter closed editors on an unchanged row setup`)
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');

        // Tab through col b of row 0 into row 1 col a (cross row boundary; row 0's
        // pending edit is preserved, the rest of row 0 is purged)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Press Enter on row 1 (no changes) — closes editors and purges row 1's
        // UNEDITED entries, but leaves `this.rowNode` pointing at row 1.
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Sanity: row 0 still has batch styles before commit
        const cellA0Mid = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Mid).toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0Mid.closest('[row-index="0"]')).toHaveClass(/ag-row-batch-edit/);

        // Commit
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // Row 0 styles must be cleared and value persisted
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('CHANGED');
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).not.toHaveClass(/ag-cell-editing/);

        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);
        expect(row0).not.toHaveClass(/ag-row-editing/);

        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('CHANGED');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 5,
            cellValueChanged: 1,
            rowValueChanged: 1,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(
            api,
            `commitBatchEdit clears styles when Enter closed editors on an unchanged row final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"CHANGED" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('commitBatchEdit persists every pending row after Enter on an unchanged row', async () => {
        const api = await createGrid();
        await new GridColumns(api, `commitBatchEdit persists every pending row after Enter on an unchanged row setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `commitBatchEdit persists every pending row after Enter on an unchanged row setup`)
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'R0_NEW');

        // Tab through col b of row 0 into row 1 col a
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Edit row 1, column a
        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        input = await waitForInput(gridDiv, cellA1);
        await user.clear(input);
        await user.type(input, 'R1_NEW');

        // Tab through col b of row 1 into row 2 col a (no changes on row 2)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Press Enter on row 2 — purges row 2's UNEDITED entries while leaving
        // `this.rowNode` pointing at row 2.
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Sanity: rows 0 and 1 still carry pending styles
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveClass(/ag-cell-batch-edit/);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'))).toHaveClass(/ag-cell-batch-edit/);

        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // Both previously-edited rows must have styles cleared
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('R0_NEW');
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After.closest('[row-index="0"]')).not.toHaveClass(/ag-row-batch-edit/);

        const cellA1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1After).toHaveTextContent('R1_NEW');
        expect(cellA1After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA1After.closest('[row-index="1"]')).not.toHaveClass(/ag-row-batch-edit/);

        // Data persisted for rows 0 and 1, row 2 untouched
        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('R0_NEW');
        expect(rowData[1].a).toBe('R1_NEW');
        expect(rowData[2].a).toBe('A2');

        // rowValueChanged and cellValueChanged fire once per changed row
        expect(eventTracker.counts.batchEditingStarted).toBe(1);
        expect(eventTracker.counts.batchEditingStopped).toBe(1);
        expect(eventTracker.counts.cellValueChanged).toBe(2);
        expect(eventTracker.counts.rowValueChanged).toBe(2);
        await new GridRows(
            api,
            `commitBatchEdit persists every pending row after Enter on an unchanged row final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"R0_NEW" b:"B0"
            ├── LEAF id:ROW_1 a:"R1_NEW" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('cancelBatchEdit clears styles when Enter closed editors on an unchanged row', async () => {
        // Symmetric case to the commit repro: after Enter purged the tracked row's UNEDITED
        // entries, cancelBatchEdit must still revert data and clear styles on previously-edited rows.
        const api = await createGrid();
        await new GridColumns(api, `cancelBatchEdit clears styles when Enter closed editors on an unchanged row setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `cancelBatchEdit clears styles when Enter closed editors on an unchanged row setup`)
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

        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const inputA0 = await waitForInput(gridDiv, cellA0);
        await user.clear(inputA0);
        await user.type(inputA0, 'CHANGED');

        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Sanity: row 0 still has batch styles before cancel
        const cellA0Mid = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Mid).toHaveClass(/ag-cell-batch-edit/);

        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).toHaveTextContent('A0');
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        expect(cellA0After).not.toHaveClass(/ag-cell-editing/);

        const row0 = cellA0After.closest('[row-index="0"]');
        expect(row0).not.toHaveClass(/ag-row-batch-edit/);
        expect(row0).not.toHaveClass(/ag-row-editing/);

        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('A0');

        expect(eventTracker.counts.batchEditingStarted).toBe(1);
        expect(eventTracker.counts.batchEditingStopped).toBe(1);
        expect(eventTracker.counts.cellValueChanged).toBe(0);
        expect(eventTracker.counts.rowValueChanged).toBe(0);
        await new GridRows(
            api,
            `cancelBatchEdit clears styles when Enter closed editors on an unchanged row final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('cancelBatchEdit removes cell and row styles and reverts values', async () => {
        const api = await createGrid();
        await new GridColumns(api, `cancelBatchEdit removes cell and row styles and reverts values setup`).checkColumns(
            `
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `
        );
        await new GridRows(api, `cancelBatchEdit removes cell and row styles and reverts values setup`).check(`
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

        // Edit row 0, column a
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        let input = await waitForInput(gridDiv, cellA0);
        await user.clear(input);
        await user.type(input, 'CANCEL_A0');

        // Tab through b0 to row 1
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Edit row 1, column b
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        const cellB1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        input = await waitForInput(gridDiv, cellB1);
        await user.clear(input);
        await user.type(input, 'CANCEL_B1');

        // Tab to row 2
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Verify batch styles exist before cancel
        const cellA0Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Before).toHaveClass(/ag-cell-batch-edit/);
        const row0 = cellA0Before.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);

        const cellB1Before = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        expect(cellB1Before).toHaveClass(/ag-cell-batch-edit/);
        const row1 = cellB1Before.closest('[row-index="1"]');
        expect(row1).toHaveClass(/ag-row-batch-edit/);

        // Cancel batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        // All batch edit styles should be removed
        const cellA0After = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0After).not.toHaveClass(/ag-cell-batch-edit/);
        const row0After = cellA0After.closest('[row-index="0"]');
        expect(row0After).not.toHaveClass(/ag-row-batch-edit/);

        const cellB1After = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'b'));
        expect(cellB1After).not.toHaveClass(/ag-cell-batch-edit/);
        const row1After = cellB1After.closest('[row-index="1"]');
        expect(row1After).not.toHaveClass(/ag-row-batch-edit/);

        // Values should revert to original
        expect(cellA0After).toHaveTextContent('A0');
        expect(cellB1After).toHaveTextContent('B1');

        // Underlying row data should reflect original values
        const rowData = api.getGridOption('rowData')!;
        expect(rowData[0].a).toBe('A0');
        expect(rowData[1].b).toBe('B1');

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 8,
            cellEditingStopped: 8,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `cancelBatchEdit removes cell and row styles and reverts values final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
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

        // Edit row 0, column a — use Backspace to clear character-by-character
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cellA0);
        // 'A0' is 2 chars — press Backspace 3 times (extra is harmless)
        await user.keyboard('{Backspace}{Backspace}{Backspace}');
        expect(input.value).toBe('');

        // Tab through b0 to row 1 (commits row 0)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Cell should show empty and have batch style
        const cellA0Cleared = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Cleared).toHaveTextContent('');
        expect(cellA0Cleared).toHaveClass(/ag-cell-batch-edit/);

        // Stop editing so Delete triggers cellClear
        api.stopEditing();
        await asyncSetTimeout(0);

        // Focus the cleared cell and press Delete — should stay cleared
        const cellA0ForToggle = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cellA0ForToggle);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const cellA0Still = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0Still).toHaveTextContent('');
        expect(cellA0Still).toHaveClass(/ag-cell-batch-edit/);

        // Row should still have batch style (cell is still edited/cleared)
        const row0 = cellA0Still.closest('[row-index="0"]');
        expect(row0).toHaveClass(/ag-row-batch-edit/);
        await new GridRows(api, `Backspace to clear cell then Delete keeps value cleared final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:"B0"
            ├── LEAF id:ROW_1 a:"A1" b:"B1"
            └── LEAF id:ROW_2 a:"A2" b:"B2"
        `);
    });

    test('range Delete on cleared cells keeps them cleared', async () => {
        const api = await rangeGridMgr.createGridAndWait('fullRowRangeToggle', {
            editType: 'fullRow',
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

        // Both cells should be cleared
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

    test('range Delete applies batch edit styles', async () => {
        const api = await rangeGridMgr.createGridAndWait('fullRowRangeBatch', {
            editType: 'fullRow',
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
        await new GridColumns(api, `range Delete applies batch edit styles setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `range Delete applies batch edit styles setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Select range and delete
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        // Cleared cells should have batch edit style
        const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        expect(cellA0).toHaveClass(/ag-cell-batch-edit/);

        const cellA1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        expect(cellA1).toHaveClass(/ag-cell-batch-edit/);

        // Column b cells should NOT have batch edit style
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
            rowValueChanged: 2,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });
        await new GridRows(api, `range Delete applies batch edit styles final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:null b:"B0"
            └── LEAF id:ROW_1 a:null b:"B1"
        `);
    });

    test('range Delete cancel reverts data and removes styles', async () => {
        const api = await rangeGridMgr.createGridAndWait('fullRowRangeCancel', {
            editType: 'fullRow',
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
        await new GridColumns(api, `range Delete cancel reverts data and removes styles setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
        await new GridRows(api, `range Delete cancel reverts data and removes styles setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Select multi-column range and delete
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
        await new GridRows(api, `range Delete cancel reverts data and removes styles final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
    });
});
