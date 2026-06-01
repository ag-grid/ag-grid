import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { NumberEditorModule, TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../test-utils';

describe('Cell Editing: edge cases', () => {
    const gridMgr = new TestGridsManager({
        modules: [CellSelectionModule, BatchEditModule, TextEditorModule, NumberEditorModule, ClipboardModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    /** Helper: ensure focus + range are set before each keyboard action */
    function selectCell(api: any, rowIndex: number, col: string) {
        api.setFocusedCell(rowIndex, col);
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: rowIndex, rowEndIndex: rowIndex, columns: [col] });
    }

    // After a non-batch KEEP_EDITOR_SOURCES setDataValue (e.g. paste),
    // the committed data must reflect the valueSetter's transformation.
    describe('syncEditAfterCommit reads back transformed value', () => {
        test('paste via setDataValue with transforming valueSetter writes transformed data', async () => {
            const valueSetter = ({ data, newValue }: { data: any; newValue: string }) => {
                // Transform: always uppercase the stored value
                data.a = String(newValue).toUpperCase();
                return true;
            };

            const api = await gridMgr.createGridAndWait('syncTransform-paste', {
                cellSelection: true,
                columnDefs: [
                    { field: 'a', editable: true, valueSetter },
                    { field: 'b', editable: true },
                ],
                rowData: [
                    { id: 'ROW_0', a: 'Original', b: 'B0' },
                    { id: 'ROW_1', a: 'A1', b: 'B1' },
                ],
                getRowId: (params) => params.data.id,
            });
            await asyncSetTimeout(0);

            // Paste 'hello' into ROW_0:a via paste source path
            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'hello', 'paste');
            await asyncSetTimeout(0);

            // valueSetter uppercased → data should show HELLO
            expect(rowNode.data.a).toBe('HELLO');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('HELLO');

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        });

        test('rangeSvc setDataValue with transforming valueSetter writes transformed data', async () => {
            const valueSetter = ({ data, newValue }: { data: any; newValue: string }) => {
                data.a = newValue === null ? null : `[${newValue}]`;
                return true;
            };

            const api = await gridMgr.createGridAndWait('syncTransform-rangeSvc', {
                cellSelection: true,
                columnDefs: [
                    { field: 'a', editable: true, valueSetter },
                    { field: 'b', editable: true },
                ],
                rowData: [
                    { id: 'ROW_0', a: '[Original]', b: 'B0' },
                    { id: 'ROW_1', a: '[A1]', b: 'B1' },
                ],
                getRowId: (params) => params.data.id,
            });
            await asyncSetTimeout(0);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'wrapped', 'rangeSvc');
            await asyncSetTimeout(0);

            expect(rowNode.data.a).toBe('[wrapped]');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('[wrapped]');

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        });
    });

    // syncEditAfterCommit failure path should revert the edit.
    describe('valueSetter rejection via paste/rangeSvc source', () => {
        test('paste setDataValue with rejecting valueSetter keeps original value', async () => {
            const valueSetter = () => false; // always reject

            const api = await gridMgr.createGridAndWait('rejectPaste', {
                cellSelection: true,
                columnDefs: [{ field: 'a', editable: true, valueSetter }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `paste setDataValue with rejecting valueSetter keeps original value setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `paste setDataValue with rejecting valueSetter keeps original value setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"Original"
                `
            );
            const eventTracker = new EditEventTracker(api);
            await asyncSetTimeout(0);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'Rejected', 'paste');
            await asyncSetTimeout(0);

            // valueSetter rejected → data unchanged
            expect(rowNode.data.a).toBe('Original');
            expect(result).toBe(false);
            expect(eventTracker.counts.cellValueChanged).toBe(0);
            await new GridRows(api, `paste setDataValue with rejecting valueSetter keeps original value final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"Original"
                `);
        });

        test('rangeSvc setDataValue with rejecting valueSetter keeps original value', async () => {
            const valueSetter = () => false;

            const api = await gridMgr.createGridAndWait('rejectRangeSvc', {
                cellSelection: true,
                columnDefs: [{ field: 'a', editable: true, valueSetter }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `rangeSvc setDataValue with rejecting valueSetter keeps original value setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `rangeSvc setDataValue with rejecting valueSetter keeps original value setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"Original"
                `);
            await asyncSetTimeout(0);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'Denied', 'rangeSvc');
            await asyncSetTimeout(0);

            expect(rowNode.data.a).toBe('Original');
            expect(result).toBe(false);
            await new GridRows(api, `rangeSvc setDataValue with rejecting valueSetter keeps original value final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"Original"
                `);
        });
    });

    // The second call should win and sourceValue should reflect the final committed value.
    describe('sequential setDataValue to same cell', () => {
        test('two rapid paste setDataValue calls — second value wins', async () => {
            let valueSetterCalls = 0;
            const valueSetter = ({ data, newValue }: { data: any; newValue: any }) => {
                valueSetterCalls += 1;
                data.a = newValue;
                return true;
            };

            const api = await gridMgr.createGridAndWait('seqPaste', {
                cellSelection: true,
                columnDefs: [{ field: 'a', editable: true, valueSetter }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            const eventTracker = new EditEventTracker(api);
            await asyncSetTimeout(0);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'First', 'paste');
            rowNode.setDataValue('a', 'Second', 'paste');
            await asyncSetTimeout(0);

            const afterBoth = new GridRows(api, 'after two rapid paste calls');
            await afterBoth.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"Second"
            `);

            expect(rowNode.data.a).toBe('Second');
            expect(valueSetterCalls).toBe(2);
            expect(eventTracker.counts.cellValueChanged).toBe(2);
        });

        test('batch: two setDataValue calls — second value is the pending value', async () => {
            const api = await gridMgr.createGridAndWait('seqBatch', {
                cellSelection: true,
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'a' }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            await asyncSetTimeout(0);

            api.startBatchEdit();

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'First', 'paste');
            rowNode.setDataValue('a', 'Second', 'paste');
            await asyncSetTimeout(0);

            // In batch mode, pending value should be 'Second'; data is still 'Original'
            const afterBothBatch = new GridRows(api, 'after two batch paste calls');
            await afterBothBatch.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:ROW_0 a:⏳"Second" "Original"
            `);
            expect(rowNode.data.a).toBe('Original');

            api.commitBatchEdit();
            await asyncSetTimeout(0);

            expect(rowNode.data.a).toBe('Second');
        });
    });

    // The editor on cell A should remain undisturbed and cell B should
    // get committed correctly (syncEditAfterCommit must not run for the editing cell).
    describe('setDataValue on different cell while editor is open', () => {
        test('paste on cell B while editing cell A leaves editor undisturbed', async () => {
            const api = await gridMgr.createGridAndWait('pasteWhileEditing', {
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

            // Open editor on ROW_0:a
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.dblClick(cellA);
            const input = await waitForInput(gridDiv, cellA);
            await user.clear(input);
            await user.type(input, 'InProgress');

            // While editor open on ROW_0:a, ROW_1 unchanged
            await new GridRows(api, 'editor open on ROW_0:a, typing InProgress').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:ROW_0 a:🖍️"InProgress" "A0" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"B1"
            `);

            // Paste on ROW_1:b (different cell)
            const rowNode1 = api.getDisplayedRowAtIndex(1)!;
            rowNode1.setDataValue('b', 'PastedValue', 'paste');
            await asyncSetTimeout(0);

            // After paste: ROW_0:a editor still open, ROW_1:b committed immediately (non-batch)
            await new GridRows(api, 'after paste on ROW_1:b — editor still open on ROW_0').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:ROW_0 a:🖍️"InProgress" "A0" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"PastedValue"
            `);

            // Editor on ROW_0:a should still be open with typed value
            const inputAfter = await waitForInput(gridDiv, cellA);
            expect(inputAfter).toBeTruthy();
            expect(inputAfter.value).toBe('InProgress');

            // ROW_1:b should have the pasted value committed
            expect(rowNode1.data.b).toBe('PastedValue');
            expect(api.getCellValue({ rowNode: rowNode1, colKey: 'b' })).toBe('PastedValue');

            // ROW_0:a data should still be original (editor not committed yet)
            const rowNode0 = api.getDisplayedRowAtIndex(0)!;
            expect(rowNode0.data.a).toBe('A0');
        });

        test('batch: setDataValue paste on different cell stores pending edit without committing', async () => {
            const api = await gridMgr.createGridAndWait('batchPasteNoEditor', {
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
            await asyncSetTimeout(0);

            api.startBatchEdit();

            // Paste on ROW_1:b via setDataValue
            const rowNode1 = api.getDisplayedRowAtIndex(1)!;
            rowNode1.setDataValue('b', 'BatchPaste', 'paste');
            await asyncSetTimeout(0);

            // In batch mode, data stays original (paste value is pending, not committed)
            expect(rowNode1.data.b).toBe('B1');

            // The grid cell should display the pending value
            expect(api.getCellValue({ rowNode: rowNode1, colKey: 'b' })).toBe('BatchPaste');

            await new GridRows(api, 'after batch paste on ROW_1:b — ROW_0 unaffected').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                └── LEAF ⏳ id:ROW_1 a:"A1" b:⏳"BatchPaste" "B1"
            `);

            // After commit, data should be updated
            api.commitBatchEdit();
            await asyncSetTimeout(0);
            expect(rowNode1.data.b).toBe('BatchPaste');

            await new GridRows(api, 'after commit — only ROW_1:b changed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"BatchPaste"
            `);

            // Verify ROW_0 was not affected
            const rowNode0 = api.getDisplayedRowAtIndex(0)!;
            expect(rowNode0.data.a).toBe('A0');
            expect(rowNode0.data.b).toBe('B0');
        });
    });

    describe('batch commit and cancel edge cases', () => {
        test('cancelBatchEdit reverts editor-typed, paste-source, and keyboard-deleted pending edits', async () => {
            const api = await gridMgr.createGridAndWait('batchCancel', {
                cellSelection: true,
                defaultColDef: { editable: true },
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
            const gridDiv = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup({ skipHover: true });
            await asyncSetTimeout(0);

            api.startBatchEdit();

            // Editor-typed edit on ROW_0:a
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.dblClick(cellA);
            const input = await waitForInput(gridDiv, cellA);
            await user.clear(input);
            await user.type(input, 'Modified');
            await user.keyboard('{Enter}');
            await asyncSetTimeout(0);

            // Paste-source edit on ROW_1:a
            const rowNode1 = api.getDisplayedRowAtIndex(1)!;
            rowNode1.setDataValue('a', 'Pasted', 'paste');
            await asyncSetTimeout(0);

            // Keyboard Delete on ROW_2:b
            selectCell(api, 2, 'b');
            await asyncSetTimeout(0);
            await user.keyboard('{Delete}');
            await asyncSetTimeout(0);

            // Verify pending state — data unchanged, all three edit sources visible
            const pendingState = new GridRows(api, 'pending edits');
            await pendingState.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"Modified" "A0" b:"B0"
                ├── LEAF ⏳ id:ROW_1 a:⏳"Pasted" "A1" b:"B1"
                └── LEAF ⏳ id:ROW_2 a:"A2" b:⏳null "B2"
            `);

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(1)!.data.a).toBe('A1');
            expect(api.getDisplayedRowAtIndex(2)!.data.b).toBe('B2');

            // Cancel — all three revert
            api.cancelBatchEdit();
            await asyncSetTimeout(0);

            const afterCancel = new GridRows(api, 'after cancel');
            await afterCancel.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                ├── LEAF id:ROW_1 a:"A1" b:"B1"
                └── LEAF id:ROW_2 a:"A2" b:"B2"
            `);

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(1)!.data.a).toBe('A1');
            expect(api.getDisplayedRowAtIndex(2)!.data.b).toBe('B2');
        });

        test('commitBatchEdit applies all pending edits to data', async () => {
            let valueSetterCalls = 0;
            const valueSetter = ({
                data,
                newValue,
                colDef,
            }: {
                data: any;
                newValue: any;
                colDef: { field?: string };
            }) => {
                valueSetterCalls += 1;
                if (colDef.field) {
                    data[colDef.field] = newValue;
                }
                return true;
            };

            const api = await gridMgr.createGridAndWait('batchCommit', {
                cellSelection: true,
                defaultColDef: { editable: true, valueSetter },
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

            await new GridRows(api, 'initial state').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"A0" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"B1"
            `);

            api.startBatchEdit();

            // Edit ROW_0:a
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.dblClick(cellA);
            const input = await waitForInput(gridDiv, cellA);
            await user.clear(input);
            await user.type(input, 'CommittedA');
            await user.keyboard('{Enter}');
            await asyncSetTimeout(0);

            // After editor edit: ROW_0:a is pending, ROW_1 untouched
            await new GridRows(api, 'after editor edit on ROW_0:a').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"CommittedA" "A0" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"B1"
            `);

            // Paste into ROW_1:b
            const rowNode1 = api.getDisplayedRowAtIndex(1)!;
            rowNode1.setDataValue('b', 'CommittedB', 'paste');
            await asyncSetTimeout(0);

            // After paste: both rows have pending edits, underlying data unchanged
            await new GridRows(api, 'after paste on ROW_1:b — both rows pending').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:ROW_0 a:⏳"CommittedA" "A0" b:"B0"
                └── LEAF ⏳ id:ROW_1 a:"A1" b:⏳"CommittedB" "B1"
            `);

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(1)!.data.b).toBe('B1');

            // Commit
            api.commitBatchEdit();
            await asyncSetTimeout(0);

            const afterCommit = new GridRows(api, 'after commit');
            await afterCommit.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"CommittedA" b:"B0"
                └── LEAF id:ROW_1 a:"A1" b:"CommittedB"
            `);

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('CommittedA');
            expect(api.getDisplayedRowAtIndex(1)!.data.b).toBe('CommittedB');
            expect(valueSetterCalls).toBeGreaterThanOrEqual(2);
        });
    });

    // In batch mode, paste bypasses valueSetter (deferred to commit).
    // The pending value is set regardless; rejection only happens at commit.
    test('batch: paste sets pending value despite rejecting valueSetter (deferred to commit)', async () => {
        const valueSetter = () => false; // always reject

        const api = await gridMgr.createGridAndWait('batchReject', {
            cellSelection: true,
            columnDefs: [{ field: 'a', editable: true, valueSetter }],
            rowData: [{ id: 'ROW_0', a: 'Original' }],
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Paste sets pending value (valueSetter not called yet)
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'Attempted', 'paste');
        await asyncSetTimeout(0);

        // In batch mode, cell displays the pending value
        const afterPaste = new GridRows(api, 'after batch paste — pending value shown');
        await afterPaste.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳"Attempted" "Original"
        `);

        // Data unchanged (still original)
        expect(rowNode.data.a).toBe('Original');

        // Commit — valueSetter rejects, so data stays original
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        expect(rowNode.data.a).toBe('Original');
    });

    // Pasting the same value that's already pending goes through cleanupEditors again
    // but the net result is the same pending value.
    test('batch: paste same value twice — both succeed but pending value unchanged', async () => {
        const api = await gridMgr.createGridAndWait('pasteDupe', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a' }],
            rowData: [{ id: 'ROW_0', a: 'Original' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `batch: paste same value twice — both succeed but pending value unchanged setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `batch: paste same value twice — both succeed but pending value unchanged setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"Original"
            `
        );
        await asyncSetTimeout(0);

        api.startBatchEdit();

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        const result1 = rowNode.setDataValue('a', 'Pasted', 'paste');
        const result2 = rowNode.setDataValue('a', 'Pasted', 'paste');
        await asyncSetTimeout(0);

        expect(result1).toBe(true);
        expect(result2).toBe(true);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('Pasted');
        expect(rowNode.data.a).toBe('Original');

        api.cancelBatchEdit();
        await new GridRows(api, `batch: paste same value twice — both succeed but pending value unchanged final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"Original"
            `);
    });

    // Escape in batch should revert to the prior pending value, not to sourceValue.
    test('batch: paste X, open editor, type Y, Escape → cell shows X (mid-batch Escape preserves prior pending value)', async () => {
        const api = await gridMgr.createGridAndWait('escapePreserves', {
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a' }],
            rowData: [{ id: 'ROW_0', a: 'Source' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Paste sets pending value to 'PastedX'
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'PastedX', 'paste');
        await asyncSetTimeout(0);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('PastedX');

        await new GridRows(api, 'after paste — pending PastedX, data still Source').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳"PastedX" "Source"
        `);

        // Open editor on same cell and type a different value
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cell);
        await asyncSetTimeout(0);

        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'TypedY');

        // While editor is open, cell shows live typing
        await new GridRows(api, 'editor open — typing TypedY, pending was PastedX').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:ROW_0 a:🖍️"TypedY" ⏳"PastedX" "Source"
        `);

        // Escape — should revert to prior pending value 'PastedX', not sourceValue 'Source'
        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('PastedX');
        expect(rowNode.data.a).toBe('Source');

        await new GridRows(api, 'after Escape — reverted to pending PastedX').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳"PastedX" "Source"
        `);

        api.cancelBatchEdit();

        await new GridRows(api, 'after cancelBatchEdit — reverted to Source').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:"Source"
        `);
    });

    // Batch commit with a rejecting valueSetter should leave data unchanged regardless of
    // how the pending value was set — the valueSetter vetoes the actual data write at commit time.
    test('batch: valueSetter rejection at commit — editor-typed and Delete-clear paths both leave data unchanged', async () => {
        const valueSetter = () => false;

        const api = await gridMgr.createGridAndWait('batchReject', {
            cellSelection: true,
            columnDefs: [{ field: 'a', editable: true, valueSetter }],
            rowData: [{ id: 'ROW_0', a: 'Original' }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        // Phase A: editor-typed pending value — valueSetter rejects at commit
        api.startBatchEdit();

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cell);
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Rejected');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('Rejected');
        expect(rowNode.data.a).toBe('Original');

        await new GridRows(api, 'phase A: pending Rejected, data still Original').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳"Rejected" "Original"
        `);

        api.commitBatchEdit();
        await asyncSetTimeout(0);

        expect(rowNode.data.a).toBe('Original');

        await new GridRows(api, 'phase A: after commit with rejection — data unchanged').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:"Original"
        `);

        // Phase B: Delete-clear pending value — valueSetter rejects at commit
        api.startBatchEdit();

        selectCell(api, 0, 'a');
        await asyncSetTimeout(0);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBeNull();
        expect(rowNode.data.a).toBe('Original');

        await new GridRows(api, 'phase B: pending null from Delete, data still Original').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳null "Original"
        `);

        api.commitBatchEdit();
        await asyncSetTimeout(0);

        expect(rowNode.data.a).toBe('Original');

        await new GridRows(api, 'phase B: after commit with rejection — data unchanged').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:"Original"
        `);
    });

    // Numeric column (sourceValue=0): edit → clear → Delete again should stay cleared,
    // because the cell was explicitly edited before being cleared.
    test('batch: edit numeric 0 to new value, Delete clears, second Delete stays cleared', async () => {
        const api = await gridMgr.createGridAndWait('numericEditClear', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: 'ROW_0', a: 0 }],
            getRowId: (params) => params.data.id,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        // Edit cell from 0 to 99
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(cell);
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, '99');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        const afterEdit = new GridRows(api, 'after editing 0 to 99');
        await afterEdit.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳99 0
        `);

        // Delete → clear
        selectCell(api, 0, 'a');
        await asyncSetTimeout(0);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterFirstDelete = new GridRows(api, 'after first Delete');
        await afterFirstDelete.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳null 0
        `);

        // Second Delete → should stay cleared (was edited before being cleared)
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterSecondDelete = new GridRows(api, 'after second Delete — should stay cleared');
        await afterSecondDelete.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳null 0
        `);

        // Underlying data unchanged in batch mode
        expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe(0);

        api.cancelBatchEdit();
    });

    test('batch: Delete on numeric 0, cancel reverts to 0', async () => {
        const api = await gridMgr.createGridAndWait('numericCancelZero', {
            cellSelection: true,
            defaultColDef: { editable: true },
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: 'ROW_0', a: 0 }],
            getRowId: (params) => params.data.id,
        });
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        selectCell(api, 0, 'a');
        await asyncSetTimeout(0);

        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterClear = new GridRows(api, 'after Delete on 0');
        await afterClear.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 a:⏳null 0
        `);

        // Cancel — should revert to 0
        api.cancelBatchEdit();
        await asyncSetTimeout(0);

        const afterCancel = new GridRows(api, 'after cancel — should revert to 0');
        await afterCancel.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:0
        `);

        expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe(0);
    });

    // Non-editor batch writes (paste, cellClear, setDataValue with batch sources) must
    // dispatch batchEditingStarted so that batchEditingStopped fires on commit/cancel. Without this,
    // consumers that defer work until batchEditingStopped (e.g. groupEditService) would orphan pending updates.
    describe('batchEditingStarted/Stopped events for non-editor batch paths', () => {
        test.each(['commit', 'cancel'] as const)(
            'paste-only batch session dispatches both batch events on %s',
            async (action) => {
                const api = await gridMgr.createGridAndWait(`pasteOnlyBatch-${action}`, {
                    cellSelection: true,
                    defaultColDef: { editable: true },
                    columnDefs: [{ field: 'a' }],
                    rowData: [{ id: 'ROW_0', a: 'Original' }],
                    getRowId: (params) => params.data.id,
                });
                const eventTracker = new EditEventTracker(api);
                await asyncSetTimeout(0);

                api.startBatchEdit();

                // Paste-source write without ever opening an editor
                const rowNode = api.getDisplayedRowAtIndex(0)!;
                rowNode.setDataValue('a', 'Pasted', 'paste');
                await asyncSetTimeout(0);

                // batchEditingStarted should have fired lazily
                expect(eventTracker.counts.batchEditingStarted).toBe(1);
                expect(eventTracker.counts.batchEditingStopped).toBe(0);

                if (action === 'commit') {
                    api.commitBatchEdit();
                } else {
                    api.cancelBatchEdit();
                }
                await asyncSetTimeout(0);

                expect(eventTracker.counts).toMatchObject({
                    batchEditingStarted: 1,
                    batchEditingStopped: 1,
                });

                if (action === 'commit') {
                    expect(rowNode.data.a).toBe('Pasted');
                } else {
                    expect(rowNode.data.a).toBe('Original');
                }
            }
        );

        test('cellClear-only batch session dispatches both batch events on commit', async () => {
            const api = await gridMgr.createGridAndWait('cellClearOnlyBatch', {
                cellSelection: true,
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'a' }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `cellClear-only batch session dispatches both batch events on commit setup`)
                .checkColumns(`
                    CENTER
                    └── a "A" width:200 editable
                `);
            await new GridRows(api, `cellClear-only batch session dispatches both batch events on commit setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"Original"
                `
            );
            const eventTracker = new EditEventTracker(api);
            await asyncSetTimeout(0);

            api.startBatchEdit();

            // cellClear-source write without ever opening an editor
            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', null, 'cellClear');
            await asyncSetTimeout(0);

            // batchEditingStarted should have fired
            expect(eventTracker.counts.batchEditingStarted).toBe(1);

            api.commitBatchEdit();
            await asyncSetTimeout(0);

            expect(eventTracker.counts).toMatchObject({
                batchEditingStarted: 1,
                batchEditingStopped: 1,
            });
            expect(rowNode.data.a).toBe(null);
            await new GridRows(api, `cellClear-only batch session dispatches both batch events on commit final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:null
                `);
        });

        test('no-change batch session does not dispatch batch events', async () => {
            const api = await gridMgr.createGridAndWait('noChangeBatch', {
                cellSelection: true,
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'a' }],
                rowData: [{ id: 'ROW_0', a: 'Original' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `no-change batch session does not dispatch batch events setup`).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(api, `no-change batch session does not dispatch batch events setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"Original"
            `);
            const eventTracker = new EditEventTracker(api);
            await asyncSetTimeout(0);

            api.startBatchEdit();
            // No writes at all — just commit
            api.commitBatchEdit();
            await asyncSetTimeout(0);

            expect(eventTracker.counts).toMatchObject({
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
            await new GridRows(api, `no-change batch session does not dispatch batch events final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"Original"
            `);
        });
    });
});
