import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getAllRows } from '../../test-utils';
import { getRowsSnapshot } from '../row-snapshot-test-utils';
import type { RowSnapshot } from '../row-snapshot-test-utils';
import { TreeDiagram, simpleHierarchyRowData, simpleHierarchyRowSnapshot } from './tree-test-utils';

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
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0
            │ └── B LEAF id:1
            ├─┬ C filler id:row-group-0-C
            │ └── D LEAF id:2
            └─┬ E filler id:row-group-0-E
            · └─┬ F filler id:row-group-0-E-1-F
            · · └─┬ G filler id:row-group-0-E-1-F-2-G
            · · · └── H LEAF id:3
        `);

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
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        const rows = getAllRows(api);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:2
            │ └── B LEAF id:0
            └─┬ C filler id:row-group-0-C
            · └─┬ D GROUP id:3
            · · └── E LEAF id:1`);

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
                expanded: false,
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
                expanded: false,
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
});
