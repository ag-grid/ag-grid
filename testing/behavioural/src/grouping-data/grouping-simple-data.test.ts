import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { RowSnapshot } from '../test-utils';
import {
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    cachedJSONObjects,
    getRowsSnapshot,
    setRowDataChecked,
} from '../test-utils';

describe('ag-grid grouping simple data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
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

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:0 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            │ │ └── LEAF id:1 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:"2001"
            │ · └── LEAF id:2 country:"Ireland" year:"2001" athlete:"Alan Turing"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:"2000"
            · │ └── LEAF id:3 country:"Italy" year:"2000" athlete:"Donald Knuth"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:"2001"
            · · └── LEAF id:4 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);

        const rows = gridRows.rowNodes;
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
                master: false,
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
                master: false,
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
                allLeafChildren: null,
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
                groupData: null,
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
                allLeafChildren: null,
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
                groupData: null,
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
                master: false,
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
                allLeafChildren: null,
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
                groupData: null,
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
                master: false,
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
                master: false,
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
                allLeafChildren: null,
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
                groupData: null,
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
                master: false,
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
                allLeafChildren: null,
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
                groupData: null,
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

    test('can change an entire group without row id', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        setRowDataChecked(api, [
            { id: '0', country: 'Ireland', year: 2000, name: 'John Von Neumann' },
            { id: '1', country: 'Ireland', year: 2000, name: 'Ada Lovelace' },
            { id: '2', country: 'Ireland', year: 2001, name: 'Alan Turing' },
            { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
        ]);

        let gridRows = new GridRows(api, 'first');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        setRowDataChecked(api, [
            { id: '0', country: 'Germany', year: 2000, name: 'John Von Neumann' },
            { id: '1', country: 'Germany', year: 2000, name: 'Ada Lovelace' },
            { id: '2', country: 'Germany', year: 2001, name: 'Alan Turing' },
            { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
        ]);

        gridRows = new GridRows(api, 'update 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2000 ag-Grid-AutoColumn:2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Germany" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Germany" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-year-2001 ag-Grid-AutoColumn:2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Germany" year:2001
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);
    });

    test('initializing columns after rowData with grouping module registered', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '2', value: 2, x: 20 },
            { id: '3', value: 3, x: 30 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            └── LEAF id:3 value:3
        `);

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'x' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(2);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 x:10
            ├── LEAF id:2 value:2 x:20
            └── LEAF id:3 value:3 x:30
        `);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '4', value: 4, x: 40 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(3);

        api.setGridOption('columnDefs', [{ field: 'x' }, { field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(4);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:10 value:1
            └── LEAF id:4 x:40 value:4
        `);
    });

    test('initializing columns after rowData with simple grouping', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '0', country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { id: '1', country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { id: '2', country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { id: '3', country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'athlete' },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:0 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            │ │ └── LEAF id:1 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:"2001"
            │ · └── LEAF id:2 country:"Ireland" year:"2001" athlete:"Alan Turing"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:"2000"
            · │ └── LEAF id:3 country:"Italy" year:"2000" athlete:"Donald Knuth"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:"2001"
            · · └── LEAF id:4 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);
    });

    test('updateGridOptions simultaneously updates rowData and grouping columns', async () => {
        const rowData0 = [
            { id: '0', country: 'France', year: '2000', athlete: 'Noether' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
        ];

        const columns0: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country' },
            { colId: 'year', field: 'year' },
        ];

        const rowData1 = [
            { id: '0', country: 'Ireland', year: '2000', athlete: 'John Von Neumann' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
            { id: '2', country: 'Italy', year: '2000', athlete: 'Donald Knuth' },
        ];

        const columns1: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country', rowGroup: true },
            { colId: 'year', field: 'year' },
        ];

        const rowData2 = [
            { id: '0', country: 'Ireland', year: '2000', athlete: 'John Von Neumann' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
            { id: '2', country: 'France', year: '2003', athlete: 'Donald Knuth' },
        ];

        const columns2: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country', rowGroup: true },
            { colId: 'year', field: 'year', rowGroup: true },
        ];

        const api = gridsManager.createGrid('update-options', {
            animateRows: false,
            getRowId: (params) => params.data.id,
            groupDefaultExpanded: -1,
        });

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData0),
            columnDefs: cachedJSONObjects.array(columns0),
        });

        let gridRows = new GridRows(api, 'update rowData + grouping');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Noether" country:"France" year:"2000"
            └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
        `);

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData1),
            columnDefs: cachedJSONObjects.array(columns1),
        });

        gridRows = new GridRows(api, 'update rowData + grouping 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:0 athlete:"John Von Neumann" country:"Ireland" year:"2000"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 athlete:"Donald Knuth" country:"Italy" year:"2000"
        `);

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData2),
            columnDefs: cachedJSONObjects.array(columns2),
        });

        gridRows = new GridRows(api, 'update rowData + grouping 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ · └── LEAF id:0 athlete:"John Von Neumann" country:"Ireland" year:"2000"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├─┬ LEAF_GROUP id:row-group-country-France-year-2001 ag-Grid-AutoColumn:"2001"
            · │ └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2003 ag-Grid-AutoColumn:"2003"
            · · └── LEAF id:2 athlete:"Donald Knuth" country:"France" year:"2003"
        `);
    });

    test('initializing columns after initializing with a transaction with grouping module registered', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        applyTransactionChecked(api, {
            add: [
                { id: '1', value: 0 },
                { id: '2', value: 2 },
            ],
        });

        applyTransactionChecked(api, {
            update: [{ id: '1', value: 1 }],
            add: [{ id: '3', value: 3 }],
        });

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'data').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 value_1:1
            ├── LEAF id:2 value:2 value_1:2
            └── LEAF id:3 value:3 value_1:3
        `);
    });

    test('changing group columns updates the row groups', async () => {
        const rowData = [
            { id: 'A', x: 'a', z: 1, group: 'Group1' },
            { id: 'B', x: 'a-b', z: 2, group: 'Group1' },
            { id: 'C', x: 'c', z: 3, group: 'Group2' },
            { id: 'D', x: 'c-d', z: 4, group: 'Group2' },
            { id: 'E', x: 'e', z: 5, group: 'Group3' },
            { id: 'F', x: 'e-f', z: 6, group: 'Group3' },
            { id: 'G', x: 'e-f-g', z: 7, group: 'Group3' },
            { id: 'H', x: 'e-f-g-h', z: 8, group: 'Group3' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'x' }, { field: 'z' }],
            animateRows: false,
            groupDefaultExpanded: -1,
            autoGroupColumnDef: { headerName: 'Group' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'x1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A group:"Group1" x:"a" z:1
            │ └── LEAF id:B group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C group:"Group2" x:"c" z:3
            │ └── LEAF id:D group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E group:"Group3" x:"e" z:5
            · ├── LEAF id:F group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H group:"Group3" x:"e-f-g-h" z:8
        `);

        api.updateGridOptions({
            autoGroupColumnDef: { headerName: 'Group', field: 'group' },
        });

        await new GridRows(api, 'x2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A ag-Grid-AutoColumn:"Group1" group:"Group1" x:"a" z:1
            │ └── LEAF id:B ag-Grid-AutoColumn:"Group1" group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C ag-Grid-AutoColumn:"Group2" group:"Group2" x:"c" z:3
            │ └── LEAF id:D ag-Grid-AutoColumn:"Group2" group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e" z:5
            · ├── LEAF id:F ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f-g-h" z:8
        `);

        api.setGridOption('autoGroupColumnDef', { headerName: 'Group', field: 'z' });

        await new GridRows(api, 'x3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A ag-Grid-AutoColumn:1 group:"Group1" x:"a" z:1
            │ └── LEAF id:B ag-Grid-AutoColumn:2 group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C ag-Grid-AutoColumn:3 group:"Group2" x:"c" z:3
            │ └── LEAF id:D ag-Grid-AutoColumn:4 group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E ag-Grid-AutoColumn:5 group:"Group3" x:"e" z:5
            · ├── LEAF id:F ag-Grid-AutoColumn:6 group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G ag-Grid-AutoColumn:7 group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H ag-Grid-AutoColumn:8 group:"Group3" x:"e-f-g-h" z:8
        `);
    });

    test('blank group rows and footers display blank labels', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData: [
                { id: '0', country: '', year: '2000', athlete: 'No Country 1' },
                { id: '1', country: '', year: '2001', athlete: 'No Country 2' },
                { id: '2', country: 'Ireland', year: '2000', athlete: 'Ada Lovelace' },
            ],
        };

        const api = gridsManager.createGrid('blank-groups', gridOptions);
        const gridRows = new GridRows(api, 'blank groups');

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:2 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ │ └─ footer id:rowGroupFooter_row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"Total 2000"
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland"
            └─┬ filler id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
            · ├─┬ LEAF_GROUP id:row-group-country--year-2000 ag-Grid-AutoColumn:"2000"
            · │ ├── LEAF id:0 country:"" year:"2000" athlete:"No Country 1"
            · │ └─ footer id:rowGroupFooter_row-group-country--year-2000 ag-Grid-AutoColumn:"Total 2000"
            · ├─┬ LEAF_GROUP id:row-group-country--year-2001 ag-Grid-AutoColumn:"2001"
            · │ ├── LEAF id:1 country:"" year:"2001" athlete:"No Country 2"
            · │ └─ footer id:rowGroupFooter_row-group-country--year-2001 ag-Grid-AutoColumn:"Total 2001"
            · └─ footer id:rowGroupFooter_row-group-country- ag-Grid-AutoColumn:"Total (Blanks)"
        `);
    });

    test('deep group hierarchy', async () => {
        // Create a deep hierarchy: Level1 -> Level2 -> Level3 -> Level4 -> Level5
        const rowData = [
            { id: '1', l1: 'A', l2: 'A1', l3: 'A1a', l4: 'A1a1', l5: 'A1a1i', name: 'Deep Item 1' },
            { id: '2', l1: 'A', l2: 'A1', l3: 'A1a', l4: 'A1a1', l5: 'A1a1ii', name: 'Deep Item 2' },
            { id: '3', l1: 'A', l2: 'A1', l3: 'A1b', l4: 'A1b1', l5: 'A1b1i', name: 'Deep Item 3' },
            { id: '4', l1: 'B', l2: 'B1', l3: 'B1a', l4: 'B1a1', l5: 'B1a1i', name: 'Deep Item 4' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'l1', rowGroup: true, hide: true },
                { field: 'l2', rowGroup: true, hide: true },
                { field: 'l3', rowGroup: true, hide: true },
                { field: 'l4', rowGroup: true, hide: true },
                { field: 'l5', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Deep Hierarchy' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'deep hierarchy').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-l1-A ag-Grid-AutoColumn:"A"
            │ └─┬ filler id:row-group-l1-A-l2-A1 ag-Grid-AutoColumn:"A1"
            │ · ├─┬ filler id:row-group-l1-A-l2-A1-l3-A1a ag-Grid-AutoColumn:"A1a"
            │ · │ └─┬ filler id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1 ag-Grid-AutoColumn:"A1a1"
            │ · │ · ├─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1-l5-A1a1i ag-Grid-AutoColumn:"A1a1i"
            │ · │ · │ └── LEAF id:1 l1:"A" l2:"A1" l3:"A1a" l4:"A1a1" l5:"A1a1i" name:"Deep Item 1"
            │ · │ · └─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1-l5-A1a1ii ag-Grid-AutoColumn:"A1a1ii"
            │ · │ · · └── LEAF id:2 l1:"A" l2:"A1" l3:"A1a" l4:"A1a1" l5:"A1a1ii" name:"Deep Item 2"
            │ · └─┬ filler id:row-group-l1-A-l2-A1-l3-A1b ag-Grid-AutoColumn:"A1b"
            │ · · └─┬ filler id:row-group-l1-A-l2-A1-l3-A1b-l4-A1b1 ag-Grid-AutoColumn:"A1b1"
            │ · · · └─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1b-l4-A1b1-l5-A1b1i ag-Grid-AutoColumn:"A1b1i"
            │ · · · · └── LEAF id:3 l1:"A" l2:"A1" l3:"A1b" l4:"A1b1" l5:"A1b1i" name:"Deep Item 3"
            └─┬ filler id:row-group-l1-B ag-Grid-AutoColumn:"B"
            · └─┬ filler id:row-group-l1-B-l2-B1 ag-Grid-AutoColumn:"B1"
            · · └─┬ filler id:row-group-l1-B-l2-B1-l3-B1a ag-Grid-AutoColumn:"B1a"
            · · · └─┬ filler id:row-group-l1-B-l2-B1-l3-B1a-l4-B1a1 ag-Grid-AutoColumn:"B1a1"
            · · · · └─┬ LEAF_GROUP id:row-group-l1-B-l2-B1-l3-B1a-l4-B1a1-l5-B1a1i ag-Grid-AutoColumn:"B1a1i"
            · · · · · └── LEAF id:4 l1:"B" l2:"B1" l3:"B1a" l4:"B1a1" l5:"B1a1i" name:"Deep Item 4"
        `);
    });
});
