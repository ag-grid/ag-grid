import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getRowsSnapshot } from '../row-snapshot-test-utils';
import type { RowSnapshot } from '../row-snapshot-test-utils';

describe('ag-grid grouping simple data', () => {
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

    test('simple grouping rows snapshot', async () => {
        const rowData = [
            { country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            groupDefaultExpanded: -1,
            rowData,
        };

        const api = createMyGrid(gridOptions);

        const rows = getAllRows(api);

        expect(rows.length).toBe(11);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toBeUndefined();
        expect(rows[1].data).toBeUndefined();
        expect(rows[2].data).toBe(rowData[0]);
        expect(rows[3].data).toBe(rowData[1]);
        expect(rows[4].data).toBeUndefined();
        expect(rows[5].data).toBe(rowData[2]);
        expect(rows[6].data).toBeUndefined();
        expect(rows[7].data).toBeUndefined();
        expect(rows[8].data).toBe(rowData[3]);
        expect(rows[9].data).toBeUndefined();
        expect(rows[10].data).toBe(rowData[4]);

        const expectedRowsSnapshots: RowSnapshot[] = [
            {
                allChildrenCount: 3,
                allLeafChildren: [null, null, null],
                childIndex: 0,
                childrenAfterFilter: ['2000', '2001'],
                childrenAfterGroup: ['2000', '2001'],
                childrenAfterSort: ['2000', '2001'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'Ireland' },
                id: 'row-group-country-Ireland',
                key: 'Ireland',
                lastChild: false,
                leafGroup: false,
                level: 0,
                master: undefined,
                parentKey: null,
                rowGroupIndex: 0,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 0,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: [null, null],
                childIndex: 0,
                childrenAfterFilter: [null, null],
                childrenAfterGroup: [null, null],
                childrenAfterSort: [null, null],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2000' },
                id: 'row-group-country-Ireland-year-2000',
                key: '2000',
                lastChild: false,
                leafGroup: true,
                level: 1,
                master: undefined,
                parentKey: 'Ireland',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 1,
            },
            {
                allChildrenCount: undefined,
                allLeafChildren: undefined,
                childIndex: 0,
                childrenAfterFilter: undefined,
                childrenAfterGroup: undefined,
                childrenAfterSort: undefined,
                detail: undefined,
                displayed: true,
                expanded: false,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: undefined,
                id: '0',
                key: null,
                lastChild: false,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 2,
            },
            {
                allChildrenCount: undefined,
                allLeafChildren: undefined,
                childIndex: 1,
                childrenAfterFilter: undefined,
                childrenAfterGroup: undefined,
                childrenAfterSort: undefined,
                detail: undefined,
                displayed: true,
                expanded: false,
                firstChild: false,
                footer: undefined,
                group: false,
                groupData: undefined,
                id: '1',
                key: null,
                lastChild: true,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 3,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childIndex: 1,
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2001' },
                id: 'row-group-country-Ireland-year-2001',
                key: '2001',
                lastChild: true,
                leafGroup: true,
                level: 1,
                master: undefined,
                parentKey: 'Ireland',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 4,
            },
            {
                allChildrenCount: undefined,
                allLeafChildren: undefined,
                childIndex: 0,
                childrenAfterFilter: undefined,
                childrenAfterGroup: undefined,
                childrenAfterSort: undefined,
                detail: undefined,
                displayed: true,
                expanded: false,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: undefined,
                id: '2',
                key: null,
                lastChild: true,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2001',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 5,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: [null, null],
                childIndex: 1,
                childrenAfterFilter: ['2000', '2001'],
                childrenAfterGroup: ['2000', '2001'],
                childrenAfterSort: ['2000', '2001'],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'Italy' },
                id: 'row-group-country-Italy',
                key: 'Italy',
                lastChild: true,
                leafGroup: false,
                level: 0,
                master: undefined,
                parentKey: null,
                rowGroupIndex: 0,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 6,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childIndex: 0,
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2000' },
                id: 'row-group-country-Italy-year-2000',
                key: '2000',
                lastChild: false,
                leafGroup: true,
                level: 1,
                master: undefined,
                parentKey: 'Italy',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 7,
            },
            {
                allChildrenCount: undefined,
                allLeafChildren: undefined,
                childIndex: 0,
                childrenAfterFilter: undefined,
                childrenAfterGroup: undefined,
                childrenAfterSort: undefined,
                detail: undefined,
                displayed: true,
                expanded: false,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: undefined,
                id: '3',
                key: null,
                lastChild: true,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 8,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childIndex: 1,
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                firstChild: false,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2001' },
                id: 'row-group-country-Italy-year-2001',
                key: '2001',
                lastChild: true,
                leafGroup: true,
                level: 1,
                master: undefined,
                parentKey: 'Italy',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 9,
            },
            {
                allChildrenCount: undefined,
                allLeafChildren: undefined,
                childIndex: 0,
                childrenAfterFilter: undefined,
                childrenAfterGroup: undefined,
                childrenAfterSort: undefined,
                detail: undefined,
                displayed: true,
                expanded: false,
                firstChild: true,
                footer: undefined,
                group: false,
                groupData: undefined,
                id: '4',
                key: null,
                lastChild: true,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2001',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 10,
            },
        ];

        expect(rowsSnapshot).toMatchObject(expectedRowsSnapshots);
    });
});
