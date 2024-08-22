import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { cachedJSONObjects } from '../../../test-utils';
import { TreeDiagram } from '../tree-test-utils';
import type { TreeDiagramOptions } from '../tree-test-utils';

describe('ag-grid tree aggregation', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);
    });

    beforeEach(() => {
        jest.useRealTimers();
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
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

        const api = createMyGrid({
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter' },
                { field: 'x', aggFunc: 'sum' },
            ],
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
            stage: 'filter',
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
});
