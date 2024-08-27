import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TestGridsManager, cachedJSONObjects } from '../../../test-utils';
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

    test('aggregation and filter', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', x: 11, y: 1, path: ['A'] },
            { id: '2', name: 'Alan Turing', x: 12, y: 2, path: ['A', 'B'] },
            { id: '3', name: 'A. Church', x: 13, y: 3, path: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', x: 14, y: 4, path: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', x: 15, y: 5, path: ['A', 'B', 'E'] },
            { id: '6', name: 'Linus Torvalds', x: 16, y: 1, path: ['A', 'C', 'F'] },
            { id: '7', name: 'Brian Kernighan', x: 17, y: 2, path: ['A', 'C', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', x: 18, y: 3, path: ['A', 'C', 'H', 'I'] },
            { id: '9', name: 'E. Dijkstra', x: 19, y: 4, path: ['J'] },
            { id: '10', name: 'John Connor', x: 20, y: 5, path: ['J', 'K'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter' },
                { field: 'x', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                { field: 'y', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Path' },
            treeData: true,
            animateRows: false,
            rowSelection: 'multiple',
            alwaysAggregateAtRootLevel: true,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.path,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            columns: ['name', 'x', 'y'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:100
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:80 y:1
            │ ├─┬ B GROUP id:2 name:"Alan Turing" x:29 y:2
            │ │ ├── D LEAF id:4 name:"Donald Knuth" x:14 y:4
            │ │ └── E LEAF id:5 name:"Grace Hopper" x:15 y:5
            │ └─┬ C GROUP id:3 name:"A. Church" x:51 y:3
            │ · ├── F LEAF id:6 name:"Linus Torvalds" x:16 y:1
            │ · ├── G LEAF id:7 name:"Brian Kernighan" x:17 y:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:18
            │ · · └── I LEAF id:8 name:"Claude Elwood Shannon" x:18 y:3
            └─┬ J GROUP id:9 name:"E. Dijkstra" x:20 y:4
            · └── K LEAF id:10 name:"John Connor" x:20 y:5
        `);

        api.setFilterModel({
            y: { filterType: 'number', type: 'greaterThan', filter: 4 },
        });

        new TreeDiagram(api, 'filter greater than', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:35
            ├─┬ A GROUP id:1 name:"John Von Neumann" x:15 y:1
            │ └─┬ B GROUP id:2 name:"Alan Turing" x:15 y:2
            │ · └── E LEAF id:5 name:"Grace Hopper" x:15 y:5
            └─┬ J GROUP id:9 name:"E. Dijkstra" x:20 y:4
            · └── K LEAF id:10 name:"John Connor" x:20 y:5
        `);

        api.setFilterModel({
            y: { filterType: 'number', type: 'lessThan', filter: 2 },
        });

        new TreeDiagram(api, 'filter less than', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID x:80
            └─┬ A GROUP id:1 name:"John Von Neumann" x:80 y:1
            · ├─┬ B GROUP id:2 name:"Alan Turing" x:29 y:2
            · │ ├── D LEAF id:4 name:"Donald Knuth" x:14 y:4
            · │ └── E LEAF id:5 name:"Grace Hopper" x:15 y:5
            · └─┬ C GROUP id:3 name:"A. Church" x:51 y:3
            · · ├── F LEAF id:6 name:"Linus Torvalds" x:16 y:1
            · · ├── G LEAF id:7 name:"Brian Kernighan" x:17 y:2
            · · └─┬ H filler id:row-group-0-A-1-C-2-H x:18
            · · · └── I LEAF id:8 name:"Claude Elwood Shannon" x:18 y:3
        `);
    });
});
