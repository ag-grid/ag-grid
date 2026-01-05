import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import type { DragInteractionType } from '../test-utils';
import {
    DRAG_INTERACTION_TYPES,
    DRAG_NO_MOVE_INTERACTION_CASES,
    GridRows,
    RowDragDispatcher,
    TestGridsManager,
    cachedJSONObjects,
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
            const gridRows = new GridRows(api, i.toString());
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 v:1
                ├── LEAF id:2 v:2
                └── LEAF id:3 v:3
            `);
            if (i < 3) {
                const rowId = ['1', '2', '3'][i]!;
                const dispatcher = new RowDragDispatcher({ api, eventType });
                await dispatcher.start(rowId);
                await dispatcher.move(rowId);
                await dispatcher.finish();
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

        let gridRows = new GridRows(api, 'single');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:only v:1
        `);

        // Try dragging itself
        const singleDispatcher = new RowDragDispatcher({ api, eventType });
        const rowId = 'only';
        await singleDispatcher.start(rowId);
        await singleDispatcher.move(rowId);
        await singleDispatcher.finish();

        gridRows = new GridRows(api, 'single-post-drag');
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

        const initialRows = new GridRows(api, `${eventType}-initial`);
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);

        const reorderDispatcher = new RowDragDispatcher({ api, eventType });
        await reorderDispatcher.start('row-1');
        await reorderDispatcher.move('row-2', { yOffsetPercent: 0.8 });
        await reorderDispatcher.finish();

        await new GridRows(api, `${eventType}-after`).check(`
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
            const gridRows = new GridRows(api, 'drag ' + index);
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF selected id:1 v:1
                ├── LEAF id:2 v:2
                ├── LEAF id:3 v:3
                ├── LEAF selected id:4 v:4
                └── LEAF selected id:5 v:5
            `);

            if (index !== null) {
                const rowId = ['1', '2', '3', '4', '5'][index]!;
                const dispatcher = new RowDragDispatcher({ api, eventType });
                await dispatcher.start(rowId);
                await dispatcher.move(rowId, { yOffsetPercent: 0.7 });
                await dispatcher.finish();
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

        let gridRows = new GridRows(api, 'initial');
        const moveFirstToEnd = new RowDragDispatcher({ api, eventType });
        await moveFirstToEnd.start('1');
        await moveFirstToEnd.move('4');
        await moveFirstToEnd.finish();

        gridRows = new GridRows(api, '1 -> end');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 v:2
            ├── LEAF id:3 v:3
            ├── LEAF id:4 v:4
            └── LEAF id:1 v:1
        `);
        const moveLastToStart = new RowDragDispatcher({ api, eventType });
        await moveLastToStart.start('1');
        await moveLastToStart.move('2', { yOffsetPercent: 0.1 });
        await moveLastToStart.finish();

        gridRows = new GridRows(api, '1 back -> start');
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
        const gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 v:1
            ├── LEAF id:2 v:2
            └── LEAF id:3 v:3
        `);

        // Move row 2 (index 1) up
        const moveUpDispatcher = new RowDragDispatcher({ api, eventType });
        await moveUpDispatcher.start('2');
        await moveUpDispatcher.move('1', { yOffsetPercent: 0.1 });
        await moveUpDispatcher.finish();

        await new GridRows(api, '2 -> top').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 v:2
            ├── LEAF id:1 v:1
            └── LEAF id:3 v:3
        `);

        // Move row 2 (now index 0) down
        const moveDownDispatcher = new RowDragDispatcher({ api, eventType });
        await moveDownDispatcher.start('2');
        await moveDownDispatcher.move('1', { yOffsetPercent: 0.7 });
        await moveDownDispatcher.finish();

        await new GridRows(api, '2 back to middle').check(`
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

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            └── LEAF id:5 value:5
        `);

        const dragBDispatcher = new RowDragDispatcher({ api, eventType });
        await dragBDispatcher.start('2');
        await dragBDispatcher.move('4', { yOffsetPercent: 0.7 });
        await dragBDispatcher.finish();

        gridRows = new GridRows(api, 'a');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            ├── LEAF id:2 value:2
            └── LEAF id:5 value:5
        `);

        const dragCDispatcher = new RowDragDispatcher({ api, eventType });
        await dragCDispatcher.start('4');
        await dragCDispatcher.move('1', { yOffsetPercent: 0.15 });
        await dragCDispatcher.finish();

        gridRows = new GridRows(api, 'b');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 value:4
            ├── LEAF id:1 value:1
            ├── LEAF id:3 value:3
            ├── LEAF id:2 value:2
            └── LEAF id:5 value:5
        `);

        const dragDDispatcher = new RowDragDispatcher({ api, eventType });
        await dragDDispatcher.start('5');
        await dragDDispatcher.move('3', { yOffsetPercent: 0.1 });
        await dragDDispatcher.finish();

        gridRows = new GridRows(api, 'c');
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

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.setNodesSelected({
            nodes: [api.getRowNode('4')!, api.getRowNode('1')!, api.getRowNode('5')!],
            newValue: true,
        });

        let gridRows = new GridRows(api, 'initial');

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF selected id:4 value:4
            └── LEAF selected id:5 value:5
        `);

        const multiSelectDragToBottom = new RowDragDispatcher({ api, eventType });
        await multiSelectDragToBottom.start('1');
        await multiSelectDragToBottom.move('4');
        await multiSelectDragToBottom.finish();

        gridRows = new GridRows(api, '1 -> 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF selected id:1 value:1
            ├── LEAF selected id:4 value:4
            └── LEAF selected id:5 value:5
        `);

        const multiSelectDragToTop = new RowDragDispatcher({ api, eventType });
        await multiSelectDragToTop.start('1');
        await multiSelectDragToTop.move('2', { yOffsetPercent: 0.1 });
        await multiSelectDragToTop.finish();

        gridRows = new GridRows(api, '1 -> 2');
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

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        const removeSourceDispatcher = new RowDragDispatcher({ api, eventType });
        await removeSourceDispatcher.start('2');
        await removeSourceDispatcher.move('4');
        await removeSourceDispatcher.finish();

        gridRows = new GridRows(api, 'drop');
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

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.setNodesSelected({
            nodes: [api.getRowNode('3')!, api.getRowNode('4')!, api.getRowNode('6')!],
            newValue: true,
        });

        let gridRows = new GridRows(api, 'initial');
        const removeSelectionDispatcher = new RowDragDispatcher({ api, eventType });
        await removeSelectionDispatcher.start('3');
        await removeSelectionDispatcher.move('1', { yOffsetPercent: 0.1 });
        await removeSelectionDispatcher.finish();

        gridRows = new GridRows(api, 'drop');
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

        const initialRows = new GridRows(api, 'cancel-initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);

        const dispatcher = new RowDragDispatcher({ api, eventType });
        await dispatcher.start('row-1');
        await dispatcher.move('row-2', { yOffsetPercent: 0.8 });
        await dispatcher.finish({ cancel: true });

        expect(cancellationEvents.dragCancelled).toBeGreaterThan(0);
        expect(dispatcher.rowDragCancelEvents.length).toBeGreaterThan(0);
        expect(dispatcher.rowDragEndEvents.length).toBe(0);
        expect(dispatcher.rowDragMoveEvents.length).toBeGreaterThan(0);

        await new GridRows(api, 'cancel-after').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 value:1
            └── LEAF id:row-2 value:2
        `);
    });
});
