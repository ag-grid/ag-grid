import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getAllRows } from '../../test-utils';
import { getRowsSnapshot } from '../row-snapshot-test-utils';
import type { RowSnapshot } from '../row-snapshot-test-utils';
import { TreeDiagram, findTreeRootNode, simpleHierarchyRowData, simpleHierarchyRowSnapshot } from './tree-test-utils';

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
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
        consoleWarnSpy?.mockRestore();
    });

    test('ag-grid tree data', async () => {
        const rowData = simpleHierarchyRowData();

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A LEAF level:0 id:0
            │ └── B LEAF level:1 id:1
            ├─┬ C filler level:0 id:row-group-0-C
            │ └── D LEAF level:1 id:2
            └─┬ E filler level:0 id:row-group-0-E
            · └─┬ F filler level:1 id:row-group-0-E-1-F
            · · └─┬ G filler level:2 id:row-group-0-E-1-F-2-G
            · · · └── H LEAF level:3 id:3`);

        const rows = getAllRows(api);

        expect(rows[0].data).toEqual(rowData[0]);
        expect(rows[1].data).toEqual(rowData[1]);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowData[2]);
        expect(rows[4].data).toEqual(undefined);
        expect(rows[5].data).toEqual(undefined);
        expect(rows[6].data).toEqual(undefined);
        expect(rows[7].data).toEqual(rowData[3]);

        const rowsSnapshot = getRowsSnapshot(rows);
        expect(rowsSnapshot).toMatchObject(simpleHierarchyRowSnapshot());
    });

    test('ag-grid tree data with inverted order', async () => {
        const rowData = [
            { orgHierarchy: ['A', 'B'] },
            { orgHierarchy: ['C', 'D', 'E'] },
            { orgHierarchy: ['A'] },
            { orgHierarchy: ['C', 'D'] },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        const rows = getAllRows(api);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A LEAF level:0 id:2
            │ └── B LEAF level:1 id:0
            └─┬ C filler level:0 id:row-group-0-C
            · └─┬ D LEAF level:1 id:3
            · · └── E LEAF level:2 id:1`);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toEqual(rowData[2]);
        expect(rows[1].data).toEqual(rowData[0]);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowData[3]);
        expect(rows[4].data).toEqual(rowData[1]);

        const expectedSnapshot: RowSnapshot[] = [
            {
                allChildrenCount: 1,
                allLeafChildren: ['B'],
                childIndex: 0,
                childrenAfterFilter: ['B'],
                childrenAfterGroup: ['B'],
                childrenAfterSort: ['B'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'A' },
                id: '2',
                key: 'A',
                lastChild: false,
                leafGroup: undefined,
                level: 0,
                master: false,
                parentKey: null,
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 0,
            },
            {
                allChildrenCount: null,
                allLeafChildren: [],
                childIndex: 0,
                childrenAfterFilter: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: { 'ag-Grid-AutoColumn': 'B' },
                id: '0',
                key: 'B',
                lastChild: true,
                leafGroup: undefined,
                level: 1,
                master: false,
                parentKey: 'A',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 1,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: ['E'],
                childIndex: 1,
                childrenAfterFilter: ['D'],
                childrenAfterGroup: ['D'],
                childrenAfterSort: ['D'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'C' },
                id: 'row-group-0-C',
                key: 'C',
                lastChild: true,
                leafGroup: false,
                level: 0,
                master: undefined,
                parentKey: null,
                rowGroupIndex: null,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 2,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: ['E'],
                childIndex: 0,
                childrenAfterFilter: ['E'],
                childrenAfterGroup: ['E'],
                childrenAfterSort: ['E'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'D' },
                id: '3',
                key: 'D',
                lastChild: true,
                leafGroup: undefined,
                level: 1,
                master: false,
                parentKey: 'C',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 3,
            },
            {
                allChildrenCount: null,
                allLeafChildren: [],
                childIndex: 0,
                childrenAfterFilter: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: { 'ag-Grid-AutoColumn': 'E' },
                id: '1',
                key: 'E',
                lastChild: true,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: 'D',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 4,
            },
        ];

        expect(rowsSnapshot).toMatchObject(expectedSnapshot);
    });

    test('duplicate group keys', async () => {
        const rowData = [
            { orgHierarchy: ['A', 'B'], x: 1, _diagramLabel: '1' },
            { orgHierarchy: ['A', 'B'], x: 2, _diagramLabel: '2' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [],
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
        };

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = createMyGrid(gridOptions);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: duplicate group keys for row data, keys should be unique',
            [rowData[0], rowData[1]]
        );
        consoleWarnSpy?.mockRestore();

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            └─┬ A filler level:0 id:row-group-0-A
            · └── B LEAF level:1 id:1 label:2
        `);

        const rows = getAllRows(api);

        expect(rows.length).toBe(2);
        expect(rows[0].data).toEqual(undefined);
        expect(rows[1].data).toEqual(rowData[1]);
    });

    test('tree data swtRowData without id keeps the structure correct', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [],
            treeData: true,
            animateRows: true,
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

    test('tree data setRowData with id maintains selection and expanded state', async () => {
        const rowData1 = [
            { id: '1', orgHierarchy: ['A', 'B'], _diagramLabel: '1-v1' },
            { id: '3', orgHierarchy: ['C', 'D'], _diagramLabel: '3-v1' },
        ];

        const rowData2 = [
            { id: '1', orgHierarchy: ['D', 'E', 'F'], x: 2, _diagramLabel: '1-v2' },
            { id: '2', orgHierarchy: ['D', 'E'], x: 3, _diagramLabel: '2-v1' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', rowData1);

        api.setRowNodeExpanded(api.getRowNode('1'), false);
        api.selectAll();

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A filler level:0 selected id:row-group-0-A
            │ └── B LEAF level:1 selected !expanded id:1 label:1-v1
            └─┬ C filler level:0 selected id:row-group-0-C
            · └── D LEAF level:1 selected id:3 label:3-v1
        `);

        api.setGridOption('rowData', rowData2);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            └─┬ D filler level:0 id:row-group-0-D
            · └─┬ E LEAF level:1 id:2 label:2-v1
            · · └── F LEAF level:2 selected !expanded id:1 label:1-v2
        `);
    });
});
