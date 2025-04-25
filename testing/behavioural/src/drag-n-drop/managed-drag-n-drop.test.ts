import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects, dragAndDropRow } from '../test-utils';

describe.each([true, false])(
    'ag-grid managed drag and drop suppressMoveWhenRowDragging=%s',
    (suppressMoveWhenRowDragging) => {
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
                suppressMoveWhenRowDragging,
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
                    await dragAndDropRow({ api, source: el, target: el });
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
                suppressMoveWhenRowDragging,
            });

            let gridRows = new GridRows(api, 'single', { checkDom: true, columns: true });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:only v:1
        `);

            // Try dragging itself
            await dragAndDropRow({ api, source: gridRows.rowsHtmlElements[0], target: gridRows.rowsHtmlElements[0] });

            gridRows = new GridRows(api, 'single-post-drag', { checkDom: true, columns: true });
            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:only v:1
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
                suppressMoveWhenRowDragging,
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
                suppressMoveWhenRowDragging,
            };

            const api = gridsManager.createGrid('first-last', gridOptions);

            let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: true });
            await dragAndDropRow({ api, source: gridRows.rowsHtmlElements[0], target: gridRows.rowsHtmlElements[3] });

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
                suppressMoveWhenRowDragging,
            };

            const api = gridsManager.createGrid('adjacent', gridOptions);
            const gridRows = new GridRows(api, 'initial', { checkDom: true, columns: true });

            // Move row 2 (index 1) up
            await dragAndDropRow({
                api,
                source: gridRows.rowsHtmlElements[1],
                target: gridRows.rowsHtmlElements[0],
                targetYOffsetPercent: 0.1,
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
                suppressMoveWhenRowDragging,
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
                suppressMoveWhenRowDragging,
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

            await dragAndDropRow({ api, source: gridRows.rowsHtmlElements[0], target: gridRows.rowsHtmlElements[3] });

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
                suppressMoveWhenRowDragging,
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
                suppressMoveWhenRowDragging,

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
    }
);
