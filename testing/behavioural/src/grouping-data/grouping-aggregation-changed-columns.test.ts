import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    cachedJSONObjects,
    executeTransactionsAsync,
} from '../test-utils';

describe('ag-grid grouping aggregation with aggregateOnlyChangedColumns', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each([false, true] as const)(
        'single-level grouping with aggregateOnlyChangedColumns=%s, transaction update',
        async (aggregateOnlyChangedColumns) => {
            const rowData = cachedJSONObjects.array([
                { id: '1', country: 'Ireland', gold: 1, silver: 2 },
                { id: '2', country: 'Ireland', gold: 2, silver: 1 },
                { id: '3', country: 'Italy', gold: 3, silver: 3 },
                { id: '4', country: 'Italy', gold: 4, silver: 4 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Country' },
                animateRows: false,
                groupDefaultExpanded: -1,
                aggregateOnlyChangedColumns,
                rowData,
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3 silver:3
                │ ├── LEAF id:1 country:"Ireland" gold:1 silver:2
                │ └── LEAF id:2 country:"Ireland" gold:2 silver:1
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:7 silver:7
                · ├── LEAF id:3 country:"Italy" gold:3 silver:3
                · └── LEAF id:4 country:"Italy" gold:4 silver:4
            `);

            // Update only 'gold' for one row — silver should remain unchanged
            applyTransactionChecked(api, {
                update: [{ id: '1', country: 'Ireland', gold: 10, silver: 2 }],
            });

            await new GridRows(api, 'after gold update', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:12 silver:3
                │ ├── LEAF id:1 country:"Ireland" gold:10 silver:2
                │ └── LEAF id:2 country:"Ireland" gold:2 silver:1
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:7 silver:7
                · ├── LEAF id:3 country:"Italy" gold:3 silver:3
                · └── LEAF id:4 country:"Italy" gold:4 silver:4
            `);

            // Update both columns for another row
            applyTransactionChecked(api, {
                update: [{ id: '3', country: 'Italy', gold: 30, silver: 30 }],
            });

            await new GridRows(api, 'after both columns update', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:12 silver:3
                │ ├── LEAF id:1 country:"Ireland" gold:10 silver:2
                │ └── LEAF id:2 country:"Ireland" gold:2 silver:1
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:34 silver:34
                · ├── LEAF id:3 country:"Italy" gold:30 silver:30
                · └── LEAF id:4 country:"Italy" gold:4 silver:4
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Country" width:200
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200 aggFunc:sum
            `);
        }
    );

    test.each([false, true] as const)(
        'multi-level grouping with aggregateOnlyChangedColumns=%s, transactions',
        async (aggregateOnlyChangedColumns) => {
            const rowData = cachedJSONObjects.array([
                { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1, silver: 10 },
                { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2, silver: 20 },
                { id: '3', country: 'Ireland', sport: 'Soccer', gold: 3, silver: 30 },
                { id: '4', country: 'Italy', sport: 'Football', gold: 4, silver: 40 },
                { id: '5', country: 'Italy', sport: 'Tennis', gold: 5, silver: 50 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                animateRows: false,
                groupDefaultExpanded: -1,
                aggregateOnlyChangedColumns,
                rowData,
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6 silver:60
                │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Sailing ag-Grid-AutoColumn:"Sailing" gold:1 silver:10
                │ │ └── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1 silver:10
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer ag-Grid-AutoColumn:"Soccer" gold:5 silver:50
                │ · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2 silver:20
                │ · └── LEAF id:3 country:"Ireland" sport:"Soccer" gold:3 silver:30
                └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9 silver:90
                · ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Football ag-Grid-AutoColumn:"Football" gold:4 silver:40
                · │ └── LEAF id:4 country:"Italy" sport:"Football" gold:4 silver:40
                · └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis ag-Grid-AutoColumn:"Tennis" gold:5 silver:50
                · · └── LEAF id:5 country:"Italy" sport:"Tennis" gold:5 silver:50
            `);

            // Update gold only for a deep leaf
            applyTransactionChecked(api, {
                update: [{ id: '2', country: 'Ireland', sport: 'Soccer', gold: 20, silver: 20 }],
            });

            await new GridRows(api, 'after update', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:24 silver:60
                │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Sailing ag-Grid-AutoColumn:"Sailing" gold:1 silver:10
                │ │ └── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1 silver:10
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer ag-Grid-AutoColumn:"Soccer" gold:23 silver:50
                │ · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:20 silver:20
                │ · └── LEAF id:3 country:"Ireland" sport:"Soccer" gold:3 silver:30
                └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9 silver:90
                · ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Football ag-Grid-AutoColumn:"Football" gold:4 silver:40
                · │ └── LEAF id:4 country:"Italy" sport:"Football" gold:4 silver:40
                · └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis ag-Grid-AutoColumn:"Tennis" gold:5 silver:50
                · · └── LEAF id:5 country:"Italy" sport:"Tennis" gold:5 silver:50
            `);

            // Add and remove rows
            applyTransactionChecked(api, {
                add: [{ id: '6', country: 'Italy', sport: 'Football', gold: 6, silver: 60 }],
                remove: [rowData[0]],
            });

            await new GridRows(api, 'after add+remove', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:23 silver:50
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer ag-Grid-AutoColumn:"Soccer" gold:23 silver:50
                │ · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:20 silver:20
                │ · └── LEAF id:3 country:"Ireland" sport:"Soccer" gold:3 silver:30
                └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:15 silver:150
                · ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Football ag-Grid-AutoColumn:"Football" gold:10 silver:100
                · │ ├── LEAF id:4 country:"Italy" sport:"Football" gold:4 silver:40
                · │ └── LEAF id:6 country:"Italy" sport:"Football" gold:6 silver:60
                · └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis ag-Grid-AutoColumn:"Tennis" gold:5 silver:50
                · · └── LEAF id:5 country:"Italy" sport:"Tennis" gold:5 silver:50
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200 aggFunc:sum
            `);
        }
    );

    test.each([false, true] as const)(
        'aggregateOnlyChangedColumns=%s with async transactions',
        async (aggregateOnlyChangedColumns) => {
            const rowData = cachedJSONObjects.array([
                { id: '1', group: 'A', x: 1, y: 10 },
                { id: '2', group: 'A', x: 2, y: 20 },
                { id: '3', group: 'B', x: 3, y: 30 },
                { id: '4', group: 'B', x: 4, y: 40 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'x', aggFunc: 'sum' },
                    { field: 'y', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                animateRows: false,
                groupDefaultExpanded: -1,
                aggregateOnlyChangedColumns,
                rowData,
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" x:3 y:30
                │ ├── LEAF id:1 group:"A" x:1 y:10
                │ └── LEAF id:2 group:"A" x:2 y:20
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" x:7 y:70
                · ├── LEAF id:3 group:"B" x:3 y:30
                · └── LEAF id:4 group:"B" x:4 y:40
            `);

            // Multiple async transactions that update different columns in different groups
            await executeTransactionsAsync(
                [
                    { update: [{ id: '1', group: 'A', x: 100, y: 10 }] },
                    { update: [{ id: '3', group: 'B', x: 3, y: 300 }] },
                    { add: [{ id: '5', group: 'A', x: 5, y: 50 }] },
                ],
                api
            );

            await new GridRows(api, 'after async transactions', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" x:107 y:80
                │ ├── LEAF id:1 group:"A" x:100 y:10
                │ ├── LEAF id:2 group:"A" x:2 y:20
                │ └── LEAF id:5 group:"A" x:5 y:50
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" x:7 y:340
                · ├── LEAF id:3 group:"B" x:3 y:300
                · └── LEAF id:4 group:"B" x:4 y:40
            `);
        }
    );

    test.each([false, true] as const)(
        'aggregateOnlyChangedColumns=%s with immutable data',
        async (aggregateOnlyChangedColumns) => {
            const rowData = cachedJSONObjects.array([
                { id: '1', group: 'A', gold: 1, silver: 10 },
                { id: '2', group: 'A', gold: 2, silver: 20 },
                { id: '3', group: 'B', gold: 3, silver: 30 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                animateRows: false,
                groupDefaultExpanded: -1,
                aggregateOnlyChangedColumns,
                rowData,
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" gold:3 silver:30
                │ ├── LEAF id:1 group:"A" gold:1 silver:10
                │ └── LEAF id:2 group:"A" gold:2 silver:20
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" gold:3 silver:30
                · └── LEAF id:3 group:"B" gold:3 silver:30
            `);

            // Immutable update: change gold for id:1, add new row
            api.setGridOption(
                'rowData',
                cachedJSONObjects.array([
                    { id: '1', group: 'A', gold: 100, silver: 10 },
                    { id: '2', group: 'A', gold: 2, silver: 20 },
                    { id: '3', group: 'B', gold: 3, silver: 30 },
                    { id: '4', group: 'B', gold: 4, silver: 40 },
                ])
            );

            await new GridRows(api, 'after immutable update', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" gold:102 silver:30
                │ ├── LEAF id:1 group:"A" gold:100 silver:10
                │ └── LEAF id:2 group:"A" gold:2 silver:20
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" gold:7 silver:70
                · ├── LEAF id:3 group:"B" gold:3 silver:30
                · └── LEAF id:4 group:"B" gold:4 silver:40
            `);
        }
    );

    test('aggregateOnlyChangedColumns with grand total and group footers', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', value: 10 },
            { id: '2', group: 'A', value: 20 },
            { id: '3', group: 'B', value: 30 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            aggregateOnlyChangedColumns: true,
            alwaysAggregateAtRootLevel: true,
            grandTotalRow: 'top',
            groupTotalRow: 'bottom',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID value:60
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null value:60
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:10
            │ ├── LEAF id:2 group:"A" value:20
            │ └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"A" value:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:30
            · └─ footer id:rowGroupFooter_row-group-group-B ag-Grid-AutoColumn:"B" value:30
        `);

        applyTransactionChecked(api, {
            update: [{ id: '1', group: 'A', value: 100 }],
        });

        await new GridRows(api, 'after update', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID value:150
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null value:150
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:100
            │ ├── LEAF id:2 group:"A" value:20
            │ └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"A" value:120
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:30
            · └─ footer id:rowGroupFooter_row-group-group-B ag-Grid-AutoColumn:"B" value:30
        `);
    });
});
