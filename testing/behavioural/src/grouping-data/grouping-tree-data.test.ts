import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { rowSnapshot } from './row-snapshot-test-utils';
import type { RowSnapshot } from './row-snapshot-test-utils';

describe('ag-grid grouping tree data', () => {
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

        expect(rows.length).toBe(8);

        const rowsSnapshot = rows.map(rowSnapshot);

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
                rowIndex: 0,
                key: 'A',
                id: '0',
                master: false,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: true,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: undefined,
                firstChild: true,
                lastChild: false,
                level: 1,
                uiLevel: 0,
                rowGroupIndex: undefined,
                parentKey: null,
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: 1,
                allLeafChildren: ['B'],
                childrenAfterGroup: ['B'],
                childrenAfterSort: ['B'],
                childrenAfterFilter: ['B'],
            },
            {
                rowIndex: 1,
                key: 'B',
                id: '1',
                master: false,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: false,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: undefined,
                firstChild: true,
                lastChild: true,
                level: 2,
                uiLevel: 1,
                rowGroupIndex: undefined,
                parentKey: 'A',
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: null,
                allLeafChildren: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                childrenAfterFilter: [],
            },
            {
                rowIndex: 2,
                key: 'C',
                id: 'row-group-0-C',
                master: undefined,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: true,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: false,
                firstChild: false,
                lastChild: false,
                level: 0,
                uiLevel: 0,
                rowGroupIndex: null,
                parentKey: null,
                siblingKey: undefined,
                childIndex: 1,
                allChildrenCount: 1,
                allLeafChildren: ['D'],
                childrenAfterGroup: ['D'],
                childrenAfterSort: ['D'],
                childrenAfterFilter: ['D'],
            },
            {
                rowIndex: 3,
                key: 'D',
                id: '2',
                master: false,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: false,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: undefined,
                firstChild: true,
                lastChild: true,
                level: 2,
                uiLevel: 1,
                rowGroupIndex: undefined,
                parentKey: 'C',
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: null,
                allLeafChildren: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                childrenAfterFilter: [],
            },
            {
                rowIndex: 4,
                key: 'E',
                id: 'row-group-0-E',
                master: undefined,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: true,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: false,
                firstChild: false,
                lastChild: true,
                level: 0,
                uiLevel: 0,
                rowGroupIndex: null,
                parentKey: null,
                siblingKey: undefined,
                childIndex: 2,
                allChildrenCount: 3,
                allLeafChildren: ['H'],
                childrenAfterGroup: ['F'],
                childrenAfterSort: ['F'],
                childrenAfterFilter: ['F'],
            },
            {
                rowIndex: 5,
                key: 'F',
                id: 'row-group-0-E-1-F',
                master: undefined,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: true,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: false,
                firstChild: true,
                lastChild: true,
                level: 1,
                uiLevel: 1,
                rowGroupIndex: null,
                parentKey: 'E',
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: 2,
                allLeafChildren: ['H'],
                childrenAfterGroup: ['G'],
                childrenAfterSort: ['G'],
                childrenAfterFilter: ['G'],
            },
            {
                rowIndex: 6,
                key: 'G',
                id: 'row-group-0-E-1-F-2-G',
                master: undefined,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: true,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: false,
                firstChild: true,
                lastChild: true,
                level: 2,
                uiLevel: 2,
                rowGroupIndex: null,
                parentKey: 'F',
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: 1,
                allLeafChildren: ['H'],
                childrenAfterGroup: ['H'],
                childrenAfterSort: ['H'],
                childrenAfterFilter: ['H'],
            },
            {
                rowIndex: 7,
                key: 'H',
                id: '3',
                master: false,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: false,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: undefined,
                firstChild: true,
                lastChild: true,
                level: 4,
                uiLevel: 3,
                rowGroupIndex: undefined,
                parentKey: 'G',
                siblingKey: undefined,
                childIndex: 0,
                allChildrenCount: null,
                allLeafChildren: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                childrenAfterFilter: [],
            },
        ];

        expect(rowsSnapshot).toMatchObject(expectedRowsSnapshots);
    });
});
