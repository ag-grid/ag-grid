import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects, executeTransactionsAsync } from '../../../test-utils';

describe('ag-grid parentId tree aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree aggregation and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', x: 1 },
            { id: '2', name: 'Alan Turing', x: 1, parentId: '1' },
            { id: '3', name: 'A. Church', x: 1, parentId: '1' },
            { id: '4', name: 'Donald Knuth', x: 1, parentId: '2' },
            { id: '5', name: 'Grace Hopper', x: 2, parentId: '2' },
            { id: '6', name: 'Linus Torvalds', x: 2, parentId: '3' },
            { id: '7', name: 'Brian Kernighan', x: 2, parentId: '3' },
            { id: '8', name: 'Claude Elwood Shannon', x: 2, parentId: '10' },
            { id: '9', name: 'E. Dijkstra', x: 2 },
            { id: '10', name: '-', parentId: '3' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }, { field: 'x', aggFunc: 'sum' }],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name', 'x'],
            checkDom: true,
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 name:"John Von Neumann" x:9
            │ ├─┬ 2 GROUP id:2 name:"Alan Turing" x:3
            │ │ ├── 4 LEAF id:4 name:"Donald Knuth" x:1
            │ │ └── 5 LEAF id:5 name:"Grace Hopper" x:2
            │ └─┬ 3 GROUP id:3 name:"A. Church" x:6
            │ · ├── 6 LEAF id:6 name:"Linus Torvalds" x:2
            │ · ├── 7 LEAF id:7 name:"Brian Kernighan" x:2
            │ · └─┬ 10 GROUP id:10 name:"-" x:2
            │ · · └── 8 LEAF id:8 name:"Claude Elwood Shannon" x:2
            └── 9 LEAF id:9 name:"E. Dijkstra" x:2
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', name: 'John Von Neumann', x: 1 },
                { id: '2', name: 'Alan Turing', x: 1, parentId: '1' },
                { id: '3', name: 'A. Church', x: 1, parentId: '1' },
                { id: '5', name: 'Grace Hopper', x: 2, parentId: '2' },
                { id: '4', name: 'Donald Knuth', x: 10, parentId: '2' },
                { id: '6', name: 'Linus Torvalds', x: 2, parentId: '3' },
                { id: '7', name: 'Brian Kernighan', x: 2, parentId: '3' },
                { id: '8', name: 'Claude Elwood Shannon', x: 10, parentId: '10' },
                { id: '9', name: 'E. Dijkstra', x: 2 },
                { id: '10', name: '-', parentId: '3' },
            ])
        );

        await new GridRows(api, 'update x', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 name:"John Von Neumann" x:26
            │ ├─┬ 2 GROUP id:2 name:"Alan Turing" x:12
            │ │ ├── 5 LEAF id:5 name:"Grace Hopper" x:2
            │ │ └── 4 LEAF id:4 name:"Donald Knuth" x:10
            │ └─┬ 3 GROUP id:3 name:"A. Church" x:14
            │ · ├── 6 LEAF id:6 name:"Linus Torvalds" x:2
            │ · ├── 7 LEAF id:7 name:"Brian Kernighan" x:2
            │ · └─┬ 10 GROUP id:10 name:"-" x:10
            │ · · └── 8 LEAF id:8 name:"Claude Elwood Shannon" x:10
            └── 9 LEAF id:9 name:"E. Dijkstra" x:2
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', name: 'John Von Neumann', x: 1 },
                { id: '2', name: 'Alan Turing', x: 1, parentId: '1' },
                { id: '3', name: 'A. Church', x: 1, parentId: '1' },
                { id: '5', name: 'Grace Hopper', x: 2, parentId: '2' },
                { id: '4', name: 'Donald Knuth', x: 10, parentId: '2' },
                { id: '6', name: 'Linus Torvalds', x: 2, parentId: '3' },
                { id: '8', name: 'Claude Elwood Shannon', x: 10, parentId: '10' },
                { id: '9', name: 'E. Dijkstra', x: 2 },
                { id: '10', name: '-', parentId: '3' },
            ])
        );

        await new GridRows(api, 'delete', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 name:"John Von Neumann" x:24
            │ ├─┬ 2 GROUP id:2 name:"Alan Turing" x:12
            │ │ ├── 5 LEAF id:5 name:"Grace Hopper" x:2
            │ │ └── 4 LEAF id:4 name:"Donald Knuth" x:10
            │ └─┬ 3 GROUP id:3 name:"A. Church" x:12
            │ · ├── 6 LEAF id:6 name:"Linus Torvalds" x:2
            │ · └─┬ 10 GROUP id:10 name:"-" x:10
            │ · · └── 8 LEAF id:8 name:"Claude Elwood Shannon" x:10
            └── 9 LEAF id:9 name:"E. Dijkstra" x:2
        `);

        const movedRowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', x: 1 },
            { id: '2', name: 'Alan Turing', x: 1, parentId: '1' },
            { id: '3', name: 'A. Church', x: 1, parentId: '1' },
            { id: '5', name: 'Grace Hopper', x: 2, parentId: '2' },
            { id: '4', name: 'Donald Knuth', x: 10, parentId: '2' },
            { id: '6', name: 'Linus Torvalds', x: 2, parentId: '10' },
            { id: '9', name: 'E. Dijkstra', x: 12 },
            { id: '10', name: '-', parentId: '2' },
            { id: '8', name: 'Claude Elwood Shannon', x: 10, parentId: '2' },
        ]);

        api.updateGridOptions({
            alwaysAggregateAtRootLevel: true,
            rowData: movedRowData,
        });

        await new GridRows(api, 'move', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:37
            ├─┬ 1 GROUP id:1 name:"John Von Neumann" x:25
            │ ├─┬ 2 GROUP id:2 name:"Alan Turing" x:24
            │ │ ├── 5 LEAF id:5 name:"Grace Hopper" x:2
            │ │ ├── 4 LEAF id:4 name:"Donald Knuth" x:10
            │ │ ├─┬ 10 GROUP id:10 name:"-" x:2
            │ │ │ └── 6 LEAF id:6 name:"Linus Torvalds" x:2
            │ │ └── 8 LEAF id:8 name:"Claude Elwood Shannon" x:10
            │ └── 3 LEAF id:3 name:"A. Church" x:1
            └── 9 LEAF id:9 name:"E. Dijkstra" x:12
        `);
    });

    test.each(['transactions', 'immutable'] as const)(
        'tree aggregation, with aggregateOnlyChangedColumns=true %s',
        async (mode) => {
            const rowData = cachedJSONObjects.array([
                { id: '0' },
                { id: '1', parentId: '0' },
                { id: '2', x: 1, y: 1, parentId: '1' },
                { id: '3', x: 1, y: 2, parentId: '1' },
                { id: '4', parentId: '0' },
                { id: '5', x: 2, y: 3, parentId: '4' },
                { id: '6', x: 2, y: 4, parentId: '4' },
                { id: '7', parentId: '4' },
                { id: '8', x: 2, y: 5, parentId: '7' },
                { id: '9', x: 2, y: 6, parentId: '7' },
                { id: '10', parentId: '7' },
                { id: '11', x: 2, y: 7, parentId: '10' },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'x', aggFunc: 'sum' },
                    { field: 'y', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Path' },
                aggregateOnlyChangedColumns: true,
                treeData: true,
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
            });

            const gridRowsOptions: GridRowsOptions = {
                columns: ['x', 'y'],
                checkDom: true,
            };

            await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:12 y:28
                · ├─┬ 1 GROUP id:1 x:2 y:3
                · │ ├── 2 LEAF id:2 x:1 y:1
                · │ └── 3 LEAF id:3 x:1 y:2
                · └─┬ 4 GROUP id:4 x:10 y:25
                · · ├── 5 LEAF id:5 x:2 y:3
                · · ├── 6 LEAF id:6 x:2 y:4
                · · └─┬ 7 GROUP id:7 x:6 y:18
                · · · ├── 8 LEAF id:8 x:2 y:5
                · · · ├── 9 LEAF id:9 x:2 y:6
                · · · └─┬ 10 GROUP id:10 x:2 y:7
                · · · · └── 11 LEAF id:11 x:2 y:7
            `);

            if (mode === 'transactions') {
                api.applyTransaction({ remove: [rowData[3], rowData[10], rowData[11]] });
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0' },
                        { id: '2', x: 1, y: 1, parentId: '1' },
                        { id: '4', parentId: '0' },
                        { id: '5', x: 2, y: 3, parentId: '4' },
                        { id: '6', x: 2, y: 4, parentId: '4' },
                        { id: '7', parentId: '4' },
                        { id: '8', x: 2, y: 5, parentId: '7' },
                        { id: '9', x: 2, y: 6, parentId: '7' },
                    ])
                );
            }

            await new GridRows(api, 'transaction 0 (remove)', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:9 y:19
                · ├─┬ 1 GROUP id:1 x:1 y:1
                · │ └── 2 LEAF id:2 x:1 y:1
                · └─┬ 4 GROUP id:4 x:8 y:18
                · · ├── 5 LEAF id:5 x:2 y:3
                · · ├── 6 LEAF id:6 x:2 y:4
                · · └─┬ 7 GROUP id:7 x:4 y:11
                · · · ├── 8 LEAF id:8 x:2 y:5
                · · · └── 9 LEAF id:9 x:2 y:6
            `);

            if (mode === 'transactions') {
                await executeTransactionsAsync(
                    [
                        { add: [rowData[3]], remove: [rowData[9]] },
                        {
                            add: [rowData[11]],
                            update: cachedJSONObjects.array([
                                { id: '5', x: 2, y: 4, parentId: '4' },
                                { id: '6', x: 100, y: 5, parentId: '4' },
                                { id: '7', x: 2, y: 1000, parentId: '4' },
                            ]),
                        },
                        {
                            update: cachedJSONObjects.array([
                                { id: '3', x: 1, y: 2, parentId: '1' },
                                { id: '4', x: 2, y: 3, parentId: '0' },
                                { id: '11', x: 2, y: 7, parentId: '6' },
                                { id: '8', x: 2, y: 7, parentId: '4' },
                            ]),
                        },
                    ],
                    api
                );
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0' },
                        { id: '2', x: 1, y: 1, parentId: '1' },
                        { id: '3', x: 1, y: 2, parentId: '1' },
                        { id: '4', x: 2, y: 3, parentId: '0' },
                        { id: '5', x: 2, y: 4, parentId: '4' },
                        { id: '6', x: 100, y: 5, parentId: '4' },
                        { id: '7', x: 2, y: 1000, parentId: '4' },
                        { id: '8', x: 2, y: 7, parentId: '4' },
                        { id: '11', x: 2, y: 7, parentId: '6' },
                    ])
                );
            }

            await new GridRows(api, 'transaction 1 (re-add, update)', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:10 y:1021
                · ├─┬ 1 GROUP id:1 x:2 y:3
                · │ ├── 2 LEAF id:2 x:1 y:1
                · │ └── 3 LEAF id:3 x:1 y:2
                · └─┬ 4 GROUP id:4 x:8 y:1018
                · · ├── 5 LEAF id:5 x:2 y:4
                · · ├─┬ 6 GROUP id:6 x:2 y:7
                · · │ └── 11 LEAF id:11 x:2 y:7
                · · ├── 7 LEAF id:7 x:2 y:1000
                · · └── 8 LEAF id:8 x:2 y:7
            `);

            if (mode === 'transactions') {
                api.applyTransaction({
                    update: [
                        { id: '5', x: 2, y: 4, parentId: '3' },
                        { id: '6', x: 100, y: 5, parentId: '3' },
                        { id: '7', x: 2, y: 250, parentId: '5' },
                    ],
                });
            } else {
                api.setGridOption('rowData', [
                    { id: '0' },
                    { id: '1', parentId: '0' },
                    { id: '2', x: 1, y: 1, parentId: '1' },
                    { id: '3', x: 1, y: 2, parentId: '1' },
                    { id: '4', x: 2, y: 3, parentId: '0' },
                    { id: '8', x: 2, y: 7, parentId: '4' },
                    { id: '5', x: 2, y: 4, parentId: '3' },
                    { id: '6', x: 100, y: 5, parentId: '3' },
                    { id: '7', x: 2, y: 250, parentId: '5' },
                    { id: '11', x: 2, y: 7, parentId: '6' },
                ]);
            }

            await new GridRows(api, 'transaction 2 (change path)', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:7 y:265
                · ├─┬ 1 GROUP id:1 x:5 y:258
                · │ ├── 2 LEAF id:2 x:1 y:1
                · │ └─┬ 3 GROUP id:3 x:4 y:257
                · │ · ├─┬ 5 GROUP id:5 x:2 y:250
                · │ · │ └── 7 LEAF id:7 x:2 y:250
                · │ · └─┬ 6 GROUP id:6 x:2 y:7
                · │ · · └── 11 LEAF id:11 x:2 y:7
                · └─┬ 4 GROUP id:4 x:2 y:7
                · · └── 8 LEAF id:8 x:2 y:7
            `);

            api.setGridOption('columnDefs', [
                { field: 'x', aggFunc: 'sum' },
                { field: 'y', aggFunc: 'avg' },
            ]);

            await new GridRows(api, 'change aggFunc', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:7 y:{"count":4,"value":66.25}
                · ├─┬ 1 GROUP id:1 x:5 y:{"count":3,"value":86}
                · │ ├── 2 LEAF id:2 x:1 y:1
                · │ └─┬ 3 GROUP id:3 x:4 y:{"count":2,"value":128.5}
                · │ · ├─┬ 5 GROUP id:5 x:2 y:{"count":1,"value":250}
                · │ · │ └── 7 LEAF id:7 x:2 y:250
                · │ · └─┬ 6 GROUP id:6 x:2 y:{"count":1,"value":7}
                · │ · · └── 11 LEAF id:11 x:2 y:7
                · └─┬ 4 GROUP id:4 x:2 y:{"count":1,"value":7}
                · · └── 8 LEAF id:8 x:2 y:7
            `);

            if (mode === 'transactions') {
                api.applyTransaction({
                    remove: [rowData[2], rowData[3]],
                    update: [
                        { id: '8', x: 100, y: 100, parentId: '1' },
                        { id: '7', x: 100, y: 100, parentId: '8' },
                        { id: '5', x: 200, y: 200, parentId: '7' },
                        { id: '6', x: 100, y: 100, parentId: '7' },
                        { id: '11', x: 2, y: 7, parentId: '6' },
                        { id: '4', x: 2, y: 3, parentId: '0' },
                    ],
                });
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0' },
                        { id: '4', x: 2, y: 3, parentId: '0' },
                        { id: '5', x: 200, y: 200, parentId: '7' },
                        { id: '6', x: 100, y: 100, parentId: '7' },
                        { id: '7', x: 100, y: 100, parentId: '8' },
                        { id: '8', x: 100, y: 100, parentId: '1' },
                        { id: '11', x: 2, y: 7, parentId: '6' },
                    ])
                );
            }

            await new GridRows(api, 'transaction 4 (update and change path)', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ 0 GROUP id:0 x:204 y:{"count":3,"value":70}
                · ├─┬ 1 GROUP id:1 x:202 y:{"count":2,"value":103.5}
                · │ └─┬ 8 GROUP id:8 x:202 y:{"count":2,"value":103.5}
                · │ · └─┬ 7 GROUP id:7 x:202 y:{"count":2,"value":103.5}
                · │ · · ├── 5 LEAF id:5 x:200 y:200
                · │ · · └─┬ 6 GROUP id:6 x:2 y:{"count":1,"value":7}
                · │ · · · └── 11 LEAF id:11 x:2 y:7
                · └── 4 LEAF id:4 x:2 y:3
            `);
        }
    );

    test.each(['transactions', 'immutable'] as const)(
        'tree aggregation with alwaysAggregateAtRootLevel=true %s',
        async (mode) => {
            const rowData = cachedJSONObjects.array([
                { id: '0' },
                { id: '1', parentId: '0' },
                { id: '2', x: 1, y: 1, parentId: '1' },
                { id: '3', x: 1, y: 2, parentId: '1' },
                { id: '4', x: 2, y: 3, parentId: '0' },
                { id: '5', x: 2, y: 4, parentId: '0' },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'x', aggFunc: 'sum' },
                    { field: 'y', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Parent' },
                alwaysAggregateAtRootLevel: true,
                treeData: true,
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
            });

            const gridRowsOptions: GridRowsOptions = {
                columns: ['x', 'y'],
                checkDom: true,
            };

            await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:6 y:10
                └─┬ 0 GROUP id:0 x:6 y:10
                · ├─┬ 1 GROUP id:1 x:2 y:3
                · │ ├── 2 LEAF id:2 x:1 y:1
                · │ └── 3 LEAF id:3 x:1 y:2
                · ├── 4 LEAF id:4 x:2 y:3
                · └── 5 LEAF id:5 x:2 y:4
            `);

            if (mode === 'transactions') {
                api.applyTransaction({ remove: [rowData[3]] });
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0' },
                        { id: '2', x: 1, y: 1, parentId: '1' },
                        { id: '4', x: 2, y: 3, parentId: '0' },
                        { id: '5', x: 2, y: 4, parentId: '0' },
                    ])
                );
            }

            await new GridRows(api, 'transaction 1', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:5 y:8
                └─┬ 0 GROUP id:0 x:5 y:8
                · ├─┬ 1 GROUP id:1 x:1 y:1
                · │ └── 2 LEAF id:2 x:1 y:1
                · ├── 4 LEAF id:4 x:2 y:3
                · └── 5 LEAF id:5 x:2 y:4
            `);

            if (mode === 'transactions') {
                api.applyTransaction({ update: [{ ...rowData[4], x: 100, y: 100 }] });
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0' },
                        { id: '2', x: 1, y: 1, parentId: '1' },
                        { id: '4', x: 100, y: 100, parentId: '0' },
                        { id: '5', x: 2, y: 4, parentId: '0' },
                    ])
                );
            }

            await new GridRows(api, 'transaction 2', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:103 y:105
                └─┬ 0 GROUP id:0 x:103 y:105
                · ├─┬ 1 GROUP id:1 x:1 y:1
                · │ └── 2 LEAF id:2 x:1 y:1
                · ├── 4 LEAF id:4 x:100 y:100
                · └── 5 LEAF id:5 x:2 y:4
            `);
        }
    );

    test.each(['transactions', 'immutable'] as const)(
        'deep subtree can be moved and aggregation is still correct, %s',
        async (mode) => {
            const rowData = cachedJSONObjects.array([
                { id: '0' },
                { id: '1', parentId: '0', x: 99 },
                { id: '2', parentId: '1' },
                { id: '3', parentId: '2' },
                { id: '4', parentId: '3' },
                { id: '5', parentId: '4' },
                { id: '6', parentId: '5', x: 32 },
                { id: '7', parentId: '5', x: 23 },
                { id: '8' },
                { id: '9', parentId: '8', x: 10 },
                { id: '10', parentId: '8', x: 12 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x', aggFunc: 'sum' }],
                autoGroupColumnDef: { headerName: 'Path' },
                treeData: true,
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
            });

            const gridRowsOptions: GridRowsOptions = {
                columns: ['x'],
                checkDom: true,
            };

            await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ 0 GROUP id:0 x:55
                │ └─┬ 1 GROUP id:1 x:55
                │ · └─┬ 2 GROUP id:2 x:55
                │ · · └─┬ 3 GROUP id:3 x:55
                │ · · · └─┬ 4 GROUP id:4 x:55
                │ · · · · └─┬ 5 GROUP id:5 x:55
                │ · · · · · ├── 6 LEAF id:6 x:32
                │ · · · · · └── 7 LEAF id:7 x:23
                └─┬ 8 GROUP id:8 x:22
                · ├── 9 LEAF id:9 x:10
                · └── 10 LEAF id:10 x:12
            `);

            if (mode === 'transactions') {
                api.applyTransaction({ update: [{ ...rowData[2], parentId: '9' }] });
            } else {
                api.setGridOption(
                    'rowData',
                    cachedJSONObjects.array([
                        { id: '0' },
                        { id: '1', parentId: '0', x: 99 },
                        { id: '8' },
                        { id: '9', parentId: '8', x: 10 },
                        { id: '2', parentId: '9' },
                        { id: '3', parentId: '2' },
                        { id: '4', parentId: '3' },
                        { id: '5', parentId: '4' },
                        { id: '6', parentId: '5', x: 32 },
                        { id: '7', parentId: '5', x: 23 },
                        { id: '10', parentId: '8', x: 12 },
                    ])
                );
            }

            await new GridRows(api, 'moved', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ 0 GROUP id:0 x:99
                │ └── 1 LEAF id:1 x:99
                └─┬ 8 GROUP id:8 x:67
                · ├─┬ 9 GROUP id:9 x:55
                · │ └─┬ 2 GROUP id:2 x:55
                · │ · └─┬ 3 GROUP id:3 x:55
                · │ · · └─┬ 4 GROUP id:4 x:55
                · │ · · · └─┬ 5 GROUP id:5 x:55
                · │ · · · · ├── 6 LEAF id:6 x:32
                · │ · · · · └── 7 LEAF id:7 x:23
                · └── 10 LEAF id:10 x:12
            `);

            api.updateGridOptions({
                alwaysAggregateAtRootLevel: true,
                rowData: cachedJSONObjects.array([
                    { id: '0' },
                    { id: '1', parentId: '0', x: 99 },
                    { id: '8' },
                    { id: '9', parentId: '8', x: 10 },
                    { id: '2', parentId: '10' },
                    { id: '4', parentId: '3' },
                    { id: '3', parentId: '2' },
                    { id: '5', parentId: '4' },
                    { id: '6', parentId: '5', x: 32 },
                    { id: '7', parentId: '5', x: 23 },
                    { id: '10', parentId: '8', x: 12 },
                ]),
            });

            await new GridRows(api, 'moved 2', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:164
                ├─┬ 0 GROUP id:0 x:99
                │ └── 1 LEAF id:1 x:99
                └─┬ 8 GROUP id:8 x:65
                · ├── 9 LEAF id:9 x:10
                · └─┬ 10 GROUP id:10 x:55
                · · └─┬ 2 GROUP id:2 x:55
                · · · └─┬ 3 GROUP id:3 x:55
                · · · · └─┬ 4 GROUP id:4 x:55
                · · · · · └─┬ 5 GROUP id:5 x:55
                · · · · · · ├── 6 LEAF id:6 x:32
                · · · · · · └── 7 LEAF id:7 x:23
            `);
        }
    );
});
