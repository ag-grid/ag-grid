import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TestGridsManager, cachedJSONObjects, executeTransactionsAsync } from '../../../test-utils';
import { TreeDiagram } from '../tree-test-utils';
import type { TreeDiagramOptions } from '../tree-test-utils';

describe('ag-grid tree aggregation', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    beforeEach(() => {
        jest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree aggregation and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', x: 1, path: ['A'] },
            { id: '2', name: 'Alan Turing', x: 1, path: ['A', 'B'] },
            { id: '3', name: 'A. Church', x: 1, path: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', x: 1, path: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', x: 2, path: ['A', 'B', 'E'] },
            { id: '6', name: 'Linus Torvalds', x: 2, path: ['A', 'C', 'F'] },
            { id: '7', name: 'Brian Kernighan', x: 2, path: ['A', 'C', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', x: 2, path: ['A', 'C', 'H', 'I'] },
            { id: '9', name: 'E. Dijkstra', x: 2, path: ['J'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }, { field: 'x', aggFunc: 'sum' }],
            autoGroupColumnDef: { headerName: 'Path' },
            treeData: true,
            animateRows: false,
            rowSelection: 'multiple',
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.path,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            columns: ['name', 'x'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:9
            │ ├─┬ B GROUP id:2 name:"Alan Turing" x:3
            │ │ ├── D LEAF id:4 name:"Donald Knuth" x:1
            │ │ └── E LEAF id:5 name:"Grace Hopper" x:2
            │ └─┬ C GROUP id:3 name:"A. Church" x:6
            │ · ├── F LEAF id:6 name:"Linus Torvalds" x:2
            │ · ├── G LEAF id:7 name:"Brian Kernighan" x:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:2
            │ · · └── I LEAF id:8 name:"Claude Elwood Shannon" x:2
            └── J LEAF id:9 name:"E. Dijkstra" x:2
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', name: 'John Von Neumann', x: 1, path: ['A'] },
                { id: '2', name: 'Alan Turing', x: 1, path: ['A', 'B'] },
                { id: '3', name: 'A. Church', x: 1, path: ['A', 'C'] },
                { id: '5', name: 'Grace Hopper', x: 2, path: ['A', 'B', 'E'] },
                { id: '4', name: 'Donald Knuth', x: 10, path: ['A', 'B', 'D'] },
                { id: '6', name: 'Linus Torvalds', x: 2, path: ['A', 'C', 'F'] },
                { id: '7', name: 'Brian Kernighan', x: 2, path: ['A', 'C', 'G'] },
                { id: '8', name: 'Claude Elwood Shannon', x: 10, path: ['A', 'C', 'H', 'I'] },
                { id: '9', name: 'E. Dijkstra', x: 2, path: ['J'] },
            ])
        );

        new TreeDiagram(api, 'update x', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:26
            │ ├─┬ B GROUP id:2 name:"Alan Turing" x:12
            │ │ ├── E LEAF id:5 name:"Grace Hopper" x:2
            │ │ └── D LEAF id:4 name:"Donald Knuth" x:10
            │ └─┬ C GROUP id:3 name:"A. Church" x:14
            │ · ├── F LEAF id:6 name:"Linus Torvalds" x:2
            │ · ├── G LEAF id:7 name:"Brian Kernighan" x:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:10
            │ · · └── I LEAF id:8 name:"Claude Elwood Shannon" x:10
            └── J LEAF id:9 name:"E. Dijkstra" x:2
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', name: 'John Von Neumann', x: 1, path: ['A'] },
                { id: '2', name: 'Alan Turing', x: 1, path: ['A', 'B'] },
                { id: '3', name: 'A. Church', x: 1, path: ['A', 'C'] },
                { id: '5', name: 'Grace Hopper', x: 2, path: ['A', 'B', 'E'] },
                { id: '4', name: 'Donald Knuth', x: 10, path: ['A', 'B', 'D'] },
                { id: '6', name: 'Linus Torvalds', x: 2, path: ['A', 'C', 'F'] },
                { id: '8', name: 'Claude Elwood Shannon', x: 10, path: ['A', 'C', 'H', 'I'] },
                { id: '9', name: 'E. Dijkstra', x: 2, path: ['J'] },
            ])
        );

        new TreeDiagram(api, 'delete', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:24
            │ ├─┬ B GROUP id:2 name:"Alan Turing" x:12
            │ │ ├── E LEAF id:5 name:"Grace Hopper" x:2
            │ │ └── D LEAF id:4 name:"Donald Knuth" x:10
            │ └─┬ C GROUP id:3 name:"A. Church" x:12
            │ · ├── F LEAF id:6 name:"Linus Torvalds" x:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:10
            │ · · └── I LEAF id:8 name:"Claude Elwood Shannon" x:10
            └── J LEAF id:9 name:"E. Dijkstra" x:2
        `);

        const movedRowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', x: 1, path: ['A'] },
            { id: '2', name: 'Alan Turing', x: 1, path: ['A', 'B'] },
            { id: '3', name: 'A. Church', x: 1, path: ['A', 'C'] },
            { id: '5', name: 'Grace Hopper', x: 2, path: ['A', 'B', 'E'] },
            { id: '4', name: 'Donald Knuth', x: 10, path: ['A', 'B', 'D'] },
            { id: '6', name: 'Linus Torvalds', x: 2, path: ['A', 'B', 'F', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', x: 10, path: ['A', 'B', 'H'] },
            { id: '9', name: 'E. Dijkstra', x: 2, path: ['J'] },
        ]);

        api.setGridOption('rowData', movedRowData);

        // TODO: HACK: Setting the rowData twice here is because AG-12650
        // Aggregations do not update the UI with tree data fillers removed
        // Remove this line after AG-12650 is fixed
        api.setGridOption('rowData', JSON.parse(JSON.stringify(movedRowData)));

        new TreeDiagram(api, 'move', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:25
            │ ├─┬ B GROUP id:2 name:"Alan Turing" x:24
            │ │ ├── E LEAF id:5 name:"Grace Hopper" x:2
            │ │ ├── D LEAF id:4 name:"Donald Knuth" x:10
            │ │ ├─┬ F filler id:row-group-0-A-1-B-2-F x:2
            │ │ │ └── G LEAF id:6 name:"Linus Torvalds" x:2
            │ │ └── H LEAF id:8 name:"Claude Elwood Shannon" x:10
            │ └── C LEAF id:3 name:"A. Church" x:1
            └── J LEAF id:9 name:"E. Dijkstra" x:2
        `);
    });

    test('tree aggregation, with aggregateOnlyChangedColumns=true', async () => {
        const rowData = [
            { id: '0', path: ['A'] },

            { id: '1', path: ['A', 'B'] },
            { id: '2', x: 1, y: 1, path: ['A', 'B', 'D'] },
            { id: '3', x: 1, y: 2, path: ['A', 'B', 'E'] },

            { id: '4', x: 2, y: 3, path: ['A', 'C', 'F'] },
            { id: '5', x: 2, y: 4, path: ['A', 'C', 'G'] },
            { id: '6', x: 2, y: 5, path: ['A', 'C', 'H', 'I'] },
            { id: '7', x: 2, y: 6, path: ['A', 'C', 'H', 'J'] },
            { id: '8', x: 2, y: 7, path: ['A', 'C', 'H', 'K', 'L'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'x', aggFunc: 'sum' },
                { field: 'y', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Path' },
            aggregateOnlyChangedColumns: true,
            treeData: true,
            animateRows: false,
            rowSelection: 'multiple',
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.path,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            columns: ['x', 'y'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 x:12 y:28
            · ├─┬ B GROUP id:1 x:2 y:3
            · │ ├── D LEAF id:2 x:1 y:1
            · │ └── E LEAF id:3 x:1 y:2
            · └─┬ C filler id:row-group-0-A-1-C x:10 y:25
            · · ├── F LEAF id:4 x:2 y:3
            · · ├── G LEAF id:5 x:2 y:4
            · · └─┬ H filler id:row-group-0-A-1-C-2-H x:6 y:18
            · · · ├── I LEAF id:6 x:2 y:5
            · · · ├── J LEAF id:7 x:2 y:6
            · · · └─┬ K filler id:row-group-0-A-1-C-2-H-3-K x:2 y:7
            · · · · └── L LEAF id:8 x:2 y:7
        `);

        api.applyTransaction({ remove: [rowData[3], rowData[8]] });

        new TreeDiagram(api, 'transaction 0 (remove)', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 x:9 y:19
            · ├─┬ B GROUP id:1 x:1 y:1
            · │ └── D LEAF id:2 x:1 y:1
            · └─┬ C filler id:row-group-0-A-1-C x:8 y:18
            · · ├── F LEAF id:4 x:2 y:3
            · · ├── G LEAF id:5 x:2 y:4
            · · └─┬ H filler id:row-group-0-A-1-C-2-H x:4 y:11
            · · · ├── I LEAF id:6 x:2 y:5
            · · · └── J LEAF id:7 x:2 y:6
        `);

        await executeTransactionsAsync(
            [
                { update: [{ ...rowData[6], x: 99 }] },
                { add: [rowData[3]] },
                { update: [{ ...rowData[7], y: 1000 }] },
                { add: [rowData[8]] },
                { update: [{ ...rowData[6], x: 100 }] },
            ],
            api
        );

        new TreeDiagram(api, 'transaction 1 (re-add, update)', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 x:110 y:1022
            · ├─┬ B GROUP id:1 x:2 y:3
            · │ ├── D LEAF id:2 x:1 y:1
            · │ └── E LEAF id:3 x:1 y:2
            · └─┬ C filler id:row-group-0-A-1-C x:108 y:1019
            · · ├── F LEAF id:4 x:2 y:3
            · · ├── G LEAF id:5 x:2 y:4
            · · └─┬ H filler id:row-group-0-A-1-C-2-H x:104 y:1012
            · · · ├── I LEAF id:6 x:100 y:5
            · · · ├── J LEAF id:7 x:2 y:1000
            · · · └─┬ K filler id:row-group-0-A-1-C-2-H-3-K x:2 y:7
            · · · · └── L LEAF id:8 x:2 y:7
        `);

        api.applyTransaction({
            update: [
                { ...rowData[6], path: ['X', 'Y'] },
                { ...rowData[7], path: ['X', 'Z'] },
                { ...rowData[5], path: ['X', 'W'] },
            ],
        });

        new TreeDiagram(api, 'transaction 2 (change path)', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 x:6 y:13
            │ ├─┬ B GROUP id:1 x:2 y:3
            │ │ ├── D LEAF id:2 x:1 y:1
            │ │ └── E LEAF id:3 x:1 y:2
            │ └─┬ C filler id:row-group-0-A-1-C x:4 y:10
            │ · ├── F LEAF id:4 x:2 y:3
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:2 y:7
            │ · · └─┬ K filler id:row-group-0-A-1-C-2-H-3-K x:2 y:7
            │ · · · └── L LEAF id:8 x:2 y:7
            └─┬ X filler id:row-group-0-X x:6 y:15
            · ├── W LEAF id:5 x:2 y:4
            · ├── Y LEAF id:6 x:2 y:5
            · └── Z LEAF id:7 x:2 y:6
        `);

        api.setGridOption('columnDefs', [
            { field: 'x', aggFunc: 'sum' },
            { field: 'y', aggFunc: 'avg' },
        ]);

        new TreeDiagram(api, 'change aggFunc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 x:6 y:{"count":4,"value":3.25}
            │ ├─┬ B GROUP id:1 x:2 y:{"count":2,"value":1.5}
            │ │ ├── D LEAF id:2 x:1 y:1
            │ │ └── E LEAF id:3 x:1 y:2
            │ └─┬ C filler id:row-group-0-A-1-C x:4 y:{"count":2,"value":5}
            │ · ├── F LEAF id:4 x:2 y:3
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:2 y:{"count":1,"value":7}
            │ · · └─┬ K filler id:row-group-0-A-1-C-2-H-3-K x:2 y:{"count":1,"value":7}
            │ · · · └── L LEAF id:8 x:2 y:7
            └─┬ X filler id:row-group-0-X x:6 y:{"count":3,"value":5}
            · ├── W LEAF id:5 x:2 y:4
            · ├── Y LEAF id:6 x:2 y:5
            · └── Z LEAF id:7 x:2 y:6
        `);

        api.applyTransaction({
            remove: [rowData[2], rowData[3]],
            update: [
                { ...rowData[8], path: ['A', 'B', 'R'], x: 100, y: 100 },
                { ...rowData[6], path: ['X', 'Y'], x: 100, y: 100 },
                { ...rowData[7], path: ['X', 'W'], x: 100, y: 100 },
                { ...rowData[5], path: ['X', 'W', 'W'], x: 200, y: 200 },
            ],
        });

        new TreeDiagram(api, 'transaction 4 (update and change path)', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 x:102 y:{"count":2,"value":51.5}
            │ ├─┬ B GROUP id:1 x:100 y:{"count":1,"value":100}
            │ │ └── R LEAF id:8 x:100 y:100
            │ └─┬ C filler id:row-group-0-A-1-C x:2 y:{"count":1,"value":3}
            │ · └── F LEAF id:4 x:2 y:3
            └─┬ X filler id:row-group-0-X x:300 y:{"count":2,"value":150}
            · ├── Y LEAF id:6 x:100 y:100
            · └─┬ W GROUP id:7 x:200 y:{"count":1,"value":200}
            · · └── W LEAF id:5 x:200 y:200
        `);
    });

    test('tree aggregation with alwaysAggregateAtRootLevel=true', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '0', path: ['A'] },
            { id: '1', path: ['A', 'B'] },
            { id: '2', x: 1, y: 1, path: ['A', 'B', 'D'] },
            { id: '3', x: 1, y: 2, path: ['A', 'B', 'E'] },
            { id: '4', x: 2, y: 3, path: ['A', 'C', 'F'] },
            { id: '5', x: 2, y: 4, path: ['A', 'C', 'G'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'x', aggFunc: 'sum' },
                { field: 'y', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Path' },
            alwaysAggregateAtRootLevel: true,
            treeData: true,
            animateRows: false,
            rowSelection: 'multiple',
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.path,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            columns: ['x', 'y'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:6 y:10
            └─┬ A GROUP id:0 x:6 y:10
            · ├─┬ B GROUP id:1 x:2 y:3
            · │ ├── D LEAF id:2 x:1 y:1
            · │ └── E LEAF id:3 x:1 y:2
            · └─┬ C filler id:row-group-0-A-1-C x:4 y:7
            · · ├── F LEAF id:4 x:2 y:3
            · · └── G LEAF id:5 x:2 y:4
        `);

        api.applyTransaction({ remove: [rowData[3]] });

        new TreeDiagram(api, 'transaction 1', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:5 y:8
            └─┬ A GROUP id:0 x:5 y:8
            · ├─┬ B GROUP id:1 x:1 y:1
            · │ └── D LEAF id:2 x:1 y:1
            · └─┬ C filler id:row-group-0-A-1-C x:4 y:7
            · · ├── F LEAF id:4 x:2 y:3
            · · └── G LEAF id:5 x:2 y:4
        `);

        api.applyTransaction({ update: [{ ...rowData[4], x: 100, y: 100 }] });

        new TreeDiagram(api, 'transaction 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:103 y:105
            └─┬ A GROUP id:0 x:103 y:105
            · ├─┬ B GROUP id:1 x:1 y:1
            · │ └── D LEAF id:2 x:1 y:1
            · └─┬ C filler id:row-group-0-A-1-C x:102 y:104
            · · ├── F LEAF id:4 x:100 y:100
            · · └── G LEAF id:5 x:2 y:4
        `);

        api.setGridOption('alwaysAggregateAtRootLevel', false);

        new TreeDiagram(api, 'alwaysAggregateAtRootLevel=false', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 x:103 y:105
            · ├─┬ B GROUP id:1 x:1 y:1
            · │ └── D LEAF id:2 x:1 y:1
            · └─┬ C filler id:row-group-0-A-1-C x:102 y:104
            · · ├── F LEAF id:4 x:100 y:100
            · · └── G LEAF id:5 x:2 y:4
        `);

        api.setGridOption('alwaysAggregateAtRootLevel', true);

        new TreeDiagram(api, 'alwaysAggregateAtRootLevel=true', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:103 y:105
            └─┬ A GROUP id:0 x:103 y:105
            · ├─┬ B GROUP id:1 x:1 y:1
            · │ └── D LEAF id:2 x:1 y:1
            · └─┬ C filler id:row-group-0-A-1-C x:102 y:104
            · · ├── F LEAF id:4 x:100 y:100
            · · └── G LEAF id:5 x:2 y:4
        `);
    });
});
