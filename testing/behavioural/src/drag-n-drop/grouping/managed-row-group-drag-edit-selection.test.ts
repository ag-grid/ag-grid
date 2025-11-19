import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, dragAndDropRow } from '../../test-utils';

describe.each([false, true])('drag selection flows (suppress move %s)', (suppressMoveWhenRowDragging) => {
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

    test('multi-selection with groups moves all descendants to the drop target', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'level1', rowGroup: true, hide: true },
                { field: 'level2', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Levels' },
            rowData: [
                { id: 'a1', level1: 'Alpha', level2: 'One', value: 'Alpha-1' },
                { id: 'a2', level1: 'Alpha', level2: 'Two', value: 'Alpha-2' },
                { id: 'b1', level1: 'Beta', level2: 'Three', value: 'Beta-1' },
                { id: 'b2', level1: 'Beta', level2: 'Four', value: 'Beta-2' },
                { id: 'c1', level1: 'Gamma', level2: 'Five', value: 'Gamma-1' },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('row-group-edit-group-multi', gridOptions);

        let groupAlpha: any;
        let leafAlpha: any;
        let leafBeta: any;
        api.forEachNode((node) => {
            if (node.group && node.level === 0 && node.key === 'Alpha') {
                groupAlpha = node;
            } else if (!node.group && node.data?.id === 'a1') {
                leafAlpha = node;
            } else if (!node.group && node.data?.id === 'b2') {
                leafBeta = node;
            }
        });

        expect(groupAlpha).toBeTruthy();
        expect(leafAlpha).toBeTruthy();
        expect(leafBeta).toBeTruthy();

        api.setNodesSelected({
            nodes: [groupAlpha, leafAlpha, leafBeta],
            newValue: true,
        });

        await asyncSetTimeout(0);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler selected id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF selected id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            ├─┬ filler id:row-group-level1-Beta
            │ ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            │ │ └── LEAF id:b1 value:"Beta-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            │ · └── LEAF selected id:b2 value:"Beta-2"
            └─┬ filler id:row-group-level1-Gamma
            · └─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Five
            · · └── LEAF id:c1 value:"Gamma-1"
        `);

        const alphaGroupEl = gridRows.getRowHtmlElement('row-group-level1-Alpha');
        const gammaGroupEl = gridRows.getRowHtmlElement('row-group-level1-Gamma');
        expect(alphaGroupEl).toBeTruthy();
        expect(gammaGroupEl).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: gridRows.getRowHtmlElement('a1')!,
            target: gammaGroupEl!,
            targetYOffsetPercent: 0.5,
        });

        expect(dragResult.error).toBeNull();
        expect(dragResult.rowDragCancelEvents?.length).toBe(0);
        const draggedIds = dragResult.rowDragEndEvents[0]?.nodes?.map((node) => node.id) ?? [];
        expect(draggedIds.length).toBeGreaterThan(0);
        expect(draggedIds).toContain('row-group-level1-Alpha');

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Beta
            │ └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            │ · └── LEAF id:b1 value:"Beta-1"
            └─┬ filler id:row-group-level1-Gamma
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Five
            · │ └── LEAF id:c1 value:"Gamma-1"
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-One
            · │ └── LEAF selected id:a1 value:"Alpha-1"
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Two
            · │ └── LEAF id:a2 value:"Alpha-2"
            · └─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Four
            · · └── LEAF selected id:b2 value:"Beta-2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('a2')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('b2')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('b1')?.data.level1).toBe('Beta');
    });
});
