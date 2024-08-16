import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { setTimeout as asyncSetTimeout } from 'timers/promises';

import { TreeDiagram } from './tree-test-utils';

const getDataPath = (data: any) => data.orgHierarchy;

describe('ag-grid tree data', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

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
        consoleWarnSpy?.mockRestore();
    });

    test('tree data async loading', async () => {
        const rowData1 = [{ id: '1', orgHierarchy: ['A', 'B'] }];
        const rowData2 = [{ id: '2', orgHierarchy: ['C', 'D'] }];

        const gridOptions: GridOptions = {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getDataPath,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        await asyncSetTimeout(1); // Simulate async loading

        api.setGridOption('rowData', rowData1);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A
            · └── B LEAF id:1
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:2
        `);
    });

    test('setting rowData without id keeps the tree data structure correct', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getDataPath,
        };

        const rowData1 = [
            { orgHierarchy: ['A', 'B'], x: 0 },
            { orgHierarchy: ['P', 'Q'], x: 1 },
            { orgHierarchy: ['C', 'D'], x: 2 },
            { orgHierarchy: ['P', 'R'], x: 3 },
        ];

        const rowData2 = [
            { orgHierarchy: ['D', 'E', 'F'], x: 4 },
            { orgHierarchy: ['D', 'E'], x: 5 },
            { orgHierarchy: ['P', 'R'], x: 6 },
            { orgHierarchy: ['P', 'Q'], x: 7 },
        ];

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', rowData1);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ └── B LEAF id:0
            ├─┬ P filler id:row-group-0-P
            │ ├── Q LEAF id:1
            │ └── R LEAF id:3
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:2
        `);

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ D filler id:row-group-0-D
            │ └─┬ E LEAF id:1
            │ · └── F LEAF id:0
            └─┬ P filler id:row-group-0-P
            · ├── R LEAF id:2
            · └── Q LEAF id:3
        `);

        api.setGridOption('rowData', []);

        new TreeDiagram(api).checkEmpty();
    });

    test('tree data is created in the right order after async loading with id', async () => {
        const rowData1 = [
            { id: '1', orgHierarchy: ['A', 'B'] },
            { id: '3', orgHierarchy: ['C', 'D'] },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData1,
            getDataPath,
            getRowId: (params) => params.data.id,
        };

        jest.useFakeTimers({ advanceTimers: true });

        const api = createMyGrid(gridOptions);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ └── B LEAF id:1
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:3
        `);

        api.setGridOption('rowData', rowData1);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ └── B LEAF id:1
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:3
        `);
    });

    test('tree data setRowData with id maintains selection and expanded state, and conservative ordering', async () => {
        const rowData1 = [
            { id: '1', orgHierarchy: ['A', 'B'], _diagramLabel: '1-v1' },
            { id: '3', orgHierarchy: ['C', 'D'], _diagramLabel: '3-v1' },
            { id: '4', orgHierarchy: ['P', 'Q'], _diagramLabel: '4-v1' },
            { id: '5', orgHierarchy: ['R', 'S'], _diagramLabel: '5-v1' },
            { id: '6', orgHierarchy: ['M'], _diagramLabel: '6-v1' },
            { id: '7', orgHierarchy: ['N'], _diagramLabel: '7-v1' },
        ];

        const rowData2 = [
            { id: '7', orgHierarchy: ['N'], _diagramLabel: '7-v2' },
            { id: '5', orgHierarchy: ['R', 'S'], _diagramLabel: '5-v2' },
            { id: '1', orgHierarchy: ['X', 'Y', 'Z'], x: 2, _diagramLabel: '1-v2' },
            { id: '2', orgHierarchy: ['X', 'Y'], x: 3, _diagramLabel: '2-v2' },
            { id: '4', orgHierarchy: ['P', 'Q'], _diagramLabel: '4-v2' },
            { id: '6', orgHierarchy: ['M'], _diagramLabel: '6-v2' },
        ];

        const rowData3 = [
            { id: '100', orgHierarchy: ['a'], _diagramLabel: '100-v3' },
            { id: '3', orgHierarchy: ['C', 'D'], _diagramLabel: '3-v3' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            selection: {
                mode: 'multiRow',
            },
            getDataPath,
            getRowId: (params) => params.data.id,
        };

        jest.useFakeTimers({ advanceTimers: true });

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', rowData1);

        // set B collapsed (a leaf)
        api.setRowNodeExpanded(api.getRowNode('1')!, false);

        // set P collapsed (a filler node group, that is going to be moved)
        api.setRowNodeExpanded(api.getRowNode('4')!.parent!, false);

        // set R collapsed (a filler node group, that is not going to be moved)
        api.setRowNodeExpanded(api.getRowNode('5')!.parent!, false);

        // Select all nodes
        api.selectAll();

        // We need to be sure all timers are flushed, as expanded state is throttled
        jest.advanceTimersByTime(10000);
        jest.useRealTimers();

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler selected id:row-group-0-A
            │ └── B LEAF selected !expanded id:1 label:1-v1
            ├─┬ C filler selected id:row-group-0-C
            │ └── D LEAF selected id:3 label:3-v1
            ├─┬ P filler selected !expanded id:row-group-0-P
            │ └── Q LEAF selected id:4 label:4-v1
            ├─┬ R filler selected !expanded id:row-group-0-R
            │ └── S LEAF selected id:5 label:5-v1
            ├── M LEAF selected id:6 label:6-v1
            └── N LEAF selected id:7 label:7-v1
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ P filler selected !expanded id:row-group-0-P
            │ └── Q LEAF selected id:4 label:4-v2
            ├─┬ R filler selected !expanded id:row-group-0-R
            │ └── S LEAF selected id:5 label:5-v2
            ├─┬ X filler id:row-group-0-X
            │ └─┬ Y LEAF id:2 label:2-v2
            │ · └── Z LEAF selected !expanded id:1 label:1-v2
            ├── N LEAF selected id:7 label:7-v2
            └── M LEAF selected id:6 label:6-v2
        `);

        api.setGridOption('rowData', rowData3);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ C filler id:row-group-0-C
            │ └── D LEAF id:3 label:3-v3
            └── a LEAF id:100 label:100-v3
        `);

        api.setGridOption('rowData', []);

        new TreeDiagram(api).checkEmpty();
    });
});
