import type { GridState, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';

describe('StateService - Grid State Management', () => {
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

    // ===== COLUMN STATE TESTS =====
    describe('Column State', () => {
        test('should capture column order state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture column order state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture column order state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().columnOrder).toEqual({ orderedColIds: ['id', 'name', 'age', 'sport'] });

            // Apply column order
            api.applyColumnState({
                state: [{ colId: 'sport' }, { colId: 'id' }, { colId: 'name' }, { colId: 'age' }],
                applyOrder: true,
            });
            await new GridColumns(api, `should capture column order state after applyColumnState`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                ├── id "Id" width:200
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `should capture column order state after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"Football" id:"1" name:"Alice" age:30
                ├── LEAF id:1 sport:"Tennis" id:"2" name:"Bob" age:25
                ├── LEAF id:2 sport:"Golf" id:"3" name:"Charlie" age:35
                ├── LEAF id:3 sport:"Basketball" id:"4" name:"David" age:28
                └── LEAF id:4 sport:"Swimming" id:"5" name:"Eve" age:32
            `);

            expect(api.getState().columnOrder).toEqual({ orderedColIds: ['sport', 'id', 'name', 'age'] });
        });

        test('should capture column visibility state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture column visibility state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture column visibility state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().columnVisibility).toBeUndefined();

            // Hide a column
            api.setColumnsVisible(['age'], false);
            await new GridColumns(api, `should capture column visibility state after setColumnsVisible`).checkColumns(
                `
                    CENTER
                    ├── id "Id" width:200
                    ├── name "Name" width:200
                    └── sport "Sport" width:200
                `
            );

            expect(api.getState().columnVisibility).toEqual({ hiddenColIds: ['age'] });
        });

        test('should capture column sizing state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture column sizing state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture column sizing state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Set column width
            api.setColumnWidths([{ key: 'name', newWidth: 222 }]);
            await new GridColumns(api, `should capture column sizing state after setColumnWidths`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:222
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);

            expect(api.getState().columnSizing).toEqual({
                columnSizingModel: [
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 222,
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
            });
        });

        test('should capture column pinning state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture column pinning state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture column pinning state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Pin column
            api.applyColumnState({
                state: [
                    { colId: 'id', pinned: 'left' },
                    { colId: 'age', pinned: 'right' },
                ],
            });
            await new GridColumns(api, `should capture column pinning state after applyColumnState`).checkColumns(`
                LEFT
                └── id "Id" width:200
                CENTER
                ├── name "Name" width:200
                └── sport "Sport" width:200
                RIGHT
                └── age "Age" width:200
            `);
            await new GridRows(api, `should capture column pinning state after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().columnPinning).toEqual({ leftColIds: ['id'], rightColIds: ['age'] });
        });

        test('should capture sort state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture sort state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture sort state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Apply sort
            api.applyColumnState({
                state: [
                    { colId: 'name', sort: 'asc' },
                    { colId: 'age', sort: 'desc', sortType: 'absolute' },
                ],
            });
            await new GridColumns(api, `should capture sort state after applyColumnState`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200 sort:asc
                ├── age "Age" width:200 sort:desc
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture sort state after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().sort?.sortModel).toEqual([
                {
                    colId: 'name',
                    sort: 'asc',
                    type: 'default',
                },
                {
                    colId: 'age',
                    sort: 'desc',
                    type: 'absolute',
                },
            ]);
        });

        test('should capture row group state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture row group state setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── id "Id" width:200
                ├── sport "Sport" width:200 rowGroup
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `should capture row group state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                │ └── LEAF hidden id:0 id:"1" sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                │ └── LEAF hidden id:1 id:"2" sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                │ └── LEAF hidden id:2 id:"3" sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                │ └── LEAF hidden id:3 id:"4" sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · └── LEAF hidden id:4 id:"5" sport:"Swimming" name:"Eve" age:32
            `);

            expect(api.getState().rowGroup).toEqual({
                groupColIds: ['sport'],
            });
            await new GridRows(api, `should capture row group state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                │ └── LEAF hidden id:0 id:"1" sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                │ └── LEAF hidden id:1 id:"2" sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                │ └── LEAF hidden id:2 id:"3" sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                │ └── LEAF hidden id:3 id:"4" sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · └── LEAF hidden id:4 id:"5" sport:"Swimming" name:"Eve" age:32
            `);
        });

        test('should capture aggregation state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'age', hide: false, aggFunc: 'sum' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture aggregation state setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── id "Id" width:200
                ├── sport "Sport" width:200 rowGroup
                └── age "Age" width:200 aggFunc:sum
            `);
            await new GridRows(api, `should capture aggregation state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football" age:30
                │ └── LEAF hidden id:0 id:"1" sport:"Football" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis" age:25
                │ └── LEAF hidden id:1 id:"2" sport:"Tennis" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf" age:35
                │ └── LEAF hidden id:2 id:"3" sport:"Golf" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball" age:28
                │ └── LEAF hidden id:3 id:"4" sport:"Basketball" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming" age:32
                · └── LEAF hidden id:4 id:"5" sport:"Swimming" age:32
            `);

            expect(api.getState().aggregation).toEqual({
                aggregationModel: [
                    {
                        aggFunc: 'sum',
                        colId: 'age',
                    },
                ],
            });
            await new GridRows(api, `should capture aggregation state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football" age:30
                │ └── LEAF hidden id:0 id:"1" sport:"Football" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis" age:25
                │ └── LEAF hidden id:1 id:"2" sport:"Tennis" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf" age:35
                │ └── LEAF hidden id:2 id:"3" sport:"Golf" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball" age:28
                │ └── LEAF hidden id:3 id:"4" sport:"Basketball" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming" age:32
                · └── LEAF hidden id:4 id:"5" sport:"Swimming" age:32
            `);
        });

        test('should capture pivot state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false },
                { field: 'name', hide: false },
                { field: 'age', hide: false, aggFunc: 'sum' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture pivot state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── sport "Sport" width:200
                ├── name "Name" width:200
                └── age "Age" width:200 aggFunc:sum
            `);
            await new GridRows(api, `should capture pivot state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" sport:"Football" name:"Alice" age:30
                ├── LEAF id:1 id:"2" sport:"Tennis" name:"Bob" age:25
                ├── LEAF id:2 id:"3" sport:"Golf" name:"Charlie" age:35
                ├── LEAF id:3 id:"4" sport:"Basketball" name:"David" age:28
                └── LEAF id:4 id:"5" sport:"Swimming" name:"Eve" age:32
            `);

            // Apply pivot state via setState
            api.setState({
                pivot: {
                    pivotMode: true,
                    pivotColIds: ['sport'],
                },
            });

            expect(api.getState().pivot).toEqual({
                pivotColIds: ['sport'],
                pivotMode: true,
            });
            await new GridRows(api, `should capture pivot state final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('should capture column group state', async () => {
            const columnDefs = [
                {
                    headerName: 'Name & Country',
                    children: [{ field: 'athlete' }, { field: 'country' }],
                },
                {
                    headerName: 'Sports Results',
                    groupId: 'sportsGroup',
                    children: [
                        { columnGroupShow: 'closed', field: 'total' },
                        { columnGroupShow: 'open', field: 'gold' },
                        { columnGroupShow: 'open', field: 'silver' },
                        { columnGroupShow: 'open', field: 'bronze' },
                    ],
                },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture column group state setup`).checkColumns(`
                CENTER
                ├─┬ "Name & Country" GROUP
                │ ├── athlete "Athlete" width:200
                │ └── country "Country" width:200
                └─┬ "Sports Results" GROUP closed
                  ├── total "Total" width:200 columnGroupShow:closed
                  ├── gold "Gold" width:200 columnGroupShow:open hidden
                  ├── silver "Silver" width:200 columnGroupShow:open hidden
                  └── bronze "Bronze" width:200 columnGroupShow:open hidden
            `);
            await new GridRows(api, `should capture column group state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                ├── LEAF id:1
                ├── LEAF id:2
                ├── LEAF id:3
                └── LEAF id:4
            `);

            expect(api.getState().columnGroup).toEqual(undefined);

            // Open a group
            api.setColumnGroupOpened('sportsGroup', true);
            await new GridColumns(api, `should capture column group state after setColumnGroupOpened`).checkColumns(`
                CENTER
                ├─┬ "Name & Country" GROUP
                │ ├── athlete "Athlete" width:200
                │ └── country "Country" width:200
                └─┬ "Sports Results" GROUP open
                  ├── total "Total" width:200 columnGroupShow:closed hidden
                  ├── gold "Gold" width:200 columnGroupShow:open
                  ├── silver "Silver" width:200 columnGroupShow:open
                  └── bronze "Bronze" width:200 columnGroupShow:open
            `);

            expect(api.getState().columnGroup).toEqual({
                openColumnGroupIds: ['sportsGroup'],
            });

            // Collapse a group
            api.setColumnGroupOpened('sportsGroup', false);
            await new GridColumns(api, `should capture column group state after setColumnGroupOpened #2`).checkColumns(
                `
                    CENTER
                    ├─┬ "Name & Country" GROUP
                    │ ├── athlete "Athlete" width:200
                    │ └── country "Country" width:200
                    └─┬ "Sports Results" GROUP closed
                      ├── total "Total" width:200 columnGroupShow:closed
                      ├── gold "Gold" width:200 columnGroupShow:open hidden
                      ├── silver "Silver" width:200 columnGroupShow:open hidden
                      └── bronze "Bronze" width:200 columnGroupShow:open hidden
                `
            );
            expect(api.getState().columnGroup).toEqual(undefined);
        });

        test('should restore an open generated-id group from saved state', async () => {
            // A generated-id (positional) group gets the same id when rebuilt from identical colDefs,
            // so an open one round-trips through saved state like an explicit-id group would.
            const columnDefs = [
                { headerName: 'G', children: [{ field: 'athlete' }, { field: 'country', columnGroupShow: 'open' }] },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });

            // The sole group carries a generated (numeric) id — no groupId was provided.
            const groupId = api.getColumnGroupState()[0].groupId;
            expect(/^\d+$/.test(groupId)).toBe(true);

            api.setColumnGroupOpened(groupId, true);
            const savedState = api.getState();
            expect(savedState.columnGroup).toEqual({ openColumnGroupIds: [groupId] });

            // Restore into a fresh grid from identical colDefs: the same positional id is regenerated.
            const api2 = gridsManager.createGrid('target', {
                columnDefs,
                rowData: defaultRowData,
                initialState: savedState,
            });

            expect(api2.getState().columnGroup).toEqual({ openColumnGroupIds: [groupId] });
            expect(api2.getColumnGroupState()[0].open).toBe(true);
        });
    });

    // ===== ROW STATE TESTS =====
    describe('Row State', () => {
        test('should capture row selection state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
            });
            await new GridColumns(api, `should capture row selection state setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture row selection state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Apply row selection via setState
            api.setState({
                rowSelection: ['0', '2'],
            });

            expect(api.getState().rowSelection).toEqual(['0', '2']);
            await new GridRows(api, `should capture row selection state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF selected id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF selected id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });

        test('CSRM: getState captures rowGroupExpansion, setState restores it', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
            ];
            const api = gridsManager.createGrid('source', {
                columnDefs,
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
            });
            await new GridColumns(api, `CSRM: getState captures rowGroupExpansion, setState restores it setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── id "Id" width:200
                    ├── sport "Sport" width:200 rowGroup
                    ├── name "Name" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `CSRM: getState captures rowGroupExpansion, setState restores it setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                │ └── LEAF hidden id:1 id:"1" sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                │ └── LEAF hidden id:2 id:"2" sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                │ └── LEAF hidden id:3 id:"3" sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                │ └── LEAF hidden id:4 id:"4" sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · └── LEAF hidden id:5 id:"5" sport:"Swimming" name:"Eve" age:32
            `);

            // Initially all groups collapsed
            expect(api.getState().rowGroupExpansion).toEqual({
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [],
            });
            expect(api.getState().ssrmRowGroupExpansion).toBeUndefined();

            api.expandAll();
            await new GridRows(api, `CSRM: getState captures rowGroupExpansion, setState restores it after expandAll`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                    │ └── LEAF id:1 id:"1" sport:"Football" name:"Alice" age:30
                    ├─┬ LEAF_GROUP id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                    │ └── LEAF id:2 id:"2" sport:"Tennis" name:"Bob" age:25
                    ├─┬ LEAF_GROUP id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                    │ └── LEAF id:3 id:"3" sport:"Golf" name:"Charlie" age:35
                    ├─┬ LEAF_GROUP id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                    │ └── LEAF id:4 id:"4" sport:"Basketball" name:"David" age:28
                    └─┬ LEAF_GROUP id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · └── LEAF id:5 id:"5" sport:"Swimming" name:"Eve" age:32
                `);

            const savedState = api.getState();
            expect(savedState.rowGroupExpansion).toEqual({
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [
                    'row-group-sport-Football',
                    'row-group-sport-Tennis',
                    'row-group-sport-Golf',
                    'row-group-sport-Basketball',
                    'row-group-sport-Swimming',
                ],
            });
            expect(savedState.ssrmRowGroupExpansion).toBeUndefined();

            // Restore into a fresh grid
            const api2 = gridsManager.createGrid('target', {
                columnDefs,
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
                initialState: savedState,
            });

            expect(api2.getState().rowGroupExpansion).toEqual(savedState.rowGroupExpansion);
        });

        test('SSRM: getState captures rowGroupExpansion, setState restores it', async () => {
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', country: 'Ireland' },
                                { id: 'fr', country: 'France' },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 5 }],
                        });
                    }
                },
            };

            const api = gridsManager.createGrid('ssrmSource', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide',
                serverSideDatasource: datasource,
                getRowId: ({ data }) => data.id,
            });
            await new GridColumns(api, `SSRM: getState captures rowGroupExpansion, setState restores it setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── medals "Medals" width:200
                `);
            await new GridRows(api, `SSRM: getState captures rowGroupExpansion, setState restores it setup`).check(`
                ROOT id:<no-id>
                └── LEAF_GROUP collapsed id:rowIndex:0
            `);

            await waitForNoLoadingRows(api);

            // Without ssrmExpandAllAffectsAllRows, SSRM uses rowGroupExpansion (same as CSRM)
            expect(api.getState().rowGroupExpansion).toEqual({ expandedRowGroupIds: [], collapsedRowGroupIds: [] });
            expect(api.getState().ssrmRowGroupExpansion).toBeUndefined();

            // Expand Ireland
            api.setRowNodeExpanded(api.getRowNode('ie')!, true);
            await new GridRows(
                api,
                `SSRM: getState captures rowGroupExpansion, setState restores it after setRowNodeExpanded`
            ).check(`
                ROOT id:<no-id>
                ├─┬ GROUP-leafGroup id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                │ └── filler id:rowIndex:1
                └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
            `);
            await waitForNoLoadingRows(api);

            const savedState = api.getState();
            expect(savedState.rowGroupExpansion).toEqual({
                expandedRowGroupIds: ['ie'],
                collapsedRowGroupIds: [],
            });
            expect(savedState.ssrmRowGroupExpansion).toBeUndefined();

            // Collapse Ireland
            api.setRowNodeExpanded(api.getRowNode('ie')!, false);
            await new GridRows(
                api,
                `SSRM: getState captures rowGroupExpansion, setState restores it after setRowNodeExpanded #2`
            ).check(`
                ROOT id:<no-id>
                ├── GROUP-leafGroup collapsed id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
            `);
            expect(api.getRowNode('ie')!.expanded).toBe(false);

            // Restore the saved state
            api.setState(savedState);
            await waitForNoLoadingRows(api);

            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getState().rowGroupExpansion).toEqual(savedState.rowGroupExpansion);
        });

        test('SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState restores it', async () => {
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', key: 'Ireland', country: 'Ireland', group: true },
                                { id: 'fr', key: 'France', country: 'France', group: true },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 1 }],
                        });
                    }
                },
            };

            const gridOpts = {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide' as const,
                serverSideDatasource: datasource,
                getRowId: ({ data }: any) => data.id,
                ssrmExpandAllAffectsAllRows: true,
            };

            const api = gridsManager.createGrid('ssrmBulkSource', gridOpts);
            await new GridColumns(
                api,
                `SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState  setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── medals "Medals" width:200
            `);
            await new GridRows(
                api,
                `SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState  setup`
            ).check(`
                ROOT id:<no-id>
                └── LEAF_GROUP collapsed id:rowIndex:0
            `);
            await waitForNoLoadingRows(api);

            // Expand all — switches to ExpandAllStrategy
            api.expandAll();
            await new GridRows(
                api,
                `SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState  after expandAll`
            ).check(`
                ROOT id:<no-id>
                ├─┬ GROUP-leafGroup id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                │ └── filler id:rowIndex:1
                └─┬ GROUP-leafGroup id:fr ag-Grid-AutoColumn:"France" country:"France"
                · └── filler id:rowIndex:3
            `);
            await waitForNoLoadingRows(api);

            // Collapse France individually — recorded as an exception in ExpandAllStrategy
            api.setRowNodeExpanded(api.getRowNode('fr')!, false);
            await new GridRows(
                api,
                `SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState  after setRowNodeExpanded`
            ).check(`
                ROOT id:<no-id>
                ├─┬ GROUP-leafGroup id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                │ └── LEAF id:Ireland-leaf country:"Ireland" medals:1
                └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
            `);
            await asyncSetTimeout(0); // allow debounced state update to flush

            const savedState = api.getState();
            expect(savedState.ssrmRowGroupExpansion).toEqual({
                expandAll: true,
                invertedRowGroupIds: ['fr'],
            });
            expect(savedState.rowGroupExpansion).toBeUndefined();

            // Collapse all to reset state
            api.collapseAll();
            await new GridRows(
                api,
                `SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState  after collapseAll`
            ).check(`
                ROOT id:<no-id>
                ├── GROUP-leafGroup collapsed id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
            `);
            expect(api.getRowNode('ie')!.expanded).toBe(false);
            expect(api.getRowNode('fr')!.expanded).toBe(false);

            // Restore saved state — previously broken (ssrmRowGroupExpansion was ignored)
            api.setState(savedState);
            await waitForNoLoadingRows(api);

            // Ireland should be expanded (expandAll: true), France collapsed (in invertedRowGroupIds)
            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getRowNode('fr')!.expanded).toBe(false);
        });

        test('SSRM expandAll strategy: initialState with ssrmRowGroupExpansion restores on grid creation', async () => {
            // Tests the gridInitializing path: ssrmRowGroupExpansion must be checked (not just
            // rowGroupExpansion) when deciding whether to call setRowGroupExpansionState.
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', country: 'Ireland' },
                                { id: 'fr', country: 'France' },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 1 }],
                        });
                    }
                },
            };

            const gridOpts = {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide' as const,
                serverSideDatasource: datasource,
                getRowId: ({ data }: any) => data.id,
                ssrmExpandAllAffectsAllRows: true,
                initialState: {
                    ssrmRowGroupExpansion: { expandAll: true, invertedRowGroupIds: ['fr'] },
                },
            };

            const api = gridsManager.createGrid('ssrmBulkInit', gridOpts);
            await new GridColumns(
                api,
                `SSRM expandAll strategy: initialState with ssrmRowGroupExpansion restores on gri setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── medals "Medals" width:200
            `);
            await new GridRows(
                api,
                `SSRM expandAll strategy: initialState with ssrmRowGroupExpansion restores on gri setup`
            ).check(`
                ROOT id:<no-id>
                └── LEAF_GROUP collapsed id:rowIndex:0
            `);
            await waitForNoLoadingRows(api);

            // Ireland should be expanded (expandAll: true), France collapsed (in invertedRowGroupIds)
            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getRowNode('fr')!.expanded).toBe(false);
            await new GridRows(
                api,
                `SSRM expandAll strategy: initialState with ssrmRowGroupExpansion restores on gri final state`
            ).check(`
                ROOT id:<no-id>
                ├─┬ GROUP-leafGroup id:ie ag-Grid-AutoColumn:"Ireland" country:"Ireland"
                │ └── LEAF id:Ireland-leaf country:"Ireland" medals:1
                └── GROUP-leafGroup collapsed id:fr ag-Grid-AutoColumn:"France" country:"France"
            `);
        });

        test('CSRM: getState reflects new node IDs after group column change via setGridOption', async () => {
            // columnRowGroupChanged fires while changeEventsDispatching=true (before CSRM re-groups),
            // so expansion state must be refreshed on newColumnsLoaded instead.
            const api = gridsManager.createGrid('csrmRegroup', {
                columnDefs: [
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'name', rowGroup: false, hide: true },
                    { field: 'age' },
                ],
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
            });
            await new GridColumns(
                api,
                `CSRM: getState reflects new node IDs after group column change via setGridOption setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `CSRM: getState reflects new node IDs after group column change via setGridOption setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                │ └── LEAF hidden id:1 sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                │ └── LEAF hidden id:2 sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                │ └── LEAF hidden id:3 sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                │ └── LEAF hidden id:4 sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · └── LEAF hidden id:5 sport:"Swimming" name:"Eve" age:32
            `);

            // expandAll uses the synchronous onGroupExpandedOrCollapsed path
            api.expandAll();
            await new GridRows(
                api,
                `CSRM: getState reflects new node IDs after group column change via setGridOption after expandAll`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-sport-Football ag-Grid-AutoColumn:"Football"
                │ └── LEAF id:1 sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP id:row-group-sport-Tennis ag-Grid-AutoColumn:"Tennis"
                │ └── LEAF id:2 sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP id:row-group-sport-Golf ag-Grid-AutoColumn:"Golf"
                │ └── LEAF id:3 sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP id:row-group-sport-Basketball ag-Grid-AutoColumn:"Basketball"
                │ └── LEAF id:4 sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · └── LEAF id:5 sport:"Swimming" name:"Eve" age:32
            `);
            await asyncSetTimeout(0);
            expect(api.getState().rowGroupExpansion?.expandedRowGroupIds).toContain('row-group-sport-Football');

            // Switch grouping to name — all sport-based IDs are gone
            api.setGridOption('columnDefs', [
                { field: 'sport', rowGroup: false, hide: true },
                { field: 'name', rowGroup: true, hide: true },
                { field: 'age' },
            ]);
            await new GridColumns(
                api,
                `CSRM: getState reflects new node IDs after group column change via setGridOption after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `CSRM: getState reflects new node IDs after group column change via setGridOption after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-name-Alice ag-Grid-AutoColumn:"Alice"
                │ └── LEAF hidden id:1 sport:"Football" name:"Alice" age:30
                ├─┬ LEAF_GROUP collapsed id:row-group-name-Bob ag-Grid-AutoColumn:"Bob"
                │ └── LEAF hidden id:2 sport:"Tennis" name:"Bob" age:25
                ├─┬ LEAF_GROUP collapsed id:row-group-name-Charlie ag-Grid-AutoColumn:"Charlie"
                │ └── LEAF hidden id:3 sport:"Golf" name:"Charlie" age:35
                ├─┬ LEAF_GROUP collapsed id:row-group-name-David ag-Grid-AutoColumn:"David"
                │ └── LEAF hidden id:4 sport:"Basketball" name:"David" age:28
                └─┬ LEAF_GROUP collapsed id:row-group-name-Eve ag-Grid-AutoColumn:"Eve"
                · └── LEAF hidden id:5 sport:"Swimming" name:"Eve" age:32
            `);
            await asyncSetTimeout(0);

            // Cached state must reflect the new name-based IDs, not stale sport-based IDs
            const expansion = api.getState().rowGroupExpansion;
            expect(expansion?.expandedRowGroupIds).not.toContain('row-group-sport-Football');
        });

        test('should capture pagination state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });
            await new GridColumns(api, `should capture pagination state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture pagination state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Go to page 2
            api.paginationGoToPage(1);
            expect(api.getState().pagination).toEqual({
                page: 1,
                pageSize: 2,
            });
            api.paginationGoToLastPage();
            expect(api.getState().pagination).toEqual({
                page: 2,
                pageSize: 2,
            });
            api.paginationGoToFirstPage();
            expect(api.getState().pagination).toEqual({
                page: 0,
                pageSize: 2,
            });
            api.paginationGoToNextPage();
            expect(api.getState().pagination).toEqual({
                page: 1,
                pageSize: 2,
            });
            api.paginationGoToPreviousPage();
            expect(api.getState().pagination).toEqual({
                page: 0,
                pageSize: 2,
            });
            await new GridRows(api, `should capture pagination state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });

        test('should capture row pinning state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                enableRowPinning: true,
            });
            await new GridColumns(api, `should capture row pinning state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture row pinning state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Apply row pinning state
            api.setState({
                rowPinning: {
                    top: ['0'],
                    bottom: ['1'],
                },
            });

            expect(api.getState().rowPinning).toEqual({ bottom: ['1'], top: ['0'] });
            await new GridRows(api, `should capture row pinning state final state`).check(`
                PINNED_TOP id:t-top-0 id:"1" name:"Alice" age:30 sport:"Football"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                PINNED_BOTTOM id:b-bottom-1 id:"2" name:"Bob" age:25 sport:"Tennis"
            `);
        });

        test('should capture filter state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agTextColumnFilter' },
            });
            await new GridColumns(api, `should capture filter state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture filter state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().filter).toBeUndefined();

            // Apply filter - using the filter manager API
            api.setFilterModel({
                name: { filterType: 'text', type: 'startsWith', filter: 'A' },
            });
            await new GridRows(api, `should capture filter state after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            `);

            await asyncSetTimeout(50);

            expect(api.getState().filter).toEqual({
                advancedFilterModel: undefined,
                columnFilterState: undefined,
                filterModel: {
                    name: {
                        filter: 'A',
                        filterType: 'text',
                        type: 'startsWith',
                    },
                },
                selectableFilters: undefined,
            });
        });

        test('setState with an empty filter state clears active filters', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agTextColumnFilter' },
            });

            // Apply a filter and capture the state with filters active
            api.setFilterModel({ name: { filterType: 'text', type: 'startsWith', filter: 'A' } });
            await asyncSetTimeout(50);
            const stateWithFilter = api.getState();

            // Clear filters and capture the state with no filters
            api.setFilterModel(null);
            await asyncSetTimeout(50);
            const stateWithoutFilter = api.getState();
            expect(stateWithoutFilter.filter).toBeUndefined();

            // Restore the filtered state
            api.setState(stateWithFilter);
            await asyncSetTimeout(50);
            await new GridRows(api, `setState restores filter`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            `);

            // Restoring the empty state must clear the active filters
            api.setState(stateWithoutFilter);
            await asyncSetTimeout(50);
            await new GridRows(api, `setState clears filter`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });

        test('setState with an empty state clears active selectable filters', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agSelectableColumnFilter' },
                sideBar: 'filters-new',
                enableFilterHandlers: true,
            });
            await asyncSetTimeout(50);

            // Activate a selectable filter via state restore
            api.setState({ filter: { selectableFilters: { name: 0 } } });
            await asyncSetTimeout(50);
            expect(api.getState().filter?.selectableFilters).toEqual({ name: 0 });

            // Restoring a state without a filter section must clear the active selectable filter
            api.setState({});
            await asyncSetTimeout(50);
            expect(api.getState().filter).toBeUndefined();
        });

        test('should serialise bigint filter state and rehydrate on setState', async () => {
            const columnDefs = [{ field: 'id', cellDataType: 'bigint', filter: 'agBigIntColumnFilter' }];
            const rowData = [{ id: 1n }, { id: 2n }, { id: 3n }];

            const api = gridsManager.createGrid('bigIntStateSource', {
                columnDefs,
                rowData,
            });
            await new GridColumns(api, `should serialise bigint filter state and rehydrate on setState setup`)
                .checkColumns(`
                    CENTER
                    └── id "Id" width:200
                `);
            await new GridRows(api, `should serialise bigint filter state and rehydrate on setState setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1n"
                ├── LEAF id:1 id:"2n"
                └── LEAF id:2 id:"3n"
            `);

            api.setFilterModel({
                id: { filterType: 'bigint', type: 'equals', filter: '2n' },
            });
            await new GridRows(
                api,
                `should serialise bigint filter state and rehydrate on setState after setFilterModel`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 id:"2n"
            `);

            await asyncSetTimeout(20);

            const savedState = api.getState();
            expect(savedState.filter?.filterModel?.id?.filter).toBe('2n');

            const api2 = gridsManager.createGrid('bigIntStateTarget', {
                columnDefs,
                rowData,
            });

            api2.setState(savedState as GridState);

            await asyncSetTimeout(20);

            const restoredFilterModel = api2.getFilterModel();
            expect(restoredFilterModel?.id?.filter).toBe('2n');
        });

        test('setState filter restore fires onFilterChanged with source "api", not "columnFilter"', async () => {
            const sources: (string | undefined)[] = [];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agTextColumnFilter' },
                onFilterChanged: (e) => sources.push(e.source),
            });

            api.setState({
                filter: { filterModel: { name: { filterType: 'text', type: 'startsWith', filter: 'A' } } },
            } as GridState);
            await asyncSetTimeout(50);

            expect(sources.length).toBeGreaterThan(0);
            expect(sources.every((s) => s === 'api')).toBe(true);
        });

        test('initialState filter restore fires onFilterChanged with source "columnFilter"', async () => {
            const sources: (string | undefined)[] = [];
            gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agTextColumnFilter' },
                initialState: {
                    filter: { filterModel: { name: { filterType: 'text', type: 'startsWith', filter: 'A' } } },
                },
                onFilterChanged: (e) => sources.push(e.source),
            });
            await asyncSetTimeout(50);

            expect(sources.length).toBeGreaterThan(0);
            expect(sources.every((s) => s === 'columnFilter')).toBe(true);
        });
    });

    // ===== CELL STATE TESTS =====
    describe('Cell State', () => {
        test('should capture focused cell state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should capture focused cell state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture focused cell state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            await asyncSetTimeout(20);

            // Focus a cell
            api.setFocusedCell(0, 'name');

            await asyncSetTimeout(50);

            expect(api.getState().focusedCell).toEqual({
                colId: 'name',
                rowIndex: 0,
                rowPinned: null,
            });
            await new GridRows(api, `should capture focused cell state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });

        test('should capture cell selection state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                cellSelection: true,
            });
            await new GridColumns(api, `should capture cell selection state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture cell selection state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['name'] });

            await asyncSetTimeout(50);

            expect(api.getState().cellSelection).toEqual({
                cellRanges: [
                    {
                        colIds: ['name'],
                        endRow: {
                            rowIndex: 1,
                            rowPinned: undefined,
                        },
                        id: undefined,
                        startColId: 'name',
                        startRow: {
                            rowIndex: 0,
                            rowPinned: undefined,
                        },
                        type: undefined,
                    },
                ],
            });

            api.clearCellSelection();

            expect(api.getState().cellSelection).toEqual(undefined);
            await new GridRows(api, `should capture cell selection state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });

        test('should capture scroll state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: [
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                ],
            });
            await new GridColumns(api, `should capture scroll state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture scroll state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:5 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:6 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:7 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:8 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:9 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:10 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:11 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:12 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:13 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:14 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:15 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:16 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:17 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:18 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:19 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:20 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:21 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:22 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:23 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:24 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:25 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:26 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:27 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:28 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:29 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().scroll).toEqual(undefined);

            api.ensureIndexVisible(20);

            await asyncSetTimeout(50);

            expect(api.getState().scroll).toEqual({
                left: 0,
                top: 840,
            });
            await new GridRows(api, `should capture scroll state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:5 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:6 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:7 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:8 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:9 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:10 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:11 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:12 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:13 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:14 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:15 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:16 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:17 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:18 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:19 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:20 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:21 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:22 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:23 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:24 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:25 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:26 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:27 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:28 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:29 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });
    });

    // ===== UI STATE TESTS =====
    describe('UI State', () => {
        test('should capture sidebar state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            await new GridColumns(api, `should capture sidebar state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should capture sidebar state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            expect(api.getState().sideBar).toEqual({
                openToolPanel: 'columns',
                position: 'right',
                toolPanels: {
                    columns: {
                        expandedGroupIds: [],
                    },
                },
                visible: true,
            });

            api.closeToolPanel();

            expect(api.getState().sideBar).toEqual({
                openToolPanel: null,
                position: 'right',
                toolPanels: {
                    columns: {
                        expandedGroupIds: [],
                    },
                },
                visible: true,
            });
            await new GridRows(api, `should capture sidebar state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });
    });

    // ===== COMBINED STATE TESTS =====
    describe('Combined State Operations', () => {
        test('should set state and apply all features', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });
            await new GridColumns(api, `should set state and apply all features setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should set state and apply all features setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            const stateToApply: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'asc' }],
                },
                columnVisibility: {
                    hiddenColIds: ['age'],
                },
                columnOrder: {
                    orderedColIds: ['name', 'id', 'sport', 'age'],
                },
                pagination: {
                    page: 1,
                    pageSize: 2,
                },
                rowSelection: ['1', '3'],
            };

            api.setState(stateToApply);
            await asyncSetTimeout(50);

            const state = api.getState();
            expect(state.sort?.sortModel).toHaveLength(1);
            expect(state.columnVisibility?.hiddenColIds).toContain('age');
            expect(state.pagination?.page).toBe(1);
            await new GridRows(api, `should set state and apply all features final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Alice" id:"1" sport:"Football" age:30
                ├── LEAF selected id:1 name:"Bob" id:"2" sport:"Tennis" age:25
                ├── LEAF id:2 name:"Charlie" id:"3" sport:"Golf" age:35
                ├── LEAF selected id:3 name:"David" id:"4" sport:"Basketball" age:28
                └── LEAF id:4 name:"Eve" id:"5" sport:"Swimming" age:32
            `);
        });

        test('should setState with propertiesToIgnore parameter', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
            });
            await new GridColumns(api, `should setState with propertiesToIgnore parameter setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should setState with propertiesToIgnore parameter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // First select some rows
            api.selectAll('filtered');

            const stateToApply: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'asc' }],
                },
                rowSelection: ['3', '4'],
            };

            // Apply state but ignore rowSelection
            api.setState(stateToApply, ['rowSelection']);
            await asyncSetTimeout(50);

            const state = api.getState();
            expect(state.sort?.sortModel).toHaveLength(1);
            // Row selection should not have changed
            if (Array.isArray(state.rowSelection)) {
                expect(state.rowSelection).toContain('1');
                expect(state.rowSelection).toContain('2');
            }
            await new GridRows(api, `should setState with propertiesToIgnore parameter final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF selected id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF selected id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF selected id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF selected id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF selected id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
        });
    });

    // ===== STATE PERSISTENCE TESTS =====
    describe('State Persistence', () => {
        test('should restore full state from saved state ', async () => {
            // First grid - set some state
            const api1 = gridsManager.createGrid('grid1', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            api1.selectAll('filtered');
            api1.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
            api1.setColumnsVisible(['age'], false);
            api1.applyColumnState({
                state: [{ colId: 'id', pinned: 'left' }],
            });

            const savedState = api1.getState();

            // Second grid - restore state
            gridsManager.reset();
            const api2 = gridsManager.createGrid('grid2', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            api2.setState(savedState);
            await asyncSetTimeout(50);

            const restoredState = api2.getState();
            expect(restoredState).toEqual(savedState);
        });

        test('should preserve absolute sort type when restoring state via setState', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should preserve absolute sort type when restoring state via setState setup`)
                .checkColumns(`
                    CENTER
                    ├── id "Id" width:200
                    ├── name "Name" width:200
                    ├── age "Age" width:200
                    └── sport "Sport" width:200
                `);
            await new GridRows(api, `should preserve absolute sort type when restoring state via setState setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                    ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                    ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                    ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                    └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                `
            );

            api.applyColumnState({
                state: [{ colId: 'age', sort: 'asc', sortType: 'absolute' }],
            });
            await new GridColumns(
                api,
                `should preserve absolute sort type when restoring state via setState after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200 sort:asc
                └── sport "Sport" width:200
            `);
            await new GridRows(
                api,
                `should preserve absolute sort type when restoring state via setState after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                └── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            `);

            const savedState = api.getState();
            expect(savedState.sort?.sortModel).toEqual([{ colId: 'age', sort: 'asc', type: 'absolute' }]);

            // Clear sort and restore from saved state
            api.applyColumnState({ state: [{ colId: 'age', sort: null }] });
            await new GridColumns(
                api,
                `should preserve absolute sort type when restoring state via setState after applyColumnState #2`
            ).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(
                api,
                `should preserve absolute sort type when restoring state via setState after applyColumnState #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);
            expect(api.getState().sort?.sortModel ?? []).toHaveLength(0);

            api.setState(savedState);
            await asyncSetTimeout(50);

            expect(api.getState().sort?.sortModel).toEqual([{ colId: 'age', sort: 'asc', type: 'absolute' }]);
        });

        test('should clear absolute sort from a column not present in the restored sort state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(
                api,
                `should clear absolute sort from a column not present in the restored sort state setup`
            ).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(
                api,
                `should clear absolute sort from a column not present in the restored sort state setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            // Set absolute sort on 'age', default sort on 'name'
            api.applyColumnState({
                state: [
                    { colId: 'age', sort: 'asc', sortType: 'absolute', sortIndex: 0 },
                    { colId: 'name', sort: 'desc', sortIndex: 1 },
                ],
            });
            await new GridColumns(
                api,
                `should clear absolute sort from a column not present in the restored sort state after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200 sort:desc sortIndex:1
                ├── age "Age" width:200 sort:asc sortIndex:0
                └── sport "Sport" width:200
            `);
            await new GridRows(
                api,
                `should clear absolute sort from a column not present in the restored sort state after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                └── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
            `);

            expect(api.getState().sort?.sortModel).toEqual([
                { colId: 'age', sort: 'asc', type: 'absolute' },
                { colId: 'name', sort: 'desc', type: 'default' },
            ]);

            // Restore a state that only sorts 'name' — 'age' absolute sort should be cleared
            api.setState({ sort: { sortModel: [{ colId: 'name', sort: 'asc', type: 'default' }] } });
            await asyncSetTimeout(50);

            expect(api.getState().sort?.sortModel).toEqual([{ colId: 'name', sort: 'asc', type: 'default' }]);
        });

        test('should initialize grid with initial state', async () => {
            const initialState: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'desc' }],
                },
                columnVisibility: {
                    hiddenColIds: ['sport'],
                },
                pagination: {
                    page: 0,
                    pageSize: 3,
                },
            };

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                initialState,
                pagination: true,
                paginationPageSize: 3,
                paginationPageSizeSelector: [3],
            });
            await new GridColumns(api, `should initialize grid with initial state setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200 sort:desc sortIndex:0
                └── age "Age" width:200
            `);
            await new GridRows(api, `should initialize grid with initial state setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                └── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            `);

            const state = api.getState();
            expect(state.sort).toEqual({
                sortModel: [
                    {
                        colId: 'name',
                        sort: 'desc',
                        type: 'default',
                    },
                ],
            });
            expect(state.columnVisibility).toEqual({
                hiddenColIds: ['sport'],
            });

            expect(state.pagination).toEqual({
                page: 0,
                pageSize: 3,
            });
            await new GridRows(api, `should initialize grid with initial state final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                └── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
            `);
        });
    });

    // ===== STATE UPDATES TESTS =====
    describe('State Updates and Events', () => {
        test('should emit stateUpdated event when state changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });
            await new GridColumns(api, `should emit stateUpdated event when state changes setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── sport "Sport" width:200
            `);
            await new GridRows(api, `should emit stateUpdated event when state changes setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
            `);

            await asyncSetTimeout(20);

            let eventFired = false;
            let eventState: any;

            api.addEventListener('stateUpdated', (event) => {
                eventFired = true;
                eventState = event.state;
            });

            api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
            await new GridColumns(api, `should emit stateUpdated event when state changes after applyColumnState`)
                .checkColumns(`
                    CENTER
                    ├── id "Id" width:200
                    ├── name "Name" width:200 sort:asc
                    ├── age "Age" width:200
                    └── sport "Sport" width:200
                `);
            await new GridRows(api, `should emit stateUpdated event when state changes after applyColumnState`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 id:"1" name:"Alice" age:30 sport:"Football"
                    ├── LEAF id:1 id:"2" name:"Bob" age:25 sport:"Tennis"
                    ├── LEAF id:2 id:"3" name:"Charlie" age:35 sport:"Golf"
                    ├── LEAF id:3 id:"4" name:"David" age:28 sport:"Basketball"
                    └── LEAF id:4 id:"5" name:"Eve" age:32 sport:"Swimming"
                `
            );
            await asyncSetTimeout(50);

            expect(eventFired).toBe(true);
            expect(eventState?.sort).toBeDefined();
        });
    });

    describe('Pivot result column state', () => {
        const columnDefs = [{ field: 'country' }, { field: 'year' }, { field: 'gold', filter: 'agNumberColumnFilter' }];
        const rowData = [
            { country: 'Russia', year: 2000, gold: 66 },
            { country: 'Russia', year: 2004, gold: 10 },
            { country: 'USA', year: 2000, gold: 40 },
            { country: 'USA', year: 2004, gold: 20 },
        ];
        // Pivot by year, group by country, sum(gold) → pivot result columns pivot_year_2000_gold / pivot_year_2004_gold.
        const pivotState = {
            pivot: { pivotMode: true, pivotColIds: ['year'] },
            rowGroup: { groupColIds: ['country'] },
            aggregation: { aggregationModel: [{ colId: 'gold', aggFunc: 'sum' }] },
        };

        test('setState restores a filter on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
            await waitForNoLoadingRows(api);

            api.setState({
                ...pivotState,
                filter: { filterModel: { pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 } } },
            } as GridState);
            await asyncSetTimeout(50);

            expect(api.getFilterModel()).toEqual({
                pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 },
            });
            // Print State must report the restored filter, not undefined.
            expect(api.getState().filter?.filterModel).toEqual({
                pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 },
            });
            await new GridRows(api, `setState restores a filter on a pivot result column`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2000_gold:106 pivot_year_2004_gold:30
                └─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_year_2000_gold:66 pivot_year_2004_gold:10
                · ├── LEAF hidden id:0 pivot_year_2000_gold:66 pivot_year_2004_gold:66
                · └── LEAF hidden id:1 pivot_year_2000_gold:10 pivot_year_2004_gold:10
            `);
        });

        test('initialState restores a filter on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                initialState: {
                    ...pivotState,
                    filter: {
                        filterModel: { pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 } },
                    },
                } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getFilterModel()).toEqual({
                pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 },
            });
            expect(api.getState().filter?.filterModel).toEqual({
                pivot_year_2000_gold: { filterType: 'number', type: 'equals', filter: 66 },
            });
            await new GridRows(api, `initialState restores a filter on a pivot result column`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2000_gold:106 pivot_year_2004_gold:30
                └─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_year_2000_gold:66 pivot_year_2004_gold:10
                · ├── LEAF hidden id:0 pivot_year_2000_gold:66 pivot_year_2004_gold:66
                · └── LEAF hidden id:1 pivot_year_2000_gold:10 pivot_year_2004_gold:10
            `);
        });

        test('initialState restores sort on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                initialState: {
                    ...pivotState,
                    sort: { sortModel: [{ colId: 'pivot_year_2000_gold', sort: 'desc' }] },
                } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getColumn('pivot_year_2000_gold')?.getSort()).toBe('desc');
            expect(api.getState().sort).toEqual({
                sortModel: [{ colId: 'pivot_year_2000_gold', sort: 'desc', type: 'default' }],
            });
        });

        test('initialState restores column sizing on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                initialState: {
                    ...pivotState,
                    columnSizing: { columnSizingModel: [{ colId: 'pivot_year_2000_gold', width: 333 }] },
                } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getColumn('pivot_year_2000_gold')?.getActualWidth()).toBe(333);
        });

        test('initialState restores column visibility on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                initialState: {
                    ...pivotState,
                    columnVisibility: { hiddenColIds: ['pivot_year_2000_gold'] },
                } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getColumn('pivot_year_2000_gold')?.isVisible()).toBe(false);
            expect(api.getState().columnVisibility).toEqual({ hiddenColIds: ['pivot_year_2000_gold'] });
        });

        test('initialState restores column pinning on a pivot result column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
                initialState: { ...pivotState, columnPinning: { leftColIds: ['pivot_year_2000_gold'] } } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getColumn('pivot_year_2000_gold')?.getPinned()).toBe('left');
            expect(api.getState().columnPinning?.leftColIds).toEqual(['pivot_year_2000_gold']);
        });

        test('initialState restores an open pivot column group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'silver' }],
                rowData: [
                    { country: 'Russia', year: 2000, gold: 66, silver: 5 },
                    { country: 'USA', year: 2000, gold: 40, silver: 3 },
                ],
                initialState: {
                    ...pivotState,
                    aggregation: {
                        aggregationModel: [
                            { colId: 'gold', aggFunc: 'sum' },
                            { colId: 'silver', aggFunc: 'sum' },
                        ],
                    },
                    columnGroup: { openColumnGroupIds: ['pivotGroup_year_2000'] },
                } as GridState,
            });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(50);

            expect(api.getState().columnGroup).toEqual({ openColumnGroupIds: ['pivotGroup_year_2000'] });
        });
    });
});
