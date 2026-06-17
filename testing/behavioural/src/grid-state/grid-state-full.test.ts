import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';
import { VERSION } from '../version';

describe('Grid State Full Snapshot', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const defaultRowData = [
        { id: '1', name: 'Alice', age: 30, sport: 'Football' },
        { id: '2', name: 'Bob', age: 25, sport: 'Tennis' },
        { id: '3', name: 'Charlie', age: 35, sport: 'Golf' },
        { id: '4', name: 'David', age: 28, sport: 'Basketball' },
        { id: '5', name: 'Eve', age: 32, sport: 'Swimming' },
    ];

    const defaultColumnDefs = [{ field: 'id' }, { field: 'name' }, { field: 'age' }, { field: 'sport' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('validate no unexpected changes to State shape', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defaultColumnDefs,
            rowData: defaultRowData,
        });
        await new GridColumns(api, `validate no unexpected changes to State shape setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            ├── name "Name" width:200
            ├── age "Age" width:200
            └── sport "Sport" width:200
        `);
        await new GridRows(api, `validate no unexpected changes to State shape setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
            ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
            └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
        `);
        await asyncSetTimeout(1);

        expect(api.getState()).toEqual({
            aggregation: undefined,
            cellSelection: undefined,
            columnGroup: undefined,
            columnOrder: {
                orderedColIds: ['id', 'name', 'age', 'sport'],
            },
            columnPinning: undefined,
            columnSizing: {
                columnSizingModel: [
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'age',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'sport',
                        flex: undefined,
                        width: 200,
                    },
                ],
            },
            columnVisibility: undefined,
            filter: undefined,
            focusedCell: undefined,
            pagination: {
                page: 0,
                pageSize: 100,
            },
            pivot: undefined,
            rangeSelection: undefined,
            rowGroup: undefined,
            rowGroupExpansion: {
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [],
            },
            rowSelection: undefined,
            scroll: undefined,
            sideBar: {
                openToolPanel: null,
                position: undefined,
                toolPanels: {},
                visible: false,
            },
            sort: undefined,
            ssrmRowGroupExpansion: undefined,
            version: VERSION,
        });
        await new GridRows(api, `validate no unexpected changes to State shape final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
            ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
            └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
        `);
    });

    test('should get state with multiple features active', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'id', hide: false },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
            ],
            rowData: defaultRowData,
            rowSelection: { mode: 'multiRow' },
            pagination: true,
            paginationPageSize: 2,
            paginationPageSizeSelector: [2],
        });
        await new GridColumns(api, `should get state with multiple features active setup`).checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── id "Id" width:200
            ├── name "Name" width:200
            ├── age "Age" width:200
            └── sport "Sport" width:200 rowGroup
        `);
        await new GridRows(api, `should get state with multiple features active setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
            │ └── LEAF hidden id:0 id:"1" name:"Alice" age:30 sport:"Football"
            ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
            │ └── LEAF hidden id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
            ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
            │ └── LEAF hidden id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
            │ └── LEAF hidden id:3 id:"4" name:"David" age:28 sport:"Basketball"
            └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
            · └── LEAF hidden id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
        `);

        api.selectAll('filtered');
        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await new GridColumns(api, `should get state with multiple features active after applyColumnState`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── id "Id" width:200
                ├── name "Name" width:200 sort:asc
                ├── age "Age" width:200
                └── sport "Sport" width:200 rowGroup
            `);
        await new GridRows(api, `should get state with multiple features active after applyColumnState`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
            │ └── LEAF selected hidden id:0 id:"1" name:"Alice" age:30 sport:"Football"
            ├─┬ LEAF_GROUP selected collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
            │ └── LEAF selected hidden id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
            ├─┬ LEAF_GROUP selected collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
            │ └── LEAF selected hidden id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            ├─┬ LEAF_GROUP selected collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
            │ └── LEAF selected hidden id:3 id:"4" name:"David" age:28 sport:"Basketball"
            └─┬ LEAF_GROUP selected collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
            · └── LEAF selected hidden id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
        `);
        api.setColumnsVisible(['age'], false);
        await new GridColumns(api, `should get state with multiple features active after setColumnsVisible`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── id "Id" width:200
                ├── name "Name" width:200 sort:asc
                └── sport "Sport" width:200 rowGroup
            `);

        const state = api.getState();
        expect(state).toEqual({
            aggregation: undefined,
            cellSelection: undefined,
            columnGroup: undefined,
            columnOrder: {
                orderedColIds: ['ag-Grid-SelectionColumn', 'ag-Grid-AutoColumn', 'id', 'name', 'age', 'sport'],
            },
            columnPinning: undefined,
            columnSizing: {
                columnSizingModel: [
                    {
                        colId: 'ag-Grid-SelectionColumn',
                        flex: undefined,
                        width: 50,
                    },
                    {
                        colId: 'ag-Grid-AutoColumn',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'age',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'sport',
                        flex: undefined,
                        width: 200,
                    },
                ],
            },
            columnVisibility: {
                hiddenColIds: ['age'],
            },
            filter: undefined,
            pagination: {
                page: 0,
                pageSize: 2,
            },
            pivot: undefined,
            rowGroup: {
                groupColIds: ['sport'],
            },
            rowGroupExpansion: {
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [],
            },
            rowSelection: [
                'row-group-sport-Football',
                '0',
                'row-group-sport-Tennis',
                '1',
                'row-group-sport-Golf',
                '2',
                'row-group-sport-Basketball',
                '3',
                'row-group-sport-Swimming',
                '4',
            ],
            sideBar: {
                openToolPanel: null,
                position: undefined,
                toolPanels: {},
                visible: false,
            },
            sort: {
                sortModel: [
                    {
                        colId: 'name',
                        sort: 'asc',
                        type: 'default',
                    },
                ],
            },
            ssrmRowGroupExpansion: undefined,
            version: VERSION,
        });
    });
});
