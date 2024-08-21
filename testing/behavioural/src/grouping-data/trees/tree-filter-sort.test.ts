import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { DomMutationWaiter } from '../../test-utils';
import { TreeDiagram } from './tree-test-utils';
import type { TreeDiagramOptions } from './tree-test-utils';

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

        const domMutationWaiter = new DomMutationWaiter({ element: 'myGrid' });

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

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ ├── D LEAF name:"Donald Knuth"
            · │ └── E LEAF name:"Grace Hopper"
            · └── C LEAF name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'filter 1', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └── C LEAF name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'filter 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Alan Turing"
            · · └── E LEAF name:"Grace Hopper"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Donald Knuth' } });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'filter 3', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · └─┬ B GROUP name:"Alan Turing"
            · · └── D LEAF name:"Donald Knuth"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'not existing' } });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'filter 4', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
        `);

        api.setFilterModel({});

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'filter 5', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP name:"John Von Neumann"
            · ├─┬ B GROUP name:"Alan Turing"
            · │ ├── D LEAF name:"Donald Knuth"
            · │ └── E LEAF name:"Grace Hopper"
            · └── C LEAF name:"A. Church"
        `);

        domMutationWaiter.stop();
    });

    test('tree with sort', async () => {
        const rowData = [
            { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
            { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            { id: '3', value: 15, x: 1, orgHierarchy: ['A', 'C'] },
            { id: '4', value: 13, x: 1, orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', value: 11, x: 0, orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', value: 10, x: 0, orgHierarchy: ['A', 'F'] },
        ];

        const domMutationWaiter = new DomMutationWaiter({ element: 'myGrid' });

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

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └── F LEAF value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc' }],
        });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'sort value asc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├── F LEAF value:10 x:0
            · ├── C LEAF value:15 x:1
            · └─┬ B GROUP value:17 x:1
            · · ├── E LEAF value:11 x:0
            · · └── D LEAF value:13 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'desc' }],
        });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'sort value desc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └── F LEAF value:10 x:0
        `);

        api.applyColumnState({
            state: [
                { colId: 'value', sort: null },
                { colId: 'x', sort: 'asc' },
            ],
        });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'sort x asc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├── F LEAF value:10 x:0
            · ├─┬ B GROUP value:17 x:1
            · │ ├── E LEAF value:11 x:0
            · │ └── D LEAF value:13 x:1
            · └── C LEAF value:15 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'desc' }],
        });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'sort x desc', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ ├── D LEAF value:13 x:1
            · │ └── E LEAF value:11 x:0
            · ├── C LEAF value:15 x:1
            · └── F LEAF value:10 x:0
        `);

        api.setFilterModel({ x: { type: 'equals', filter: 0 } });

        await domMutationWaiter.wait();

        new TreeDiagram(api, 'sort x desc, filter x===0', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├─┬ B GROUP value:17 x:1
            · │ └── E LEAF value:11 x:0
            · └── F LEAF value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'asc' }],
        });

        new TreeDiagram(api, 'sort x desc, filter x===0', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT
            └─┬ A GROUP value:12 x:1
            · ├── F LEAF value:10 x:0
            · └─┬ B GROUP value:17 x:1
            · · └── E LEAF value:11 x:0
        `);

        domMutationWaiter.stop();
    });
});
