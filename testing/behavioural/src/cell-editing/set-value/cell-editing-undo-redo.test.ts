import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, UndoRedoEditModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../../test-utils';

describe('Cell Editing: undo/redo', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, UndoRedoEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('undo/redo uses single setValue per action', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingUndoRedo', {
            undoRedoCellEditing: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));

        api.startEditingCell({ rowIndex: 0, colKey: 'field' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Updated Value');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Updated Value');
        expect(valueSetterCalls).toBe(1);

        await new GridRows(api, 'after edit committed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Updated Value"
        `);

        api.undoCellEditing();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Initial Value');
        expect(valueSetterCalls).toBe(2);

        await new GridRows(api, 'after undo').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        api.redoCellEditing();
        await asyncSetTimeout(0);

        await new GridRows(api, 'after redo').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Updated Value"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        // 1 undo, 1 redo
        expect(eventTracker.undoCounts).toEqual({
            undoStarted: 1,
            undoEnded: 1,
            redoStarted: 1,
            redoEnded: 1,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Updated Value');
        expect(valueSetterCalls).toBe(3);
        expect(valueSetterTargets).toEqual(['ROW_0', 'ROW_0', 'ROW_0']);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── field "Field" width:200 editable
        `);
    });

    test.each([false, true])(
        'full-row editing undo/redo fires rowValueChanged once per row (batch=%s)',
        async (batchEnabled) => {
            const rowValueChangedNodes: string[] = [];
            const api = await gridMgr.createGridAndWait(`cellEditingFullRowUndoRedo-${batchEnabled}`, {
                editType: 'fullRow',
                undoRedoCellEditing: true,
                defaultColDef: {
                    editable: true,
                },
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [{ id: 'ROW_0', a: 'A0', b: 'B0' }],
                getRowId: (params) => params.data.id,
                onRowValueChanged: (event) => {
                    if (event.node?.id) {
                        rowValueChangedNodes.push(String(event.node.id));
                    }
                },
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup({ skipHover: true });
            await asyncSetTimeout(0);

            if (batchEnabled) {
                api.startBatchEdit();
            }

            const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
            await user.click(cell);
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            const input = await waitForInput(gridDiv, cell);
            await user.clear(input);
            await user.type(input, 'A1');
            await user.keyboard('{Enter}');

            if (batchEnabled) {
                api.commitBatchEdit();
                await asyncSetTimeout(0);
            }

            await waitFor(() => expect(new Set(rowValueChangedNodes)).toEqual(new Set(['ROW_0'])));

            await new GridRows(api, 'full-row after edit committed').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A1" b:"B0"
            `);

            api.undoCellEditing();
            await asyncSetTimeout(0);
            await waitFor(() => expect(new Set(rowValueChangedNodes)).toEqual(new Set(['ROW_0'])));

            await new GridRows(api, 'full-row after undo').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A0" b:"B0"
            `);

            api.redoCellEditing();
            await asyncSetTimeout(0);
            await waitFor(() => expect(new Set(rowValueChangedNodes)).toEqual(new Set(['ROW_0'])));

            await new GridRows(api, 'full-row after redo').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A1" b:"B0"
            `);

            // 1 initial edit + 1 undo + 1 redo = 3 cellValueChanged
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 2,
                cellEditingStopped: 2,
                cellValueChanged: 3,
                rowValueChanged: 1,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: batchEnabled ? 1 : 0,
                batchEditingStopped: batchEnabled ? 1 : 0,
            });

            // 1 undo, 1 redo
            expect(eventTracker.undoCounts).toEqual({
                undoStarted: 1,
                undoEnded: 1,
                redoStarted: 1,
                redoEnded: 1,
            });

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        }
    );

    test('full-row tabbing to the next row captures undo actions', async () => {
        const api = await gridMgr.createGridAndWait('cellEditingFullRowUndoOnTab', {
            editType: 'fullRow',
            undoRedoCellEditing: true,
            defaultColDef: { editable: true, cellDataType: false },
            columnDefs: [{ field: 'a' }, { field: 'b' }],
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

        const row0CellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.dblClick(row0CellA);
        const input = await waitForInput(gridDiv, row0CellA);
        await user.clear(input);
        await user.type(input, 'A0-EDIT');

        await user.keyboard('{Tab}{Tab}');

        const row1CellA = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'a'));
        await waitForInput(gridDiv, row1CellA);
        api.stopEditing();
        await asyncSetTimeout(0);

        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('A0-EDIT');
        expect(api.getCurrentUndoSize()).toBe(1);

        await new GridRows(api, 'tab-to-next-row after edit committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0-EDIT" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        api.undoCellEditing();
        await asyncSetTimeout(0);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('A0');

        expect(api.getCurrentUndoSize()).toBe(0);

        await new GridRows(api, 'tab-to-next-row after undo').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        api.redoCellEditing();
        await asyncSetTimeout(0);
        expect(getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'))).toHaveTextContent('A0-EDIT');
        expect(api.getCurrentUndoSize()).toBe(1);

        await new GridRows(api, 'tab-to-next-row after redo').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0-EDIT" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Editing started/stopped counts include row 0 and row 1 full-row editing lifecycle
        // 1 initial edit + 1 undo + 1 redo = 3 cellValueChanged
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 5,
            cellEditingStopped: 5,
            cellValueChanged: 3,
            rowValueChanged: 1,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        expect(eventTracker.undoCounts).toEqual({
            undoStarted: 1,
            undoEnded: 1,
            redoStarted: 1,
            redoEnded: 1,
        });
    });
});
