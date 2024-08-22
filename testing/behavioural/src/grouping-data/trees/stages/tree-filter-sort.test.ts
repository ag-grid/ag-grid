import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { cachedJSONObjects } from '../../../test-utils';
import { TreeDiagram } from '../tree-test-utils';
import type { TreeDiagramOptions } from '../tree-test-utils';

describe('ag-grid tree filter', () => {
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

    test('tree with custom filter', async () => {
        const rowData = [
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
        ];

        const api = createMyGrid({
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            stage: 'filter',
            includeId: false,
            columns: ['name'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ ├── D LEAF name:"Donald Knuth"
            · │ └── E LEAF name:"Grace Hopper"
            · └── C LEAF name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        new TreeDiagram(api, 'filter 1', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └── C LEAF name:"A. Church"
        `);

        api.setGridOption('rowData', [
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '5', name: 'A. Church', orgHierarchy: ['A', 'B', 'E'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
        ]);

        new TreeDiagram(api, 'filter 1 rowData 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ └── E LEAF name:"A. Church"
            · └── C LEAF name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        api.setGridOption('rowData', rowData);

        new TreeDiagram(api, 'filter 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Alan Turing"
            · · └── E LEAF name:"Grace Hopper"
        `);

        api.setGridOption('rowData', [
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Grace Hopper', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C', 'J'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E', 'W'] },
            { id: '6', name: 'unknown', orgHierarchy: ['A', 'C', 'K'] },
        ]);

        new TreeDiagram(api, 'filter 2 rowData 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Grace Hopper"
            · · ├── D LEAF name:"Donald Knuth"
            · · └─┬ E filler
            · · · └── W LEAF name:"Grace Hopper"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Donald Knuth' } });

        new TreeDiagram(api, 'filter 3 rowData 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Grace Hopper"
            · · └── D LEAF name:"Donald Knuth"
        `);

        api.setGridOption('rowData', rowData);

        new TreeDiagram(api, 'filter 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Alan Turing"
            · · └── D LEAF name:"Donald Knuth"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Kurt Gödel' } });

        new TreeDiagram(api, 'filter 4', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
        `);

        api.setGridOption('rowData', [
            { id: '1', name: 'Kurt Gödel', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
        ]);

        new TreeDiagram(api, 'filter 4 rowData 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"Kurt Gödel"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ ├── D LEAF name:"Donald Knuth"
            · │ └── E LEAF name:"Grace Hopper"
            · └── C LEAF name:"A. Church"
        `);

        api.setFilterModel({});

        api.setGridOption('rowData', rowData);

        new TreeDiagram(api, 'no filter', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ ├── D LEAF name:"Donald Knuth"
            · │ └── E LEAF name:"Grace Hopper"
            · └── C LEAF name:"A. Church"
        `);
    });

    test('tree with sort', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
            { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            { id: '3', value: 15, x: 1, orgHierarchy: ['A', 'C'] },
            { id: '4', value: 13, x: 1, orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', value: 11, x: 0, orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', value: 10, x: 0, orgHierarchy: ['A', 'F', 'G'] },
            { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
        ]);

        const api = createMyGrid({
            columnDefs: [
                { field: 'value', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
                { field: 'x', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const treeDiagramOptions: TreeDiagramOptions = {
            stage: 'sort',
            includeId: false,
            columns: ['value', 'x'],
            checkDom: 'myGrid',
        };

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └─┬ F filler
            · · ├── G LEAF value:10 x:0
            · · └── H LEAF value:16 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc' }],
        });

        new TreeDiagram(api, 'sort value asc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ F filler
            · │ ├── G LEAF value:10 x:0
            · │ └── H LEAF value:16 x:1
            · ├── C LEAF value:15 x:1
            · └─┬ B GROUP value:17 x:1
            · · ├── E LEAF value:11 x:0
            · · └── D LEAF value:13 x:1
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
                { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
                { id: '6', value: 10, x: 0, orgHierarchy: ['A', 'F', 'G'] },
                { id: '3', value: 15, x: 1, orgHierarchy: ['A', 'C'] },
                { id: '5', value: 11, x: 0, orgHierarchy: ['A', 'B', 'e'] },
                { id: '4', value: 13, x: 1, orgHierarchy: ['A', 'B', 'd'] },
                { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            ])
        );

        new TreeDiagram(api, 'sort value asc rowData 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ F filler
            · │ ├── G LEAF value:10 x:0
            · │ └── H LEAF value:16 x:1
            · ├── C LEAF value:15 x:1
            · └─┬ B GROUP value:17 x:1
            · · ├── e LEAF value:11 x:0
            · · └── d LEAF value:13 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'desc' }],
        });

        new TreeDiagram(api, 'sort value desc  rowData 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── d LEAF value:13 x:1
            · │ └── e LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └─┬ F filler
            · · ├── H LEAF value:16 x:1
            · · └── G LEAF value:10 x:0
        `);

        api.setGridOption('rowData', rowData);

        new TreeDiagram(api, 'sort value desc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └─┬ F filler
            · · ├── H LEAF value:16 x:1
            · · └── G LEAF value:10 x:0
        `);

        api.applyColumnState({
            state: [
                { colId: 'value', sort: null },
                { colId: 'x', sort: 'asc' },
            ],
        });

        new TreeDiagram(api, 'sort x asc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ F filler
            · │ ├── G LEAF value:10 x:0
            · │ └── H LEAF value:16 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── E LEAF value:11 x:0
            · │ └── D LEAF value:13 x:1
            · └── C LEAF value:15 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'desc' }],
        });

        new TreeDiagram(api, 'sort x desc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └─┬ F filler
            · · ├── H LEAF value:16 x:1
            · · └── G LEAF value:10 x:0
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
                { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
                { id: '6', value: 10, x: 1, orgHierarchy: ['A', 'F', 'G'] },
                { id: '3', value: 15, x: 0, orgHierarchy: ['A', 'C'] },
                { id: '5', value: 11, x: 1, orgHierarchy: ['A', 'B', 'E'] },
                { id: '4', value: 13, x: 0, orgHierarchy: ['A', 'B', 'D'] },
                { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            ])
        );

        new TreeDiagram(api, 'sort x desc rowData 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── E LEAF value:11 x:1
            · │ └── D LEAF value:13 x:0
            · ├── C LEAF value:15 x:0
            · └─┬ F filler
            · · ├── H LEAF value:16 x:1
            · · └── G LEAF value:10 x:1
        `);

        api.setFilterModel({ x: { type: 'equals', filter: 0 } });

        new TreeDiagram(api, 'sort x desc, filter x===0, rowData 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ └── D LEAF value:13 x:0
            · └── C LEAF value:15 x:0
        `);

        api.setGridOption('rowData', rowData);

        new TreeDiagram(api, 'sort x desc, filter x===0, rowData 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ └── E LEAF value:11 x:0
            · └─┬ F filler
            · · └── G LEAF value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'asc' }],
        });

        new TreeDiagram(api, 'sort x desc, filter x===0', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ F filler
            · │ └── G LEAF value:10 x:0
            · └─┬ B GROUP value:17 x:1
            · · └── E LEAF value:11 x:0
        `);
    });
});
