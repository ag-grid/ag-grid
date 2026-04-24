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
} from '../../test-utils';

describe('Cell Editing: bulk edit', () => {
    const gridMgr = new TestGridsManager({
        modules: [CellSelectionModule, BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each([false, true])('bulk edit (Ctrl+Enter) updates once per cell (batch=%s)', async (batchEnabled) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: any;
            colDef: { field?: string };
        }) => {
            valueSetterCalls += 1;
            if (colDef.field) {
                valueSetterTargets.push(`${data.id}:${colDef.field}`);
                data[colDef.field as 'a' | 'b'] = newValue;
            }
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingBulk-${batchEnabled}`, {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                { field: 'a', editable: true, valueSetter },
                { field: 'b', editable: true, valueSetter },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, `before bulk edit (batch=${batchEnabled})`);
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Bulk Value');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after bulk edit (batch=${batchEnabled})`);
        await afterRows.check(
            batchEnabled
                ? `
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"Bulk Value" "A0" b:⏳"Bulk Value" "B0"
            └── LEAF ⏳ id:ROW_1 a:⏳"Bulk Value" "A1" b:⏳"Bulk Value" "B1"
        `
                : `
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Bulk Value" b:"Bulk Value"
            └── LEAF id:ROW_1 a:"Bulk Value" b:"Bulk Value"
        `
        );

        if (batchEnabled) {
            expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(0)?.data?.b).toBe('B0');
            expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('A1');
            expect(api.getDisplayedRowAtIndex(1)?.data?.b).toBe('B1');
            api.commitBatchEdit();
            await asyncSetTimeout(0);

            await new GridRows(api, `after batch commit (batch=${batchEnabled})`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 a:"Bulk Value" b:"Bulk Value"
                └── LEAF id:ROW_1 a:"Bulk Value" b:"Bulk Value"
            `);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: batchEnabled ? 0 : 1,
            bulkEditingStopped: batchEnabled ? 0 : 1,
            batchEditingStarted: batchEnabled ? 1 : 0,
            batchEditingStopped: batchEnabled ? 1 : 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(0)?.data?.b).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(1)?.data?.b).toBe('Bulk Value');
        expect(valueSetterTargets).toEqual(['ROW_0:a', 'ROW_0:b', 'ROW_1:a', 'ROW_1:b']);
        expect(valueSetterCalls).toBe(4);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('bulk edit skips non-editable cells', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: any;
            colDef: { field?: string };
        }) => {
            valueSetterCalls += 1;
            if (colDef.field) {
                valueSetterTargets.push(`${data.id}:${colDef.field}`);
                data[colDef.field as 'a' | 'b'] = newValue;
            }
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingBulkSkipNonEditable', {
            cellSelection: true,
            columnDefs: [
                { field: 'a', editable: true, valueSetter },
                { field: 'b', editable: (params) => params.data.id !== 'ROW_1', valueSetter },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before bulk edit skip non-editable');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Bulk Value');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        // ROW_1:b should not be updated because it's not editable
        const afterRows = new GridRows(api, 'after bulk edit skip non-editable');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Bulk Value" b:"Bulk Value"
            └── LEAF id:ROW_1 a:"Bulk Value" b:"B1"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 3,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 1,
            bulkEditingStopped: 1,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        expect(valueSetterTargets).toEqual(['ROW_0:a', 'ROW_0:b', 'ROW_1:a']);
        expect(valueSetterCalls).toBe(3);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200
        `);
    });

    test('bulk edit with single cell range updates only that cell', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: any;
            colDef: { field?: string };
        }) => {
            valueSetterCalls += 1;
            if (colDef.field) {
                valueSetterTargets.push(`${data.id}:${colDef.field}`);
                data[colDef.field as 'a' | 'b'] = newValue;
            }
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingBulkSingleCell', {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                { field: 'a', valueSetter },
                { field: 'b', valueSetter },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before bulk edit single cell');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        // Add a single cell range for just this cell
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Single Value');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, 'after bulk edit single cell');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Single Value" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 1,
            bulkEditingStopped: 1,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        expect(valueSetterTargets).toEqual(['ROW_0:a']);
        expect(valueSetterCalls).toBe(1);
    });

    test('Ctrl+Enter without cell range does not trigger bulk edit', async () => {
        const api = await gridMgr.createGridAndWait('cellEditingBulkNoRange', {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before Ctrl+Enter no range');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.clearCellSelection(); // Clear any selection
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'New Value');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        // Without a range, Ctrl+Enter should not trigger bulk edit events
        expect(eventTracker.counts.bulkEditingStarted).toBe(0);
        expect(eventTracker.counts.bulkEditingStopped).toBe(0);
        // The cell should still be in editing mode (normal Enter behaviour not triggered)
        expect(eventTracker.counts.cellEditingStarted).toBe(1);
    });

    test('bulk edit updates cells in row then column order', async () => {
        const updateOrder: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string; c: string };
            newValue: any;
            colDef: { field?: string };
        }) => {
            if (colDef.field) {
                updateOrder.push(`${data.id}:${colDef.field}`);
                data[colDef.field as 'a' | 'b' | 'c'] = newValue;
            }
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingBulkColumnOrder', {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                { field: 'a', valueSetter },
                { field: 'b', valueSetter },
                { field: 'c', valueSetter },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0', c: 'C0' },
                { id: 'ROW_1', a: 'A1', b: 'B1', c: 'C1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before bulk edit column order');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0" c:"C0"
            └── LEAF id:ROW_1 a:"A1" b:"B1" c:"C1"
        `);

        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b', 'c'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'X');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, 'after bulk edit column order');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"X" b:"X" c:"X"
            └── LEAF id:ROW_1 a:"X" b:"X" c:"X"
        `);

        expect(eventTracker.counts.bulkEditingStarted).toBe(1);
        expect(eventTracker.counts.bulkEditingStopped).toBe(1);

        // Should update in row order, then column order within each row
        expect(updateOrder).toEqual(['ROW_0:a', 'ROW_0:b', 'ROW_0:c', 'ROW_1:a', 'ROW_1:b', 'ROW_1:c']);
    });
});
