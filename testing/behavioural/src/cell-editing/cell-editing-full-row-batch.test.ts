import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { BatchEditingStoppedEvent } from 'ag-grid-community';
import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../test-utils';

describe('Cell Editing: full-row batch', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each(['commit', 'cancel'] as const)('full-row batch %s does not duplicate updates', async (action) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: string;
            colDef: any;
        }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(`${data.id}:${colDef.field}`);
            (data as any)[colDef.field] = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingFullRowBatch-${action}`, {
            editType: 'fullRow',
            defaultColDef: {
                editable: true,
                valueSetter,
            },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: 'ROW_0', a: 'A0', b: 'B0' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'A1');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        if (action === 'commit') {
            api.commitBatchEdit();
        } else {
            api.cancelBatchEdit();
        }
        await asyncSetTimeout(0);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: action === 'commit' ? 1 : 0,
            rowValueChanged: action === 'commit' ? 1 : 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        if (action === 'commit') {
            await new GridRows(api, `after ${action}`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A1" b:"B0"
            `);
            expect(valueSetterTargets).toEqual(['ROW_0:a']);
            expect(valueSetterCalls).toBe(1);
        } else {
            await new GridRows(api, `after ${action}`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A0" b:"B0"
            `);
            expect(valueSetterTargets).toEqual([]);
            expect(valueSetterCalls).toBe(0);
        }

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('rowValueChanged does not fire during batch row-to-row Tab navigation', async () => {
        const api = await gridMgr.createGridAndWait('cellEditingFullRowBatch-rowNav', {
            editType: 'fullRow',
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
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Start batch editing
        api.startBatchEdit();

        // Click and edit row 0 col a
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'X');

        // Tab from col a -> col b (same row)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Tab from col b -> next row (crosses row boundary)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Before commit: pending edits visible in batch mode, but data not yet committed
        await new GridRows(api, 'before commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"X" "A0" b:"B0"
            └── LEAF 🖍️ id:ROW_1 a:"A1" b:"B1"
        `);

        // Before commit: no value events should have fired
        expect(eventTracker.counts.rowValueChanged).toBe(0);
        expect(eventTracker.counts.cellValueChanged).toBe(0);

        // Now commit
        eventTracker.reset();
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // After commit: rowValueChanged and cellValueChanged should each fire exactly once
        expect(eventTracker.counts.rowValueChanged).toBe(1);
        expect(eventTracker.counts.cellValueChanged).toBe(1);

        // Data committed for row 0 only
        await new GridRows(api, 'after commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"X" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test.each(['commit', 'cancel'] as const)(
        'batchEditingStopped does not fire during full-row Tab navigation across rows (%s)',
        async (action) => {
            const api = await gridMgr.createGridAndWait(`cellEditingFullRowBatch-batchStop-${action}`, {
                editType: 'fullRow',
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
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup({ skipHover: true });
            await asyncSetTimeout(0);

            // Start batch editing
            api.startBatchEdit();

            // Click and edit row 0 col a
            const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.click(cellA0);
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            const input = await waitForInput(gridDiv, cellA0);
            await user.clear(input);
            await user.type(input, 'x');

            // Tab from col a -> col b (same row)
            await user.keyboard('{Tab}');
            await asyncSetTimeout(0);

            // batchEditingStopped must NOT have fired (still navigating within the batch)
            expect(eventTracker.counts.batchEditingStopped).toBe(0);

            // Tab from col b -> next row col a (crosses row boundary)
            await user.keyboard('{Tab}');
            await asyncSetTimeout(0);

            // batchEditingStopped must NOT fire when navigating between rows via Tab
            expect(eventTracker.counts.batchEditingStopped).toBe(0);

            // Verify full event counts before commit/cancel — no batch stop events should have occurred
            const preActionCounts = { ...eventTracker.counts };
            expect(preActionCounts.batchEditingStopped).toBe(0);

            // Now commit or cancel the batch
            eventTracker.reset();
            if (action === 'commit') {
                api.commitBatchEdit();
            } else {
                api.cancelBatchEdit();
            }
            await asyncSetTimeout(0);

            // Full event counts after commit/cancel
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 0,
                cellEditingStopped: 2,
                cellValueChanged: action === 'commit' ? 1 : 0,
                rowValueChanged: action === 'commit' ? 1 : 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 1,
            });

            // Verify data
            if (action === 'commit') {
                await new GridRows(api, 'after commit').check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:ROW_0 a:"x" b:"B0"
                    └── LEAF id:ROW_1 a:"A1" b:"B1"
                `);
            } else {
                await new GridRows(api, 'after cancel').check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:ROW_0 a:"A0" b:"B0"
                    └── LEAF id:ROW_1 a:"A1" b:"B1"
                `);
            }
        }
    );

    test.each(['commit', 'cancel'] as const)(
        'batchEditingStopped event contains correct changes payload (%s)',
        async (action) => {
            const batchStoppedEvents: BatchEditingStoppedEvent[] = [];

            const api = await gridMgr.createGridAndWait(`cellEditingFullRowBatch-payload-${action}`, {
                editType: 'fullRow',
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
                onBatchEditingStopped: (event) => {
                    batchStoppedEvents.push(event);
                },
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup({ skipHover: true });
            await asyncSetTimeout(0);

            api.startBatchEdit();

            // Edit row 0, col a
            const cellA0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.click(cellA0);
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            const inputA = await waitForInput(gridDiv, cellA0);
            await user.clear(inputA);
            await user.type(inputA, 'NEW_A');

            // Tab to col b, edit it too
            await user.keyboard('{Tab}');
            await asyncSetTimeout(0);
            const cellB0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
            const inputB = await waitForInput(gridDiv, cellB0);
            await user.clear(inputB);
            await user.type(inputB, 'NEW_B');

            // Press Enter to stop editing row 0 (stays in batch mode)
            await user.keyboard('{Enter}');
            await asyncSetTimeout(0);

            // No batchEditingStopped should have fired yet
            expect(batchStoppedEvents).toHaveLength(0);

            // Commit or cancel
            if (action === 'commit') {
                api.commitBatchEdit();
            } else {
                api.cancelBatchEdit();
            }
            await asyncSetTimeout(0);

            // batchEditingStopped should fire exactly once
            expect(batchStoppedEvents).toHaveLength(1);

            const stoppedEvent = batchStoppedEvents[0];

            if (action === 'commit') {
                // Commit: changes should contain the edited cells
                expect(stoppedEvent.changes).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ rowIndex: 0, columnId: 'a', oldValue: 'A0', newValue: 'NEW_A' }),
                        expect.objectContaining({ rowIndex: 0, columnId: 'b', oldValue: 'B0', newValue: 'NEW_B' }),
                    ])
                );
                expect(stoppedEvent.changes).toHaveLength(2);
            } else {
                // Cancel: changes should be empty (edits were discarded)
                expect(stoppedEvent.changes).toEqual([]);
            }

            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 2,
                cellEditingStopped: 2,
                cellValueChanged: action === 'commit' ? 2 : 0,
                rowValueChanged: action === 'commit' ? 1 : 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 1,
                batchEditingStopped: 1,
            });
        }
    );

    test.each(['commit', 'cancel'] as const)(
        "setDataValue('edit') updates single cell editor during full-row batch (%s)",
        async (action) => {
            const api = await gridMgr.createGridAndWait(`cellEditingFullRowBatch-editPush-${action}`, {
                editType: 'fullRow',
                defaultColDef: { editable: true },
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [{ id: 'ROW_0', a: 'A0', b: 'B0' }],
                getRowId: (params) => params.data.id,
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup({ skipHover: true });
            await asyncSetTimeout(0);

            api.startBatchEdit();

            // Start full-row editing by clicking on cell 'a'
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.click(cellA);
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await waitForInput(gridDiv, cellA);
            await asyncSetTimeout(0);

            // Both cells in the row should have active editors (full-row mode)
            const inputs = gridDiv.querySelectorAll<HTMLInputElement>('input');
            expect(inputs).toHaveLength(2);
            const inputA = Array.from(inputs).find((i) => i.value === 'A0');
            const inputB = Array.from(inputs).find((i) => i.value === 'B0');
            expect(inputA).toBeInTheDocument();
            expect(inputB).toBeInTheDocument();

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Push a new value via 'edit' source — only cell 'a' is updated
            rowNode.setDataValue('a', 'PUSHED', 'edit');
            await asyncSetTimeout(1);

            // Editor 'a' should reflect pushed value; editor 'b' unchanged
            const inputsAfter = gridDiv.querySelectorAll<HTMLInputElement>('input');
            const inputAAfter = Array.from(inputsAfter).find((i) => i.value === 'PUSHED');
            const inputBStillOriginal = Array.from(inputsAfter).find((i) => i.value === 'B0');
            expect(inputAAfter).toBeInTheDocument();
            expect(inputBStillOriginal).toBeInTheDocument();

            // Data still unchanged until commit
            expect(rowNode.data.a).toBe('A0');
            expect(rowNode.data.b).toBe('B0');

            // getCellValue from 'edit' and 'batch' return pushed value for 'a'
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('PUSHED');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('PUSHED');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('A0');

            // No value-change events should fire until commit
            expect(eventTracker.counts.cellValueChanged).toBe(0);
            expect(eventTracker.counts.rowValueChanged).toBe(0);

            // Stop editing (keeps batch pending)
            api.stopEditing();
            await asyncSetTimeout(0);

            if (action === 'commit') {
                api.commitBatchEdit();
            } else {
                api.cancelBatchEdit();
            }
            await asyncSetTimeout(0);

            if (action === 'commit') {
                expect(rowNode.data.a).toBe('PUSHED');
                expect(rowNode.data.b).toBe('B0');

                await new GridRows(api, 'after commit').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"PUSHED" b:"B0"
                `);

                expect(eventTracker.counts.cellValueChanged).toBe(1);
                expect(eventTracker.counts.rowValueChanged).toBe(1);
            } else {
                expect(rowNode.data.a).toBe('A0');
                expect(rowNode.data.b).toBe('B0');

                await new GridRows(api, 'after cancel').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 a:"A0" b:"B0"
                `);

                expect(eventTracker.counts.cellValueChanged).toBe(0);
                expect(eventTracker.counts.rowValueChanged).toBe(0);
            }

            eventTracker.destroy();
        }
    );
});
