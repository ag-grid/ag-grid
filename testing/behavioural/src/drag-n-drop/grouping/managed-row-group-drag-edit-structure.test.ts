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

describe.each([false, true])('drag structural moves (suppress move %s)', (suppressMoveWhenRowDragging) => {
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

    test('moving a grouped node reassigns all descendant group keys', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'level1', rowGroup: true, hide: true },
                { field: 'level2', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Levels' },
            rowData: [
                { id: 'a1', level1: 'Alpha', level2: 'A', value: 'A1' },
                { id: 'a2', level1: 'Alpha', level2: 'A', value: 'A2' },
                { id: 'b1', level1: 'Beta', level2: 'B', value: 'B1' },
                { id: 'b2', level1: 'Beta', level2: 'B', value: 'B2' },
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-descendant-update', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-A
            │ · ├── LEAF id:a1 value:"A1"
            │ · └── LEAF id:a2 value:"A2"
            └─┬ filler id:row-group-level1-Beta
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-B
            · · ├── LEAF id:b1 value:"B1"
            · · └── LEAF id:b2 value:"B2"
        `);

        const alphaGroupHandle = gridRows.getRowHtmlElement('row-group-level1-Alpha-level2-A');
        const betaGroupHandle = gridRows.getRowHtmlElement('row-group-level1-Beta-level2-B');
        expect(alphaGroupHandle).toBeTruthy();
        expect(betaGroupHandle).toBeTruthy();

        await dragAndDropRow({
            api,
            source: alphaGroupHandle!,
            target: betaGroupHandle!,
            targetYOffsetPercent: 0.2,
        });

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-B
            · │ ├── LEAF id:b1 value:"B1"
            · │ └── LEAF id:b2 value:"B2"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-A
            · · ├── LEAF id:a1 value:"A1"
            · · └── LEAF id:a2 value:"A2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Beta');
        expect(api.getRowNode('a1')?.data.level2).toBe('A');
        expect(api.getRowNode('a2')?.data.level1).toBe('Beta');
        expect(api.getRowNode('a2')?.data.level2).toBe('A');
        expect(api.getRowNode('b1')?.data.level1).toBe('Beta');
        expect(api.getRowNode('b1')?.data.level2).toBe('B');
        expect(api.getRowNode('b2')?.data.level1).toBe('Beta');
        expect(api.getRowNode('b2')?.data.level2).toBe('B');
    });

    test('reordering root level groups is allowed', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-root-reorder', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const betaGroup = gridRows.getRowHtmlElement('row-group-level1-Beta');
        const alphaGroup = gridRows.getRowHtmlElement('row-group-level1-Alpha');
        expect(betaGroup).toBeTruthy();
        expect(alphaGroup).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: betaGroup!,
            target: alphaGroup!,
            targetYOffsetPercent: 0.25,
        });

        await asyncSetTimeout(0);

        const lastDropInfo = dragResult.rowDragEndEvents.at(-1);
        expect(lastDropInfo?.rowsDrop?.allowed).toBe(true);
        expect(lastDropInfo?.rowsDrop?.target?.id).toBe('row-group-level1-Alpha');
        expect(lastDropInfo?.rowsDrop?.rows.length).toBe(1);

        gridRows = new GridRows(api, 'after reorder', { checkDom: true, columns: ['value'] });
        // TODO: the order here is not correct, need to fix GroupStrategy
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);
    });

    test('dragging a level 1 group into a different level 2 group updates all descendants', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-reassign-level1-into-level2', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const alphaGroup = gridRows.getRowHtmlElement('row-group-level1-Alpha');
        const betaLevel2Group = gridRows.getRowHtmlElement('row-group-level1-Beta-level2-Three');
        expect(alphaGroup).toBeTruthy();
        expect(betaLevel2Group).toBeTruthy();

        await dragAndDropRow({
            api,
            source: alphaGroup!,
            target: betaLevel2Group!,
            targetYOffsetPercent: 0.55,
        });

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ ├── LEAF id:b1 value:"Beta-1"
            · │ ├── LEAF id:a1 value:"Alpha-1"
            · │ └── LEAF id:a2 value:"Alpha-2"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Beta');
        expect(api.getRowNode('a1')?.data.level2).toBe('Three');
        expect(api.getRowNode('a2')?.data.level1).toBe('Beta');
        expect(api.getRowNode('a2')?.data.level2).toBe('Three');
    });

    test('dragging a group onto its parent does nothing', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-disallow-parent-drop', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const alphaGroup = gridRows.getRowHtmlElement('row-group-level1-Alpha-level2-One');
        const alphaParent = gridRows.getRowHtmlElement('row-group-level1-Alpha');
        expect(alphaGroup).toBeTruthy();
        expect(alphaParent).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: alphaGroup!,
            target: alphaParent!,
            targetYOffsetPercent: 0.85,
        });

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after invalid move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Alpha');
        expect(api.getRowNode('a1')?.data.level2).toBe('One');
        expect(api.getRowNode('a2')?.data.level1).toBe('Alpha');
        expect(api.getRowNode('a2')?.data.level2).toBe('Two');
        expect(api.getRowNode('b1')?.data.level1).toBe('Beta');
        expect(api.getRowNode('b2')?.data.level1).toBe('Beta');
        expect(dragResult.rowDragMoveEvents.length).toBeGreaterThan(0);
        const lastMoveEvent = dragResult.rowDragMoveEvents[dragResult.rowDragMoveEvents.length - 1];
        expect(lastMoveEvent.rowsDrop?.position).not.toBe('inside');
        if (suppressMoveWhenRowDragging) {
            expect(lastMoveEvent.rowsDrop?.allowed).toBe(false);
        }
        expect(lastMoveEvent.rowsDrop?.rows?.length).toBe(0);
        expect(dragResult.rowDragEndEvents?.length).toBe(1);
    });

    test('dropping at the lower edge of a parent reorders siblings', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-reorder-with-parent-edge', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · · └── LEAF id:b1 value:"Beta-1"
        `);

        const alphaParent = gridRows.getRowHtmlElement('row-group-level1-Alpha');
        const firstChild = gridRows.getRowHtmlElement('a1');
        expect(alphaParent).toBeTruthy();
        expect(firstChild).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: firstChild!,
            target: alphaParent!,
            targetYOffsetPercent: 0.95,
        });

        await asyncSetTimeout(0);

        const dropInfo = dragResult.rowDragEndEvents[0]?.rowsDrop;
        expect(dropInfo?.allowed).toBe(true);
        expect(dropInfo?.rows?.length).toBeGreaterThan(0);
        expect(dropInfo?.overNode?.id).toBe('row-group-level1-Alpha');
        expect(dropInfo?.position).toBe('above');
        expect(dropInfo?.target?.id).toBe('row-group-level1-Alpha-level2-One');

        gridRows = new GridRows(api, 'after reorder', { checkDom: true, columns: ['value'] });
        // TODO: the order here is not correct, need to fix GroupStrategy
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · · └── LEAF id:b1 value:"Beta-1"
        `);
    });

    test('dragging a row near a parent without entering it is disallowed', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-disallow-parent-row-drop', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const alphaRow = gridRows.getRowHtmlElement('a1');
        const betaParent = gridRows.getRowHtmlElement('row-group-level1-Beta');
        expect(alphaRow).toBeTruthy();
        expect(betaParent).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: alphaRow!,
            target: betaParent!,
            targetYOffsetPercent: 0.05,
        });

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after invalid move', { checkDom: true, columns: ['value'] });
        expect(dragResult.rowDragMoveEvents.length).toBeGreaterThan(0);
        const lastMoveEvent = dragResult.rowDragMoveEvents[dragResult.rowDragMoveEvents.length - 1];
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Alpha');
        expect(api.getRowNode('a1')?.data.level2).toBe('One');
        expect(lastMoveEvent.rowsDrop?.position).not.toBe('inside');
        if (suppressMoveWhenRowDragging) {
            expect(lastMoveEvent.rowsDrop?.allowed).toBe(false);
        }
        expect(lastMoveEvent.rowsDrop?.rows?.length).toBe(0);
        expect(dragResult.rowDragEndEvents?.length).toBe(1);
    });

    test('dragging a child group between shallower groups is disallowed', async () => {
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
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-disallow-deeper-to-shallow', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const sourceGroup = gridRows.getRowHtmlElement('row-group-level1-Alpha-level2-One');
        const targetGroup = gridRows.getRowHtmlElement('row-group-level1-Beta');
        expect(sourceGroup).toBeTruthy();
        expect(targetGroup).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: sourceGroup!,
            target: targetGroup!,
            targetYOffsetPercent: 0.05,
        });

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after invalid move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Alpha
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One
            │ │ └── LEAF id:a1 value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two
            │ · └── LEAF id:a2 value:"Alpha-2"
            └─┬ filler id:row-group-level1-Beta
            · ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three
            · │ └── LEAF id:b1 value:"Beta-1"
            · └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four
            · · └── LEAF id:b2 value:"Beta-2"
        `);

        const lastMoveEvent = dragResult.rowDragMoveEvents[dragResult.rowDragMoveEvents.length - 1];
        if (suppressMoveWhenRowDragging) {
            expect(lastMoveEvent.rowsDrop?.allowed).toBe(false);
        }
        expect(lastMoveEvent.rowsDrop?.rows?.length).toBe(0);
        expect(api.getRowNode('a1')?.parent?.id).toBe('row-group-level1-Alpha-level2-One');
    });
});
