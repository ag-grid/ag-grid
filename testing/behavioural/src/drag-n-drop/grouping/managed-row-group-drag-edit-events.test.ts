import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, dragAndDropRow } from '../../test-utils';

describe.each([false, true])('drag events (suppress move %s)', (suppressMoveWhenRowDragging) => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowDragModule,
            RowSelectionModule,
            RowGroupingModule,
            UndoRedoEditModule,
            BatchEditModule,
            TextEditorModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
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
});
