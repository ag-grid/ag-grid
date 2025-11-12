import { ClientSideRowModelModule, RowDragModule, RowSelectionModule, UndoRedoEditModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, dragAndDropRow } from '../../test-utils';

const defaultModules = [
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    RowGroupingModule,
    UndoRedoEditModule,
];

describe.each([false, true])(
    'managed row drag with refreshAfterGroupEdit (suppressMoveWhenRowDragging=%s)',
    (suppressMoveWhenRowDragging) => {
        const gridsManager = new TestGridsManager({
            modules: defaultModules,
        });

        beforeEach(() => {
            gridsManager.reset();
        });

        afterEach(() => {
            gridsManager.reset();
        });

        test('moves a row between groups and mutates the row data', async () => {
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'B', value: 'B1' },
                ],
                rowDragManaged: true,
                suppressMoveWhenRowDragging,
                refreshAfterGroupEdit: true,
                groupDefaultExpanded: 1,
                getRowId: (params) => params.data.id,
            };

            const api = gridsManager.createGrid('row-group-edit-basic', gridOptions);

            let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

            gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:3 value:"B1"
            · └── LEAF id:2 value:"A2"
        `);
            expect(api.getRowNode('2')?.data.group).toBe('B');
        });

        test('managed row drag triggers a single model refresh', async () => {
            const modelUpdatedEvents: any[] = [];
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'B', value: 'B1' },
                ],
                rowDragManaged: true,
                suppressMoveWhenRowDragging,
                refreshAfterGroupEdit: true,
                groupDefaultExpanded: 1,
                getRowId: (params) => params.data.id,
            };

            const api = gridsManager.createGrid('row-group-edit-model-updates', gridOptions);
            const modelUpdatedListener = (event: any) => {
                modelUpdatedEvents.push(event);
            };
            api.addEventListener('modelUpdated', modelUpdatedListener);

            await asyncSetTimeout(0);

            const initialRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

            modelUpdatedEvents.length = 0;

            await dragAndDropRow({
                api,
                source: initialRows.getRowHtmlElement('2')!,
                target: initialRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

            await asyncSetTimeout(0);

            const finalRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:3 value:"B1"
            · └── LEAF id:2 value:"A2"
        `);

            expect(api.getRowNode('2')?.data.group).toBe('B');
            expect(modelUpdatedEvents).toHaveLength(1);

            api.removeEventListener('modelUpdated', modelUpdatedListener);
        });

        test('emits cellEditRequest instead of mutating data when readOnlyEdit=true', async () => {
            const cellEditRequests: any[] = [];
            let commitOnEdit = false;
            const onCellEditRequest = (event: any) => {
                cellEditRequests.push(event);
                if (commitOnEdit) {
                    const updatedData = {
                        ...event.node.data,
                        [event.column.getColId()]: event.newValue,
                    };
                    event.api.applyTransaction({ update: [updatedData] });
                }
            };
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'B', value: 'B1' },
                ],
                readOnlyEdit: true,
                rowDragManaged: true,
                suppressMoveWhenRowDragging,
                refreshAfterGroupEdit: true,
                groupDefaultExpanded: 1,
                getRowId: (params) => params.data.id,
                onCellEditRequest,
            };

            const api = gridsManager.createGrid('row-group-edit-readonly', gridOptions);

            let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

            await asyncSetTimeout(0);

            gridRows = new GridRows(api, 'after move attempt', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

            expect(api.getRowNode('2')?.data.group).toBe('A');
            expect(cellEditRequests.length).toBe(1);
            const firstEvent = cellEditRequests[0];
            expect(firstEvent.column.getColId()).toBe('group');
            expect(firstEvent.oldValue).toBe('A');
            expect(firstEvent.newValue).toBe('B');

            commitOnEdit = true;

            gridRows = new GridRows(api, 'before committed move', { checkDom: true, columns: ['value'] });
            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

            await asyncSetTimeout(0);

            gridRows = new GridRows(api, 'after committed move', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:3 value:"B1"
            · └── LEAF id:2 value:"A2"
        `);

            expect(api.getRowNode('2')?.data.group).toBe('B');
            expect(cellEditRequests.length).toBe(2);
            const secondEvent = cellEditRequests[1];
            expect(secondEvent.column.getColId()).toBe('group');
            expect(secondEvent.oldValue).toBe('A');
            expect(secondEvent.newValue).toBe('B');
        });

        test('moving a multi-row selection updates every row that moved', async () => {
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'A', value: 'A3' },
                    { id: '4', group: 'B', value: 'B1' },
                    { id: '5', group: 'B', value: 'B2' },
                ],
                rowSelection: { mode: 'multiRow' },
                rowDragManaged: true,
                rowDragMultiRow: true,
                suppressMoveWhenRowDragging,
                refreshAfterGroupEdit: true,
                groupDefaultExpanded: 1,
                getRowId: (params) => params.data.id,
            };

            const api = gridsManager.createGrid('row-group-edit-multi', gridOptions);

            api.setNodesSelected({
                nodes: [api.getRowNode('1')!, api.getRowNode('2')!],
                newValue: true,
            });

            let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF selected id:1 value:"A1"
            │ ├── LEAF selected id:2 value:"A2"
            │ └── LEAF id:3 value:"A3"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:4 value:"B1"
            · └── LEAF id:5 value:"B2"
        `);

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('1')!,
                target: gridRows.getRowHtmlElement('4')!,
                targetYOffsetPercent: 0.8,
            });

            gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:3 value:"A3"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:4 value:"B1"
            · ├── LEAF selected id:1 value:"A1"
            · ├── LEAF selected id:2 value:"A2"
            · └── LEAF id:5 value:"B2"
        `);

            expect(api.getRowNode('1')?.data.group).toBe('B');
            expect(api.getRowNode('2')?.data.group).toBe('B');
        });

        test('newParent is exposed to validators and row drag events', async () => {
            const validatorParents: Array<string | null> = [];
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'B', value: 'B1' },
                ],
                rowDragManaged: true,
                suppressMoveWhenRowDragging,
                refreshAfterGroupEdit: true,
                groupDefaultExpanded: 1,
                getRowId: (params) => params.data.id,
                isRowValidDropPosition: (rowsDrop) => {
                    validatorParents.push(rowsDrop.newParent?.id ?? null);
                    return true;
                },
            };

            const api = gridsManager.createGrid('row-group-edit-new-parent', gridOptions);

            const { rowDragMoveEvents, rowDragEndEvents } = await dragAndDropRow({
                api,
                source: '2',
                target: '3',
                targetYOffsetPercent: 0.2,
            });

            expect(validatorParents).toContain('row-group-group-B');
            expect(rowDragMoveEvents.some((event) => event.rowsDrop?.newParent?.id === 'row-group-group-B')).toBe(true);
            expect(rowDragEndEvents[0].rowsDrop?.newParent?.id).toBe('row-group-group-B');
        });

        test('refreshAfterGroupEdit=false blocks cross-group moves', async () => {
            const gridOptions: GridOptions = {
                animateRows: true,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', rowDrag: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [
                    { id: '1', group: 'A', value: 'A1' },
                    { id: '2', group: 'A', value: 'A2' },
                    { id: '3', group: 'B', value: 'B1' },
                ],
                rowDragManaged: true,
                suppressMoveWhenRowDragging,
                getRowId: (params) => params.data.id,
            };

            const api = gridsManager.createGrid('row-group-reorder', gridOptions);

            const initialRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-group-A
            │ ├── LEAF hidden id:1 value:"A1"
            │ └── LEAF hidden id:2 value:"A2"
            └─┬ LEAF_GROUP collapsed id:row-group-group-B
            · └── LEAF hidden id:3 value:"B1"
        `);

            const result = await dragAndDropRow({
                api,
                source: initialRows.getRowHtmlElement('2')!,
                target: initialRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

            const finalRows = new GridRows(api, 'final', { checkDom: true, columns: ['value'] });
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-group-A
            │ ├── LEAF hidden id:1 value:"A1"
            │ └── LEAF hidden id:2 value:"A2"
            └─┬ LEAF_GROUP collapsed id:row-group-group-B
            · └── LEAF hidden id:3 value:"B1"
        `);

            expect(api.getRowNode('2')?.data.group).toBe('A');
            expect(result.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(false);
        });
    }
);
