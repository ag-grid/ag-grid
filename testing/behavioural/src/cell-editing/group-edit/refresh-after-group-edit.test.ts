import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule, PinnedRowModule, TextEditorModule, UndoRedoEditModule } from 'ag-grid-community';
import type { GridOptions, RowNode } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

describe('cell editing with refreshAfterGroupEdit', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextEditorModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            BatchEditModule,
            UndoRedoEditModule,
            PinnedRowModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('editing a row group column moves the row into the matching group', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'group', rowGroup: true, editable: true }, { field: 'value' }],
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group', gridOptions);

        const snapshot = () => {
            const order: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                order.push(node.group ? `GROUP:${node.key}` : `ROW:${node.id}`);
            });
            return order;
        };

        expect(snapshot()).toEqual(['GROUP:A', 'ROW:1', 'ROW:2', 'GROUP:B', 'ROW:3']);

        const rowNode = api.getRowNode('2');
        expect(rowNode).toBeDefined();
        rowNode!.setDataValue('group', 'B');

        await asyncSetTimeout(2);

        // Note - we are following _leafs order after the refresh
        expect(snapshot()).toEqual(['GROUP:A', 'ROW:1', 'GROUP:B', 'ROW:2', 'ROW:3']);

        expect(api.getRowNode('2')?.parent?.key).toBe('B');
        expect(api.getRowNode('1')?.parent?.key).toBe('A');

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── group "Group" width:200 rowGroup editable
            └── value "Value" width:200
        `);
    });

    test('batch editing grouped column refreshes model once', async () => {
        const modelUpdatedEvents: any[] = [];
        const batchStoppedEvents: any[] = [];
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'group', rowGroup: true, editable: true }, { field: 'value' }],
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            onBatchEditingStopped: (event) => {
                batchStoppedEvents.push(event);
            },
            onModelUpdated: (event) => {
                modelUpdatedEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-batch', gridOptions);

        await asyncSetTimeout(0);

        modelUpdatedEvents.length = 0;
        batchStoppedEvents.length = 0;

        const initialRows = new GridRows(api, 'initial', {
            nodeDataProps: ['group'],
        });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID data.group:""
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" data.group:""
            │ ├── LEAF id:1 group:"A" value:"A1" data.group:"A"
            │ └── LEAF id:2 group:"A" value:"A2" data.group:"A"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" data.group:""
            · └── LEAF id:3 group:"B" value:"B1" data.group:"B"
        `);

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const editGroupCell = async (rowId: string, value: string) => {
            const cell = gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="group"]`);
            expect(cell).not.toBeNull();

            await userEvent.dblClick(cell!);
            const input = await waitForInput(gridDiv, cell!);
            await userEvent.clear(input);
            await userEvent.type(input, `${value}{Enter}`);
            await asyncSetTimeout(0);
        };

        await editGroupCell('2', 'B');
        await editGroupCell('3', 'A');

        expect(modelUpdatedEvents).toHaveLength(0);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);

        for (let i = 0; i < 10 && batchStoppedEvents.length === 0; i += 1) {
            await asyncSetTimeout(5);
        }

        for (let i = 0; i < 10 && modelUpdatedEvents.length === 0; i += 1) {
            await asyncSetTimeout(5);
        }

        expect(api.getRowNode('2')?.data.group).toBe('B');
        expect(api.getRowNode('3')?.data.group).toBe('A');

        expect(batchStoppedEvents).toHaveLength(1);
        expect(modelUpdatedEvents).toHaveLength(1);
        expect(modelUpdatedEvents[0].animate).toBe(true);
        expect(modelUpdatedEvents[0].keepRenderedRows).toBe(true);
        expect(modelUpdatedEvents[0].newData).toBe(false);
        expect(modelUpdatedEvents[0].newPage).toBe(false);
        expect(modelUpdatedEvents[0].keepUndoRedoStack).toBe(false);

        const finalRows = new GridRows(api, 'after commit', {
            nodeDataProps: ['group'],
        });
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID data.group:""
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" data.group:""
            │ ├── LEAF id:1 group:"A" value:"A1" data.group:"A"
            │ └── LEAF id:3 group:"A" value:"B1" data.group:"A"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" data.group:""
            · └── LEAF id:2 group:"B" value:"A2" data.group:"B"
        `);

        expect(api.getRowNode('2')?.parent?.key).toBe('B');
        expect(api.getRowNode('3')?.parent?.key).toBe('A');

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── group "Group" width:200 rowGroup editable
            └── value "Value" width:200
        `);
    });

    test('aggregation columns refresh when rows move', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: {
                field: 'group',
                cellRendererParams: {
                    suppressDoubleClickExpand: true,
                },
            },
            rowData: [
                { id: '1', group: 'A', value: 10 },
                { id: '2', group: 'A', value: 15 },
                { id: '3', group: 'B', value: 7 },
            ],
            refreshAfterGroupEdit: true,
            undoRedoCellEditing: true,
            enableGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-aggregation', gridOptions);
        await asyncSetTimeout(0);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const editGroupCell = async (rowId: string, value: string) => {
            const cell = gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="group"]`);
            expect(cell).not.toBeNull();

            await userEvent.dblClick(cell!);
            const input = await waitForInput(gridDiv, cell!);
            await userEvent.clear(input);
            await userEvent.type(input, `${value}{Enter}`);
            await asyncSetTimeout(0);
        };

        const initialSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:25
            │ ├── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" value:10
            │ └── LEAF id:2 ag-Grid-AutoColumn:"A" group:"A" value:15
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:7
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" value:7
        `;

        const afterEditSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:10
            │ └── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" value:10
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:22
            · ├── LEAF id:2 ag-Grid-AutoColumn:"B" group:"B" value:15
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" value:7
        `;

        await new GridRows(api, 'aggregation initial', { useFormatter: false }).check(initialSnapshot);

        await editGroupCell('2', 'B');
        await asyncSetTimeout(2);

        await new GridRows(api, 'aggregation after edit', { useFormatter: false }).check(afterEditSnapshot);
    });

    test('valueGetter columns on the destination group refresh after a group edit', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0),
                },
            ],
            autoGroupColumnDef: { field: 'group' },
            rowData: [
                { id: '1', group: 'A', a: 10, b: 20 },
                { id: '2', group: 'A', a: 30, b: 40 },
                { id: '3', group: 'B', a: 5, b: 6 },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-valuegetter', gridOptions);
        await asyncSetTimeout(0);

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:40 b:60 total:100
            │ ├── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" a:10 b:20 total:30
            │ └── LEAF id:2 ag-Grid-AutoColumn:"A" group:"A" a:30 b:40 total:70
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" a:5 b:6 total:11
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" a:5 b:6 total:11
        `);

        api.getRowNode('2')!.setDataValue('group', 'B');
        await asyncSetTimeout(2);

        // After moving row 2 from A → B:
        // - A should now contain only row 1: a=10, b=20, total=30
        // - B should now contain rows 2 and 3: a=35, b=46, total=81
        // Bug: the Total on group B stays at 11 (stale), even though a=35 and b=46 are correct.
        await new GridRows(api, 'after group move', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            │ └── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" a:10 b:20 total:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" a:35 b:46 total:81
            · ├── LEAF id:2 ag-Grid-AutoColumn:"B" group:"B" a:30 b:40 total:70
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" a:5 b:6 total:11
        `);

        // Edit row 3's `a` by +1: should only change Total on B by +1 (35→36, total 81→82).
        // Bug-cascade symptom: if the previous step left B's Total stale at 11, a subsequent
        // edit causes Total to jump by (missed group-move delta) + 1 instead of just +1.
        api.getRowNode('3')!.setDataValue('a', 6);
        await asyncSetTimeout(2);

        await new GridRows(api, 'after value edit', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            │ └── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" a:10 b:20 total:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" a:36 b:46 total:82
            · ├── LEAF id:2 ag-Grid-AutoColumn:"B" group:"B" a:30 b:40 total:70
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" a:6 b:6 total:12
        `);
    });

    test('valueGetter columns on both source and destination groups refresh after batched group edits', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0),
                },
            ],
            autoGroupColumnDef: { field: 'group' },
            rowData: [
                { id: '1', group: 'A', a: 10, b: 20 },
                { id: '2', group: 'A', a: 30, b: 40 },
                { id: '3', group: 'B', a: 5, b: 6 },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-valuegetter-batch', gridOptions);
        await asyncSetTimeout(0);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const editGroupCell = async (rowId: string, value: string) => {
            const cell = gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="group"]`);
            expect(cell).not.toBeNull();
            await userEvent.dblClick(cell!);
            const input = await waitForInput(gridDiv, cell!);
            await userEvent.clear(input);
            await userEvent.type(input, `${value}{Enter}`);
            await asyncSetTimeout(0);
        };

        api.startBatchEdit();
        await editGroupCell('2', 'B');
        api.commitBatchEdit();
        await asyncSetTimeout(5);

        // After batched move of row 2 from A → B, both groups' valueGetter Totals must reflect
        // the post-regroup aggregates: A loses row 2 (total 100 → 30), B gains it (total 11 → 81).
        await new GridRows(api, 'after batch group move', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            │ └── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" a:10 b:20 total:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" a:35 b:46 total:81
            · ├── LEAF id:2 ag-Grid-AutoColumn:"B" group:"B" a:30 b:40 total:70
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" a:5 b:6 total:11
        `);
    });

    test('valueGetter columns refresh after a user-initiated refreshClientSideRowModel call', async () => {
        // Simulates a user that has refreshAfterGroupEdit disabled and triggers regrouping
        // themselves (e.g. via `cellEditingStopped` → `api.refreshClientSideRowModel('group')`).
        // The aggregation-pipeline fix must cover this path too, not just the groupEditService one.
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0),
                },
            ],
            autoGroupColumnDef: { field: 'group' },
            rowData: [
                { id: '1', group: 'A', a: 10, b: 20 },
                { id: '2', group: 'A', a: 30, b: 40 },
                { id: '3', group: 'B', a: 5, b: 6 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-valuegetter-manual', gridOptions);
        await asyncSetTimeout(0);

        // Edit through the normal path (cellValueChanged fires → leaf + old parent refresh via
        // ChangeDetectionService) but without refreshAfterGroupEdit, then drive regrouping
        // ourselves — the destination group's valueGetter cells must still refresh.
        api.getRowNode('2')!.setDataValue('group', 'B');
        api.refreshClientSideRowModel('group');
        await asyncSetTimeout(2);

        await new GridRows(api, 'after manual refresh', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            │ └── LEAF id:1 ag-Grid-AutoColumn:"A" group:"A" a:10 b:20 total:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" a:35 b:46 total:81
            · ├── LEAF id:2 ag-Grid-AutoColumn:"B" group:"B" a:30 b:40 total:70
            · └── LEAF id:3 ag-Grid-AutoColumn:"B" group:"B" a:5 b:6 total:11
        `);
    });

    // Regression for the sibling-OR branch in setAggDataWithSiblings: when the primary group row
    // is not rendered (no `__localEventService`) but a sibling row is, the sibling's valueGetter
    // cell must still refresh. Pinned siblings always render to a fixed area, so they stay visible
    // even when the primary scrolls out of view; jsdom can't virtualize, so the test clears the
    // primary's local event service to simulate the unrendered primary.
    test('valueGetter cell on a pinned sibling refreshes when only the sibling has rendered listeners', async () => {
        const gridOptions: GridOptions = {
            enableRowPinning: true,
            isRowPinned: (node) => (node.group && node.key === 'B' ? 'top' : null),
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true, hide: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0),
                },
            ],
            autoGroupColumnDef: { field: 'group' },
            rowData: [
                { id: '1', group: 'A', a: 10, b: 20 },
                { id: '2', group: 'A', a: 30, b: 40 },
                { id: '3', group: 'B', a: 5, b: 6 },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('refresh-pinned-sibling-valuegetter', gridOptions);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;

        const pinnedTotalCell = () =>
            gridDiv
                .querySelector<HTMLElement>('[row-id="t-top-row-group-group-B"]')!
                .querySelector<HTMLElement>('[col-id="total"]')!;

        expect(pinnedTotalCell().textContent).toBe('11');

        // Simulate the primary group B being off-viewport: cell controllers have been destroyed
        // and removed all their listeners, so `__localEventService` is null on the primary while
        // the pinned sibling (always in the pinned area) still has its listeners.
        const primaryB = api.getRowNode('row-group-group-B') as RowNode;
        const pinnedB = primaryB.pinnedSibling as RowNode;
        expect(pinnedB).toBeDefined();
        expect(pinnedB.__localEventService).not.toBeNull();
        primaryB.__localEventService = null;

        // Move row 2 from A → B. Group B is the destination, so it isn't in the cellValueChanged
        // path; without the OR fix, setAggDataWithSiblings returns the primary's `false` and
        // addRow(B) is never called, leaving the pinned sibling's valueGetter cell stale at 11.
        api.getRowNode('2')!.setDataValue('group', 'B');
        await asyncSetTimeout(2);

        expect(pinnedTotalCell().textContent).toBe('81');
    });

    // Guards against double aggregation: refreshModel + onPropChange wrap the pipeline in
    // beginDeferred/endDeferred, so the post-pipeline endDeferred flush must NOT re-invoke
    // aggStage when nothing fired `cellValueChanged` during the pipeline.
    test('refreshModel and onPropChange invoke aggStage exactly once per group', async () => {
        let aggCallCount = 0;
        const countingSum = (params: { values: any[] }) => {
            aggCallCount++;
            let sum = 0;
            for (const v of params.values) {
                if (typeof v === 'number') {
                    sum += v;
                }
            }
            return sum;
        };

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: countingSum },
                { field: 'b', aggFunc: countingSum },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0),
                },
            ],
            rowData: [
                { id: '1', group: 'A', a: 10, b: 20 },
                { id: '2', group: 'B', a: 30, b: 40 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('agg-call-count', gridOptions);
        await asyncSetTimeout(0);

        // 2 groups × 2 aggregate columns = 4 calls. Asserts single pass.
        expect(aggCallCount).toBe(4);

        // Edit a leaf — should re-aggregate only the affected group (A) for both columns.
        aggCallCount = 0;
        api.getRowNode('1')!.setDataValue('a', 100);
        await asyncSetTimeout(2);
        expect(aggCallCount).toBe(2);

        // refreshClientSideRowModel('aggregate') re-aggregates both groups exactly once.
        aggCallCount = 0;
        api.refreshClientSideRowModel('aggregate');
        await asyncSetTimeout(2);
        expect(aggCallCount).toBe(4);

        // A prop change that triggers a full refresh — still one pass per group/column.
        aggCallCount = 0;
        api.setGridOption('groupDefaultExpanded', 0);
        await asyncSetTimeout(2);
        expect(aggCallCount).toBe(4);
    });
});
