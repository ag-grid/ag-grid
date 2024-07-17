import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getRowsSnapshot } from './row-snapshot-test-utils';
import type { RowSnapshot } from './row-snapshot-test-utils';

describe('ag-grid grouping tree data with groupRows', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function getAllRows(api: GridApi) {
        const rows: IRowNode<any>[] = [];
        api.forEachNode((node) => {
            rows.push(node);
        });
        return rows;
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
    });

    test('tree grouping rows snapshot', async () => {
        const rowData = [
            { orgHierarchy: ['A'] },
            { orgHierarchy: ['A', 'B'] },
            { orgHierarchy: ['C', 'D'] },
            { orgHierarchy: ['E', 'F', 'G', 'H'] },
        ];

        const getDataPath = (data: any) => data.orgHierarchy;

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
            groupDisplayType: 'groupRows',
        };

        const api = createMyGrid(gridOptions);

        const rows = getAllRows(api);

        expect(rows.length).toBe(8);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toEqual(rowData[0]);
        expect(rows[1].data).toEqual(rowData[1]);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowData[2]);
        expect(rows[4].data).toEqual(undefined);
        expect(rows[5].data).toEqual(undefined);
        expect(rows[6].data).toEqual(undefined);
        expect(rows[7].data).toEqual(rowData[3]);

        const expectedRowsSnapshots: RowSnapshot[] = [
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
                groupData: {},
                id: '0',
                key: 'A',
                lastChild: false,
                leafGroup: undefined,
                level: 1,
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
                groupData: {},
                id: '1',
                key: 'B',
                lastChild: true,
                leafGroup: undefined,
                level: 2,
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
                allChildrenCount: 1,
                allLeafChildren: ['D'],
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
                groupData: {},
                id: 'row-group-0-C',
                key: 'C',
                lastChild: false,
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
                groupData: {},
                id: '2',
                key: 'D',
                lastChild: true,
                leafGroup: undefined,
                level: 2,
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
                allChildrenCount: 3,
                allLeafChildren: ['H'],
                childIndex: 2,
                childrenAfterFilter: ['F'],
                childrenAfterGroup: ['F'],
                childrenAfterSort: ['F'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: true,
                groupData: {},
                id: 'row-group-0-E',
                key: 'E',
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
                rowIndex: 4,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: ['H'],
                childIndex: 0,
                childrenAfterFilter: ['G'],
                childrenAfterGroup: ['G'],
                childrenAfterSort: ['G'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: {},
                id: 'row-group-0-E-1-F',
                key: 'F',
                lastChild: true,
                leafGroup: false,
                level: 1,
                master: undefined,
                parentKey: 'E',
                rowGroupIndex: null,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 5,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: ['H'],
                childIndex: 0,
                childrenAfterFilter: ['H'],
                childrenAfterGroup: ['H'],
                childrenAfterSort: ['H'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: {},
                id: 'row-group-0-E-1-F-2-G',
                key: 'G',
                lastChild: true,
                leafGroup: false,
                level: 2,
                master: undefined,
                parentKey: 'F',
                rowGroupIndex: null,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 6,
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
                groupData: {},
                id: '3',
                key: 'H',
                lastChild: true,
                leafGroup: undefined,
                level: 4,
                master: false,
                parentKey: 'G',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 3,
                rowIndex: 7,
            },
        ];

        expect(rowsSnapshot).toMatchObject(expectedRowsSnapshots);
    });
});
