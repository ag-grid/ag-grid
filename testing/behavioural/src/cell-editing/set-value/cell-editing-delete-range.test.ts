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

describe('Cell Editing: delete and range clearing', () => {
    const gridMgr = new TestGridsManager({
        modules: [CellSelectionModule, BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each([false, true])('delete key uses cellClear once (batch=%s)', async (batchEnabled) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingCellClear-${batchEnabled}`, {
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

        const beforeRows = new GridRows(api, `before cellClear delete (batch=${batchEnabled})`);
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        await user.click(cell);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after cellClear delete (batch=${batchEnabled})`);
        await afterRows.check(
            batchEnabled
                ? `
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:ROW_0 field:⏳null "Initial Value"
        `
                : `
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:null
        `
        );

        const rowNode = api.getDisplayedRowAtIndex(0);
        if (batchEnabled) {
            expect(rowNode?.data?.field).toBe('Initial Value');
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: batchEnabled ? 1 : 0,
            batchEditingStopped: batchEnabled ? 1 : 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field ?? null).toBeNull();
        expect(valueSetterTargets).toEqual(['ROW_0']);
        expect(valueSetterCalls).toBe(1);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── field "Field" width:200 editable
        `);
    });

    test.each([
        [false, 'Delete', '{Delete}'],
        [true, 'Delete', '{Delete}'],
        [false, 'Backspace', '{Backspace}'],
        [true, 'Backspace', '{Backspace}'],
    ])('suppressKeyboardEvent prevents cellClear for %s (batch=%s)', async (batchEnabled, key, keyEvent) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingSuppress-${key}-${batchEnabled}`, {
            defaultColDef: {
                editable: true,
                suppressKeyboardEvent: (params) => params.event?.key === key,
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

        const beforeRows = new GridRows(api, `before suppress ${key} (batch=${batchEnabled})`);
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        await user.click(cell);
        await user.keyboard(keyEvent);
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after suppress ${key} (batch=${batchEnabled})`);
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        if (batchEnabled) {
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Initial Value');
        expect(valueSetterTargets).toEqual([]);
        expect(valueSetterCalls).toBe(0);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── field "Field" width:200 editable
        `);
    });

    test.each([false, true])('delete key uses rangeSvc once per cell (batch=%s)', async (batchEnabled) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingRangeClear-${batchEnabled}`, {
            cellSelection: true,
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [
                { id: 'ROW_0', field: 'Top Value' },
                { id: 'ROW_1', field: 'Bottom Value' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, `before range delete (batch=${batchEnabled})`);
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            └── LEAF id:ROW_1 field:"Bottom Value"
        `);

        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['field'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after range delete (batch=${batchEnabled})`);
        await afterRows.check(
            batchEnabled
                ? `
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 field:⏳null "Top Value"
            └── LEAF ⏳ id:ROW_1 field:⏳null "Bottom Value"
        `
                : `
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:null
            └── LEAF id:ROW_1 field:null
        `
        );

        if (batchEnabled) {
            expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Top Value');
            expect(api.getDisplayedRowAtIndex(1)?.data?.field).toBe('Bottom Value');
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: batchEnabled ? 1 : 0,
            batchEditingStopped: batchEnabled ? 1 : 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field ?? null).toBeNull();
        expect(api.getDisplayedRowAtIndex(1)?.data?.field ?? null).toBeNull();
        expect(valueSetterTargets).toEqual(['ROW_0', 'ROW_1']);
        expect(valueSetterCalls).toBe(2);
    });

    test.each([false, true])('rangeSvc multi-column delete updates once per cell (batch=%s)', async (batchEnabled) => {
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

        const api = await gridMgr.createGridAndWait(`cellEditingRangeMulti-${batchEnabled}`, {
            cellSelection: true,
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

        const beforeRows = new GridRows(api, `before range multi delete (batch=${batchEnabled})`);
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
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after range multi delete (batch=${batchEnabled})`);
        await afterRows.check(
            batchEnabled
                ? `
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳null "A0" b:⏳null "B0"
            └── LEAF ⏳ id:ROW_1 a:⏳null "A1" b:⏳null "B1"
        `
                : `
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:null b:null
            └── LEAF id:ROW_1 a:null b:null
        `
        );

        if (batchEnabled) {
            expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(0)?.data?.b).toBe('B0');
            expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('A1');
            expect(api.getDisplayedRowAtIndex(1)?.data?.b).toBe('B1');
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: batchEnabled ? 1 : 0,
            batchEditingStopped: batchEnabled ? 1 : 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.a ?? null).toBeNull();
        expect(api.getDisplayedRowAtIndex(0)?.data?.b ?? null).toBeNull();
        expect(api.getDisplayedRowAtIndex(1)?.data?.a ?? null).toBeNull();
        expect(api.getDisplayedRowAtIndex(1)?.data?.b ?? null).toBeNull();
        expect(valueSetterTargets).toEqual(['ROW_0:a', 'ROW_0:b', 'ROW_1:a', 'ROW_1:b']);
        expect(valueSetterCalls).toBe(4);
    });

    test.each([false, true])('open editor + rangeSvc delete keeps editor open (batch=%s)', async (batchEnabled) => {
        const api = await gridMgr.createGridAndWait(`cellEditingOpenRange-${batchEnabled}`, {
            cellSelection: true,
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
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        expect(input).toBeTruthy();

        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        const inputAfterDelete = await waitForInput(gridDiv, cell);
        expect(inputAfterDelete).toBeTruthy();

        if (batchEnabled) {
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }
    });
});
