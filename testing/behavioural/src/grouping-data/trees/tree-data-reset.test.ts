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

    test('setting rowData without id keeps the tree data structure correct', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getDataPath,
        };

        const rowData1 = [
            { orgHierarchy: ['A', 'B'], _diagramLabel: '1-v1' },
            { orgHierarchy: ['C', 'D'], _diagramLabel: '3-v1' },
        ];

        const rowData2 = [
            { orgHierarchy: ['D', 'E', 'F'], x: 2, _diagramLabel: '1-v2' },
            { orgHierarchy: ['D', 'E'], x: 3, _diagramLabel: '2-v1' },
        ];

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', rowData1);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A filler level:0 id:row-group-0-A
            │ └── B LEAF level:1 id:0 label:1-v1
            └─┬ C filler level:0 id:row-group-0-C
            · └── D LEAF level:1 id:1 label:3-v1
        `);

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            └─┬ D filler level:0 id:row-group-0-D
            · └─┬ E LEAF level:1 id:1 label:2-v1
            · · └── F LEAF level:2 id:0 label:1-v2
        `);
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
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            └─┬ A filler level:0 id:row-group-0-A
            · └── B LEAF level:1 id:1
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            └─┬ C filler level:0 id:row-group-0-C
            · └── D LEAF level:1 id:2
        `);
    });

    test('tree data setRowData with id maintains selection and expanded state', async () => {
        const rowData1 = [
            { id: '1', orgHierarchy: ['A', 'B'], _diagramLabel: '1-v1' },
            { id: '3', orgHierarchy: ['C', 'D'], _diagramLabel: '3-v1' },
            { id: '4', orgHierarchy: ['P', 'Q'], _diagramLabel: '4-v1' },
        ];

        const rowData2 = [
            { id: '1', orgHierarchy: ['X', 'Y', 'Z'], x: 2, _diagramLabel: '1-v2' },
            { id: '2', orgHierarchy: ['X', 'Y'], x: 3, _diagramLabel: '2-v1' },
            { id: '4', orgHierarchy: ['P', 'Q'], _diagramLabel: '4-v2' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        };

        jest.useFakeTimers();

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', rowData1);

        api.setRowNodeExpanded(api.getRowNode('1')!, false);
        api.setRowNodeExpanded(api.getRowNode('4')!.parent!, false);
        api.selectAll();

        // We need to be sure all timers are flushed, as expanded state is throttled
        jest.advanceTimersByTime(10000);
        jest.useRealTimers();

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A filler level:0 selected id:row-group-0-A
            │ └── B LEAF level:1 selected !expanded id:1 label:1-v1
            ├─┬ C filler level:0 selected id:row-group-0-C
            │ └── D LEAF level:1 selected id:3 label:3-v1
            └─┬ P filler level:0 selected !expanded id:row-group-0-P
            · └── Q LEAF level:1 selected id:4 label:4-v1
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ P filler level:0 selected !expanded id:row-group-0-P
            │ └── Q LEAF level:1 selected id:4 label:4-v2
            └─┬ X filler level:0 id:row-group-0-X
            · └─┬ Y LEAF level:1 id:2 label:2-v1
            · · └── Z LEAF level:2 selected !expanded id:1 label:1-v2
        `);
    });
});
