import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping aggregation options', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, NumberFilterModule, TextFilterModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('suppressAggFilteredOnly: aggregates all children regardless of filter', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', value: 10, year: 2020 },
            { id: '2', group: 'A', value: 20, year: 2021 },
            { id: '3', group: 'A', value: 30, year: 2022 },
            { id: '4', group: 'B', value: 40, year: 2020 },
            { id: '5', group: 'B', value: 50, year: 2021 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
                { field: 'year', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFilteredOnly: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:60
            │ ├── LEAF id:1 group:"A" value:10 year:2020
            │ ├── LEAF id:2 group:"A" value:20 year:2021
            │ └── LEAF id:3 group:"A" value:30 year:2022
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:90
            · ├── LEAF id:4 group:"B" value:40 year:2020
            · └── LEAF id:5 group:"B" value:50 year:2021
        `);

        // Filter to year >= 2021 — with suppressAggFilteredOnly, aggregation should still use ALL rows
        api.setFilterModel({
            year: { filterType: 'number', type: 'greaterThanOrEqual', filter: 2021 },
        });

        await new GridRows(api, 'filtered, agg uses all children', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:60
            │ ├── LEAF id:2 group:"A" value:20 year:2021
            │ └── LEAF id:3 group:"A" value:30 year:2022
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:90
            · └── LEAF id:5 group:"B" value:50 year:2021
        `);

        await new GridColumns(api, 'columns after filter').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── value "Value" width:200 aggFunc:sum
            └── year "Year" width:200 filter
        `);
    });

    test('default (no suppressAggFilteredOnly): aggregates only filtered children', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', value: 10, year: 2020 },
            { id: '2', group: 'A', value: 20, year: 2021 },
            { id: '3', group: 'A', value: 30, year: 2022 },
            { id: '4', group: 'B', value: 40, year: 2020 },
            { id: '5', group: 'B', value: 50, year: 2021 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
                { field: 'year', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Filter to year >= 2021 — without suppressAggFilteredOnly, aggregation uses only filtered rows
        api.setFilterModel({
            year: { filterType: 'number', type: 'greaterThanOrEqual', filter: 2021 },
        });

        await new GridRows(api, 'filtered, agg uses filtered children only', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:50
            │ ├── LEAF id:2 group:"A" value:20 year:2021
            │ └── LEAF id:3 group:"A" value:30 year:2022
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:50
            · └── LEAF id:5 group:"B" value:50 year:2021
        `);
    });

    test('getGroupRowAgg: custom whole-row aggregation', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', x: 10, y: 100 },
            { id: '2', group: 'A', x: 20, y: 200 },
            { id: '3', group: 'B', x: 30, y: 300 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'x' }, { field: 'y' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getGroupRowAgg: (params) => {
                let sumX = 0;
                let sumY = 0;
                for (const node of params.nodes) {
                    sumX += node.data?.x ?? 0;
                    sumY += node.data?.y ?? 0;
                }
                return { x: sumX, y: sumY * 2 };
            },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" x:30 y:600
            │ ├── LEAF id:1 group:"A" x:10 y:100
            │ └── LEAF id:2 group:"A" x:20 y:200
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" x:30 y:600
            · └── LEAF id:3 group:"B" x:30 y:300
        `);

        applyTransactionChecked(api, {
            update: [{ id: '1', group: 'A', x: 100, y: 100 }],
        });

        await new GridRows(api, 'after update', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" x:120 y:600
            │ ├── LEAF id:1 group:"A" x:100 y:100
            │ └── LEAF id:2 group:"A" x:20 y:200
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" x:30 y:600
            · └── LEAF id:3 group:"B" x:30 y:300
        `);
    });

    test('getGroupRowAgg with grand total row', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', value: 10 },
            { id: '2', group: 'A', value: 20 },
            { id: '3', group: 'B', value: 30 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            grandTotalRow: 'top',
            alwaysAggregateAtRootLevel: true,
            getGroupRowAgg: (params) => {
                let sum = 0;
                for (const node of params.nodes) {
                    const val = node.group ? node.aggData?.value : node.data?.value;
                    sum += val ?? 0;
                }
                return { value: sum };
            },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID value:60
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null value:60
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:30
            │ ├── LEAF id:1 group:"A" value:10
            │ └── LEAF id:2 group:"A" value:20
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:30
            · └── LEAF id:3 group:"B" value:30
        `);
    });

    test('multiple aggFunc types: sum, avg, count, min, max, first, last', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', group: 'A', v: 10 },
            { id: '2', group: 'A', v: 20 },
            { id: '3', group: 'A', v: 30 },
            { id: '4', group: 'B', v: 5 },
            { id: '5', group: 'B', v: 15 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { colId: 'sum', field: 'v', aggFunc: 'sum' },
                { colId: 'avg', field: 'v', aggFunc: 'avg' },
                { colId: 'count', field: 'v', aggFunc: 'count' },
                { colId: 'min', field: 'v', aggFunc: 'min' },
                { colId: 'max', field: 'v', aggFunc: 'max' },
                { colId: 'first', field: 'v', aggFunc: 'first' },
                { colId: 'last', field: 'v', aggFunc: 'last' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" sum:60 avg:{"count":3,"value":20} count:{"value":3} min:10 max:30 first:10 last:30
            │ ├── LEAF id:1 group:"A" sum:10 avg:10 count:10 min:10 max:10 first:10 last:10
            │ ├── LEAF id:2 group:"A" sum:20 avg:20 count:20 min:20 max:20 first:20 last:20
            │ └── LEAF id:3 group:"A" sum:30 avg:30 count:30 min:30 max:30 first:30 last:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" sum:20 avg:{"count":2,"value":10} count:{"value":2} min:5 max:15 first:5 last:15
            · ├── LEAF id:4 group:"B" sum:5 avg:5 count:5 min:5 max:5 first:5 last:5
            · └── LEAF id:5 group:"B" sum:15 avg:15 count:15 min:15 max:15 first:15 last:15
        `);

        // Update and verify all agg functions recalculate correctly
        applyTransactionChecked(api, {
            update: [{ id: '1', group: 'A', v: 50 }],
        });

        await new GridRows(api, 'after update', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" sum:100 avg:{"count":3,"value":33.333333333333336} count:{"value":3} min:20 max:50 first:50 last:30
            │ ├── LEAF id:1 group:"A" sum:50 avg:50 count:50 min:50 max:50 first:50 last:50
            │ ├── LEAF id:2 group:"A" sum:20 avg:20 count:20 min:20 max:20 first:20 last:20
            │ └── LEAF id:3 group:"A" sum:30 avg:30 count:30 min:30 max:30 first:30 last:30
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" sum:20 avg:{"count":2,"value":10} count:{"value":2} min:5 max:15 first:5 last:15
            · ├── LEAF id:4 group:"B" sum:5 avg:5 count:5 min:5 max:5 first:5 last:5
            · └── LEAF id:5 group:"B" sum:15 avg:15 count:15 min:15 max:15 first:15 last:15
        `);
    });
});
