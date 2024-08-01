import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions, RowDataTransaction } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getAllRows } from '../../test-utils';
import { getRowsSnapshot } from '../row-snapshot-test-utils';
import { TreeDiagram } from './tree-test-utils';

describe('ag-grid tree transactions', () => {
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
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
    });

    // test.each(['sync', 'async'])

    test.only('ag-grid tree %s complex transaction', async (mode = 'sync') => {
        const rowA = { id: '0', orgHierarchy: ['A'] };

        const rowZ1 = { id: '88', orgHierarchy: ['X', 'Y', 'Z'] };

        const rowW = { id: '99', orgHierarchy: ['X', 'Y', 'Z', 'W'] };

        const rowZ2 = { id: '88', orgHierarchy: ['A', 'Y', 'Z'] };

        const rowB = { id: '1', orgHierarchy: ['A', 'B'] };
        const rowD = { id: '2', orgHierarchy: ['C', 'D'] };

        const rowH1 = { id: '3', orgHierarchy: ['X', 'Y', 'Z', 'H'] };
        const rowE = { id: '3', orgHierarchy: ['C', 'E'] };

        const getDataPath = (data: any) => data.orgHierarchy;

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'x' },
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
            rowData: [rowA, rowZ1],
            getRowId: (params) => params.data.id,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        const transactions: RowDataTransaction[] = [
            { add: [rowW] },
            { update: [rowZ2], add: [rowB, rowD] },
            { remove: [rowZ2], add: [rowH1] },
            { remove: [rowW], update: [rowE] },
        ];

        new TreeDiagram(api, 'rowData').check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├── A LEAF level:0 id:0
            └─┬ X filler level:0 id:row-group-0-X
            · └─┬ Y filler level:1 id:row-group-0-X-1-Y
            · · └── Z LEAF level:2 id:88
        `);

        if (mode === 'async') {
            const promises: Promise<void>[] = [];
            for (const transaction of transactions) {
                promises.push(
                    new Promise((resolve) => {
                        api.applyTransactionAsync(transaction, () => resolve());
                    })
                );
            }

            api.flushAsyncTransactions();
            await Promise.all(promises);
        } else {
            api.applyTransaction(transactions[0]);

            new TreeDiagram(api, 'Transaction 0').check(`
                ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
                ├── A LEAF level:0 id:0
                └─┬ X filler level:0 id:row-group-0-X
                · └─┬ Y filler level:1 id:row-group-0-X-1-Y
                · · └─┬ Z LEAF level:2 id:88
                · · · └── W LEAF level:3 id:99
            `);

            api.applyTransaction(transactions[1]);

            new TreeDiagram(api, 'Transaction 1').check(`
                ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
                ├─┬ A LEAF level:0 id:0
                │ ├─┬ Y filler level:1 id:row-group-0-A-1-Y
                │ │ └── Z LEAF level:2 id:88
                │ └── B LEAF level:1 id:1
                ├─┬ X filler level:0 id:row-group-0-X
                │ └─┬ Y filler level:1 id:row-group-0-X-1-Y
                │ · └─┬ Z filler level:2 id:row-group-0-X-1-Y-2-Z
                │ · · └── W LEAF level:3 id:99
                └─┬ C filler level:0 id:row-group-0-C
                · └── D LEAF level:1 id:2
            `);

            api.applyTransaction(transactions[2]);

            new TreeDiagram(api, 'Transaction 2').check(`
                ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
                ├─┬ A LEAF level:0 id:0
                │ └── B LEAF level:1 id:1
                ├─┬ X filler level:0 id:row-group-0-X
                │ └─┬ Y filler level:1 id:row-group-0-X-1-Y
                │ · └─┬ Z filler level:2 id:row-group-0-X-1-Y-2-Z
                │ · · ├── W LEAF level:3 id:99
                │ · · └── H LEAF level:3 id:3
                └─┬ C filler level:0 id:row-group-0-C
                · └── D LEAF level:1 id:2
            `);

            api.applyTransaction(transactions[3]);
        }

        new TreeDiagram(api, 'final').check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A LEAF level:0 id:0
            │ └── B LEAF level:1 id:1
            └─┬ C filler level:0 id:row-group-0-C
            · ├── D LEAF level:1 id:2
            · └── E LEAF level:1 id:3
        `);

        const rows = getAllRows(api);

        expect(rows.length).toBe(5);

        expect(rows[0].data).toEqual(rowA);
        expect(rows[1].data).toEqual(rowB);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowD);
        expect(rows[4].data).toEqual(rowE);

        const rowsSnapshot = getRowsSnapshot(rows);
        expect(rowsSnapshot).toMatchObject([
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
                id: '0',
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
                id: '1',
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
                allLeafChildren: ['D', 'E'],
                childIndex: 1,
                childrenAfterFilter: ['D', 'E'],
                childrenAfterGroup: ['D', 'E'],
                childrenAfterSort: ['D', 'E'],
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
                groupData: { 'ag-Grid-AutoColumn': 'D' },
                id: '2',
                key: 'D',
                lastChild: false,
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
                childIndex: 1,
                childrenAfterFilter: [],
                childrenAfterGroup: [],
                childrenAfterSort: [],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: false,
                groupData: { 'ag-Grid-AutoColumn': 'E' },
                id: '3',
                key: 'E',
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
                rowIndex: 4,
            },
        ]);
    });
});
