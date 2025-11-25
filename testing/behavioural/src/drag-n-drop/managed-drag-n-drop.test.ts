import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import type { DragInteractionType, GridRowsOptions } from '../test-utils';
import {
    DRAG_INTERACTION_TYPES,
    DRAG_NO_MOVE_INTERACTION_CASES,
    GridRows,
    TestGridsManager,
    cachedJSONObjects,
    dragAndDropRow,
} from '../test-utils';

describe.each(DRAG_NO_MOVE_INTERACTION_CASES)('managed drag noMove=%s evt=%s', (noMove, eventType) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('drag and drop on the same position does nothing', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'v', rowDrag: true }],
            rowData: [
                { id: '1', v: 1 },
                { id: '2', v: 2 },
                { id: '3', v: 3 },
            ],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        for (let i = 0; i < 4; ++i) {
            const gridRows = new GridRows(api, i.toString(), { checkDom: true, columns: true });
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 v:1
                ├── LEAF id:2 v:2
                └── LEAF id:3 v:3
            `);
            if (i < 3) {
                const el = gridRows.rowsHtmlElements[i];
                await dragAndDropRow({ api, source: el, target: el, eventType });
            }
        }
    });

    test('drag on empty and single-item rowData', async () => {
        // Single item grid
        const api = gridsManager.createGrid('single-grid', {
            columnDefs: [{ field: 'v', rowDrag: true }],
            rowData: [{ id: 'only', v: 1 }],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        });

        let gridRows = new GridRows(api, 'single', { checkDom: true, columns: true });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:only v:1
        `);

        // Try dragging itself
        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[0],
            target: gridRows.rowsHtmlElements[0],
            eventType,
        });

        gridRows = new GridRows(api, 'single-post-drag', { checkDom: true, columns: true });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:only v:1
        `);
    });

    test('drag and drop reorders two rows', async () => {
        const api = gridsManager.createGrid(`event-type-${eventType}`, {
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData: [
                { id: 'row-1', value: 1 },
                { id: 'row-2', value: 2 },
            ],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        });

        const initialRows = new GridRows(api, `${eventType}-initial`, { checkDom: true, columns: ['value'] });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);

        await dragAndDropRow({
            api,
            source: initialRows.rowsHtmlElements[0],
            target: initialRows.rowsHtmlElements[1],
            targetYOffsetPercent: 0.8,
            eventType,
        });

        await new GridRows(api, `${eventType}-after`, { checkDom: true, columns: ['value'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-2 value:2
            └── LEAF id:row-1 value:1
        `);
    });

    test('drag and drop on the same position with multiple selection does nothing', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'v', rowDrag: true }],
            rowData: [
                { id: '1', v: 1 },
                { id: '2', v: 2 },
                { id: '3', v: 3 },
                { id: '4', v: 4 },
                { id: '5', v: 5 },
            ],
            rowDragManaged: true,
            rowDragMultiRow: true,
            rowSelection: { mode: 'multiRow' },
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        api.setNodesSelected({
            nodes: [api.getRowNode('4')!, api.getRowNode('1')!, api.getRowNode('5')!],
            newValue: true,
        });

        for (const index of [null, 0]) {
            // TODO: add 3, 4
            const gridRows = new GridRows(api, 'drag ' + index, { checkDom: true, columns: ['v'] });
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF selected id:1 v:1
                ├── LEAF id:2 v:2
                ├── LEAF id:3 v:3
                ├── LEAF selected id:4 v:4
                └── LEAF selected id:5 v:5
            `);

            if (index !== null) {
                await dragAndDropRow({
                    api,
                    source: gridRows.rowsHtmlElements[index],
                    target: gridRows.rowsHtmlElements[index],
                    targetYOffsetPercent: 0.7,
                    eventType,
                });
            }
        }
    });

    test('drag first row to last position and last to first', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'v', rowDrag: true }],
            rowData: [
                { id: '1', v: 1 },
                { id: '2', v: 2 },
                { id: '3', v: 3 },
                { id: '4', v: 4 },
            ],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('first-last', gridOptions);

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: true });
        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[0],
            target: gridRows.rowsHtmlElements[3],
            eventType,
        });

        gridRows = new GridRows(api, '1 -> end', { checkDom: true, columns: true });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 v:2
            ├── LEAF id:3 v:3
            ├── LEAF id:4 v:4
            └── LEAF id:1 v:1
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[3],
            target: gridRows.rowsHtmlElements[0],
            targetYOffsetPercent: 0.1,
            eventType,
        });

        gridRows = new GridRows(api, '1 back -> start', { checkDom: true, columns: true });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 v:1
            ├── LEAF id:2 v:2
            ├── LEAF id:3 v:3
            └── LEAF id:4 v:4
        `);
    });

    test('drag to adjacent rows (up and down)', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'v', rowDrag: true }],
            rowData: [
                { id: '1', v: 1 },
                { id: '2', v: 2 },
                { id: '3', v: 3 },
            ],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('adjacent', gridOptions);
        const gridRows = new GridRows(api, 'initial', { checkDom: true, columns: true });

        // Move row 2 (index 1) up
        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[1],
            target: gridRows.rowsHtmlElements[0],
            targetYOffsetPercent: 0.1,
            eventType,
        });

        await new GridRows(api, '2 -> top', { checkDom: true, columns: true }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 v:2
            ├── LEAF id:1 v:1
            └── LEAF id:3 v:3
        `);

        // Move row 2 (now index 0) down
        const updatedRows = new GridRows(api, '2 now at 0', { checkDom: true, columns: true });
        await dragAndDropRow({
            api,
            source: updatedRows.rowsHtmlElements[0],
            target: updatedRows.rowsHtmlElements[1],
            targetYOffsetPercent: 0.7,
            eventType,
        });

        await new GridRows(api, '2 back to middle', { checkDom: true, columns: true }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 v:1
            ├── LEAF id:2 v:2
            └── LEAF id:3 v:3
        `);
    });

    test('simple managed rows drag and drop', async () => {
        const rowData = [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 3 },
            { id: '4', value: 4 },
            { id: '5', value: 5 },
        ];

        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData,
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            └── LEAF id:5 value:5
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[1],
            target: gridRows.rowsHtmlElements[3],
            targetYOffsetPercent: 0.7,
            eventType,
        });

        gridRows = new GridRows(api, 'a', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            ├── LEAF id:2 value:2
            └── LEAF id:5 value:5
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[2],
            target: gridRows.rowsHtmlElements[0],
            targetYOffsetPercent: 0.15,
            eventType,
        });

        gridRows = new GridRows(api, 'b', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 value:4
            ├── LEAF id:1 value:1
            ├── LEAF id:3 value:3
            ├── LEAF id:2 value:2
            └── LEAF id:5 value:5
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[4],
            target: gridRows.rowsHtmlElements[2],
            targetYOffsetPercent: 0.1,
            eventType,
        });

        gridRows = new GridRows(api, 'c', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 value:4
            ├── LEAF id:1 value:1
            ├── LEAF id:5 value:5
            ├── LEAF id:3 value:3
            └── LEAF id:2 value:2
        `);
    });

    test('multiple selection drag and drop with rowDragMultiRow=true', async () => {
        const rowData = [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 3 },
            { id: '4', value: 4 },
            { id: '5', value: 5 },
        ];

        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData,
            rowDragManaged: true,
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const gridRowsOptions: GridRowsOptions = { checkDom: true, columns: ['value'] };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.setNodesSelected({
            nodes: [api.getRowNode('4')!, api.getRowNode('1')!, api.getRowNode('5')!],
            newValue: true,
        });

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF selected id:4 value:4
            └── LEAF selected id:5 value:5
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[0],
            target: gridRows.rowsHtmlElements[3],
            eventType,
        });

        gridRows = new GridRows(api, '1 -> 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF selected id:1 value:1
            ├── LEAF selected id:4 value:4
            └── LEAF selected id:5 value:5
        `);

        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[2],
            target: gridRows.rowsHtmlElements[0],
            targetYOffsetPercent: 0.1,
            eventType,
        });

        gridRows = new GridRows(api, '1 -> 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:1 value:1
            ├── LEAF selected id:4 value:4
            ├── LEAF selected id:5 value:5
            ├── LEAF id:2 value:2
            └── LEAF id:3 value:3
        `);
    });

    test('removing the source row while dragging', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 3 },
            { id: '4', value: 4 },
            { id: '5', value: 5 },
        ]);

        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData,
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
            onDragStarted() {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '1', value: 1 },
                        { id: '3', value: 3 },
                        { id: '4', value: 4 },
                        { id: '5', value: 50 },
                    ])
                );
            },
        };

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[1],
            target: gridRows.rowsHtmlElements[3],
            eventType,
        });

        gridRows = new GridRows(api, 'drop', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            └── LEAF id:5 value:50
        `);
    });

    test('removing some selected rows, but not the source, while dragging', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 3 },
            { id: '4', value: 4 },
            { id: '5', value: 5 },
            { id: '6', value: 6 },
            { id: '7', value: 7 },
        ]);

        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData,
            rowDragManaged: true,
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,

            onDragStarted() {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '1', value: 11 },
                        { id: '3', value: 3 },
                        { id: '4', value: 4 },
                        { id: '6', value: 6 },
                        { id: '7', value: 7 },
                    ])
                );
            },
        };

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: ['value'],
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.setNodesSelected({
            nodes: [api.getRowNode('3')!, api.getRowNode('4')!, api.getRowNode('6')!],
            newValue: true,
        });

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await dragAndDropRow({
            api,
            source: gridRows.rowsHtmlElements[2],
            target: gridRows.rowsHtmlElements[0],
            targetYOffsetPercent: 0.1,
            eventType,
        });

        gridRows = new GridRows(api, 'drop', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:3 value:3
            ├── LEAF selected id:4 value:4
            ├── LEAF selected id:6 value:6
            ├── LEAF id:1 value:11
            └── LEAF id:7 value:7
        `);
    });
});

describe.each(DRAG_INTERACTION_TYPES)('managed drag cancellation %s', (eventType: DragInteractionType) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('drag cancellation keeps rows in order', async () => {
        const cancellationEvents = { dragCancelled: 0 };

        const api = gridsManager.createGrid('cancelled-drag', {
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData: [
                { id: 'row-1', value: 1 },
                { id: 'row-2', value: 2 },
            ],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: true,
            onDragCancelled: () => {
                cancellationEvents.dragCancelled += 1;
            },
        });

        const initialRows = new GridRows(api, 'cancel-initial', { checkDom: true, columns: ['value'] });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);

        const dragResult = await dragAndDropRow({
            api,
            source: initialRows.rowsHtmlElements[0],
            target: initialRows.rowsHtmlElements[1],
            targetYOffsetPercent: 0.8,
            cancel: true,
            eventType,
        });

        expect(cancellationEvents.dragCancelled).toBeGreaterThan(0);
        expect(dragResult.rowDragCancelEvents.length).toBeGreaterThan(0);
        expect(dragResult.rowDragEndEvents.length).toBe(0);
        expect(dragResult.rowDragMoveEvents.length).toBeGreaterThan(0);

        await new GridRows(api, 'cancel-after', { checkDom: true, columns: ['value'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);
    });
});
