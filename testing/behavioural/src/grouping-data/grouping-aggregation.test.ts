import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    cachedJSONObjects,
} from 'ag-test-utils';

import type { IAggFuncParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    GRAND_TOTAL_ROW_ID,
    NumberFilterModule,
    PinnedRowModule,
    RowSelectionModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

describe('ag-grid grouping aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            RowSelectionModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PinnedRowModule,
            CsvExportModule,
            NumberFilterModule,
            TextFilterModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping aggregation and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1, silver: 2 },
            { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2, silver: 1 },
            { id: '3', country: 'Ireland', sport: 'Football', gold: 1, silver: 3 },
            { id: '4', country: 'Italy', sport: 'Soccer', gold: 3, silver: 1 },
            { id: '5', country: 'Italy', sport: 'Football', gold: 2, silver: 2 },
            { id: '6', country: 'France', sport: 'Tennis', gold: 1, silver: 1 },
            { id: '7', country: 'France', sport: 'Soccer', gold: 2, silver: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'avg' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            groupTotalRow: 'bottom',
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1 silver:2
            │ ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 country:"Ireland" sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland" gold:4 silver:{"count":3,"value":2}
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:4 country:"Italy" sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 country:"Italy" sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy ag-Grid-AutoColumn:"Total Italy" gold:5 silver:{"count":2,"value":1.5}
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:6 country:"France" sport:"Tennis" gold:1 silver:1
            · ├── LEAF id:7 country:"France" sport:"Soccer" gold:2 silver:3
            · └─ footer id:rowGroupFooter_row-group-country-France ag-Grid-AutoColumn:"Total France" gold:3 silver:{"count":2,"value":2}
        `);

        applyTransactionChecked(api, {
            update: [{ id: '1', country: 'Ireland', sport: 'Swimming', gold: 12, silver: 7 }],
            add: [
                { id: '8', country: 'United Kingdom', sport: 'Rowing', gold: 4, silver: 4 },
                { id: '9', country: 'United Kingdom', sport: 'Athletics', gold: 5, silver: 3 },
            ],
        });

        await new GridRows(api, 'after update', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" sport:"Swimming" gold:12 silver:7
            │ ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 country:"Ireland" sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:15 silver:{"count":3,"value":3.6666666666666665}
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:4 country:"Italy" sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 country:"Italy" sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5 silver:{"count":2,"value":1.5}
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" sport:"Tennis" gold:1 silver:1
            │ ├── LEAF id:7 country:"France" sport:"Soccer" gold:2 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-France ag-Grid-AutoColumn:"France" gold:3 silver:{"count":2,"value":2}
            └─┬ LEAF_GROUP id:"row-group-country-United Kingdom" ag-Grid-AutoColumn:"United Kingdom"
            · ├── LEAF id:8 country:"United Kingdom" sport:"Rowing" gold:4 silver:4
            · ├── LEAF id:9 country:"United Kingdom" sport:"Athletics" gold:5 silver:3
            · └─ footer id:"rowGroupFooter_row-group-country-United Kingdom" ag-Grid-AutoColumn:"United Kingdom" gold:9 silver:{"count":2,"value":3.5}
        `);

        await new GridRows(api, 'after update', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" sport:"Swimming" gold:12 silver:7
            │ ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 country:"Ireland" sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:15 silver:{"count":3,"value":3.6666666666666665}
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:4 country:"Italy" sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 country:"Italy" sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5 silver:{"count":2,"value":1.5}
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" sport:"Tennis" gold:1 silver:1
            │ ├── LEAF id:7 country:"France" sport:"Soccer" gold:2 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-France ag-Grid-AutoColumn:"France" gold:3 silver:{"count":2,"value":2}
            └─┬ LEAF_GROUP id:"row-group-country-United Kingdom" ag-Grid-AutoColumn:"United Kingdom"
            · ├── LEAF id:8 country:"United Kingdom" sport:"Rowing" gold:4 silver:4
            · ├── LEAF id:9 country:"United Kingdom" sport:"Athletics" gold:5 silver:3
            · └─ footer id:"rowGroupFooter_row-group-country-United Kingdom" ag-Grid-AutoColumn:"United Kingdom" gold:9 silver:{"count":2,"value":3.5}
        `);

        await new GridColumns(api, 'after update').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── sport "Sport" width:200
            ├── gold "Gold" width:200 aggFunc:sum
            └── silver "Silver" width:200 aggFunc:avg
        `);
    });

    test('suppressAggregateAtRootLevel vs alwaysAggregateAtRootLevel', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', category: 'A', value: 100 },
            { id: '2', category: 'A', value: 200 },
            { id: '3', category: 'B', value: 150 },
        ]);

        // Test suppressAggregateAtRootLevel
        const api1 = gridsManager.createGrid('myGrid1', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            animateRows: false,
            groupDefaultExpanded: -1,
            alwaysAggregateAtRootLevel: false,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api1, 'alwaysAggregateAtRootLevel=false').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" value:300
            │ ├── LEAF id:1 category:"A" value:100
            │ └── LEAF id:2 category:"A" value:200
            └─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B" value:150
            · └── LEAF id:3 category:"B" value:150
        `);

        // Test alwaysAggregateAtRootLevel
        const api2 = gridsManager.createGrid('myGrid2', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            animateRows: false,
            groupDefaultExpanded: -1,
            alwaysAggregateAtRootLevel: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api2, 'alwaysAggregateAtRootLevel=true').check(`
            ROOT id:ROOT_NODE_ID value:450
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" value:300
            │ ├── LEAF id:1 category:"A" value:100
            │ └── LEAF id:2 category:"A" value:200
            └─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B" value:150
            · └── LEAF id:3 category:"B" value:150
        `);

        await new GridColumns(api1, 'alwaysAggregateAtRootLevel=false').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            └── value "Value" width:200 aggFunc:sum
        `);
        await new GridColumns(api2, 'alwaysAggregateAtRootLevel=true').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            └── value "Value" width:200 aggFunc:sum
        `);
    });

    test('custom aggregation functions with complex data types', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', category: 'A', scores: [80, 90, 85], metadata: { priority: 1 } },
            { id: '2', category: 'A', scores: [75, 88, 92], metadata: { priority: 2 } },
            { id: '3', category: 'B', scores: [95, 87, 90], metadata: { priority: 1 } },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'scores',
                    aggFunc: (params) => {
                        const values = params.values as number[][];
                        if (!values || values.length === 0) {
                            return null;
                        }

                        const allScores = values.flat();
                        const avg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
                        return Math.round(avg * 100) / 100;
                    },
                    valueFormatter: (params) => (params.value ? `Avg: ${params.value}` : ''),
                },
                {
                    field: 'metadata',
                    aggFunc: (params) => {
                        const values = params.values as Array<{ priority: number }>;
                        if (!values || values.length === 0) {
                            return null;
                        }

                        const minPriority = Math.min(...values.map((v) => v.priority));
                        return { minPriority };
                    },
                    valueFormatter: (params) =>
                        params.value ? `Min Priority: ${params.value.minPriority ?? '-'}` : '',
                },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            animateRows: false,
            grandTotalRow: 'top',
            groupTotalRow: 'bottom',
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'custom aggregation functions (raw)', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID scores:87.84 metadata:{"minPriority":null}
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null scores:87.84 metadata:{"minPriority":null}
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 category:"A" scores:[80,90,85] metadata:{"priority":1}
            │ ├── LEAF id:2 category:"A" scores:[75,88,92] metadata:{"priority":2}
            │ └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"A" scores:85 metadata:{"minPriority":1}
            └─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 category:"B" scores:[95,87,90] metadata:{"priority":1}
            · └─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"B" scores:90.67 metadata:{"minPriority":1}
        `);

        await new GridRows(api, 'custom aggregation functions (formatted)').check(`
            ROOT id:ROOT_NODE_ID scores:"Avg: 87.84" metadata:"Min Priority: NaN"
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " scores:"Avg: 87.84" metadata:"Min Priority: NaN"
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 category:"A" scores:"Avg: 80,90,85" metadata:"Min Priority: -"
            │ ├── LEAF id:2 category:"A" scores:"Avg: 75,88,92" metadata:"Min Priority: -"
            │ └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"Total A" scores:"Avg: 85" metadata:"Min Priority: 1"
            └─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 category:"B" scores:"Avg: 95,87,90" metadata:"Min Priority: -"
            · └─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"Total B" scores:"Avg: 90.67" metadata:"Min Priority: 1"
        `);

        applyTransactionChecked(api, {
            update: [{ id: '2', category: 'A', scores: [82, 94, 88], metadata: { priority: 3 } }],
            add: [{ id: '4', category: 'C', scores: [70, 74, 78], metadata: { priority: 2 } }],
        });

        await new GridRows(api, 'after transaction (raw)', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID scores:83.72 metadata:{"minPriority":null}
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null scores:83.72 metadata:{"minPriority":null}
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 category:"A" scores:[80,90,85] metadata:{"priority":1}
            │ ├── LEAF id:2 category:"A" scores:[82,94,88] metadata:{"priority":3}
            │ └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"A" scores:86.5 metadata:{"minPriority":1}
            ├─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:3 category:"B" scores:[95,87,90] metadata:{"priority":1}
            │ └─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"B" scores:90.67 metadata:{"minPriority":1}
            └─┬ LEAF_GROUP id:row-group-category-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:4 category:"C" scores:[70,74,78] metadata:{"priority":2}
            · └─ footer id:rowGroupFooter_row-group-category-C ag-Grid-AutoColumn:"C" scores:74 metadata:{"minPriority":2}
        `);

        await new GridRows(api, 'after transaction (formatted)').check(`
            ROOT id:ROOT_NODE_ID scores:"Avg: 83.72" metadata:"Min Priority: NaN"
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " scores:"Avg: 83.72" metadata:"Min Priority: NaN"
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 category:"A" scores:"Avg: 80,90,85" metadata:"Min Priority: -"
            │ ├── LEAF id:2 category:"A" scores:"Avg: 82,94,88" metadata:"Min Priority: -"
            │ └─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"Total A" scores:"Avg: 86.5" metadata:"Min Priority: 1"
            ├─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:3 category:"B" scores:"Avg: 95,87,90" metadata:"Min Priority: -"
            │ └─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"Total B" scores:"Avg: 90.67" metadata:"Min Priority: 1"
            └─┬ LEAF_GROUP id:row-group-category-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:4 category:"C" scores:"Avg: 70,74,78" metadata:"Min Priority: -"
            · └─ footer id:rowGroupFooter_row-group-category-C ag-Grid-AutoColumn:"Total C" scores:"Avg: 74" metadata:"Min Priority: 2"
        `);

        await new GridColumns(api, 'after transaction').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            ├── scores "Scores" width:200 aggFunc:custom
            └── metadata "Metadata" width:200 aggFunc:custom
        `);
    });

    test('custom aggFunc receives api and context in params', async () => {
        const myContext = { myKey: 'myContextValue' };
        const capturedParams: IAggFuncParams[] = [];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'value',
                    aggFunc: (params: IAggFuncParams) => {
                        capturedParams.push({ ...params });
                        return params.values.reduce((a: number, b: number) => a + b, 0);
                    },
                },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            groupDefaultExpanded: -1,
            context: myContext,
            rowData: [
                { id: '1', category: 'A', value: 10 },
                { id: '2', category: 'A', value: 20 },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `custom aggFunc receives api and context in params setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            └── value "Value" width:200 aggFunc:custom
        `);
        await new GridRows(api, `custom aggFunc receives api and context in params setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" value:30
            · ├── LEAF id:1 category:"A" value:10
            · └── LEAF id:2 category:"A" value:20
        `);

        expect(capturedParams.length).toBeGreaterThan(0);

        for (const params of capturedParams) {
            expect(params.api).toBe(api);
            expect(params.context).toBe(myContext);
            expect(params.rowNode).toBeDefined();
            expect(params.column).toBeDefined();
            expect(params.colDef).toBeDefined();
            expect(params.values).toBeDefined();
            expect(Array.isArray(params.values)).toBe(true);
        }
        await new GridRows(api, `custom aggFunc receives api and context in params final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" value:30
            · ├── LEAF id:1 category:"A" value:10
            · └── LEAF id:2 category:"A" value:20
        `);
    });

    test('grouping with mixed data types and null values in aggregation', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', category: 'A', amount: 100, quantity: null, active: true },
            { id: '2', category: 'A', amount: null, quantity: 50, active: false },
            { id: '3', category: 'A', amount: 200, quantity: 10, active: true },
            { id: '4', category: 'B', amount: 150, quantity: null, active: null },
            { id: '5', category: 'B', amount: 0, quantity: 0, active: false },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
                { field: 'quantity', aggFunc: 'avg' },
                { field: 'active', aggFunc: 'count' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            grandTotalRow: 'bottom',
            groupTotalRow: 'top',
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'mixed data types with nulls (unformatted)', {
            useFormatter: false,
        }).check(`
            ROOT id:ROOT_NODE_ID amount:450 quantity:{"count":3,"value":20} active:{"value":5}
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"A" amount:300 quantity:{"count":2,"value":30} active:{"value":3}
            │ ├── LEAF id:1 category:"A" amount:100 quantity:null active:true
            │ ├── LEAF id:2 category:"A" amount:null quantity:50 active:false
            │ └── LEAF id:3 category:"A" amount:200 quantity:10 active:true
            ├─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            │ ├─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"B" amount:150 quantity:{"count":1,"value":0} active:{"value":2}
            │ ├── LEAF id:4 category:"B" amount:150 quantity:null active:null
            │ └── LEAF id:5 category:"B" amount:0 quantity:0 active:false
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null amount:450 quantity:{"count":3,"value":20} active:{"value":5}
        `);

        await new GridRows(api, 'mixed data types with nulls (formatted)').check(`
            ROOT id:ROOT_NODE_ID amount:450 quantity:{"count":3,"value":20} active:{"value":5}
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├─ footer id:rowGroupFooter_row-group-category-A ag-Grid-AutoColumn:"Total A" amount:300 quantity:{"count":2,"value":30} active:{"value":3}
            │ ├── LEAF id:1 category:"A" amount:100 quantity:null active:true
            │ ├── LEAF id:2 category:"A" amount:null quantity:50 active:false
            │ └── LEAF id:3 category:"A" amount:200 quantity:10 active:true
            ├─┬ LEAF_GROUP id:row-group-category-B ag-Grid-AutoColumn:"B"
            │ ├─ footer id:rowGroupFooter_row-group-category-B ag-Grid-AutoColumn:"Total B" amount:150 quantity:{"count":1,"value":0} active:{"value":2}
            │ ├── LEAF id:4 category:"B" amount:150 quantity:null active:null
            │ └── LEAF id:5 category:"B" amount:0 quantity:0 active:false
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:450 quantity:{"count":3,"value":20} active:{"value":5}
        `);
    });

    test('the grand total row leaves an emptied grid, unless alwaysShowGrandTotalRow keeps it, and returns with its totals, inline or pinned', async () => {
        const rowData = [
            { id: '1', category: 'A', amount: 100 },
            { id: '2', category: 'B', amount: 50 },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            rowData,
            grandTotalRow: 'bottom',
            getRowId: (params) => params.data.id,
        });
        const exported = () => api.getDataAsCsv({ suppressQuotes: true });

        api.setGridOption('rowData', []);
        await new GridRows(api, 'bottom, emptied').check(`
            ROOT id:ROOT_NODE_ID amount:null
        `);
        expect(exported()).toBe('Group,sum(Amount)');
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.displayed).toBe(false);
        api.setGridOption('alwaysShowGrandTotalRow', true);
        await new GridRows(api, 'bottom, emptied, always').check(`
            ROOT id:ROOT_NODE_ID amount:null
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:null
        `);
        expect(exported()).toBe(['Group,sum(Amount)', 'Total ,'].join('\r\n'));
        api.setGridOption('alwaysShowGrandTotalRow', false);
        api.setGridOption('rowData', rowData);
        await new GridRows(api, 'bottom, rows back').check(`
            ROOT id:ROOT_NODE_ID amount:150
            ├─┬ LEAF_GROUP collapsed id:row-group-category-A ag-Grid-AutoColumn:"A" amount:100
            │ └── LEAF hidden id:1 category:"A" amount:100
            ├─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B" amount:50
            │ └── LEAF hidden id:2 category:"B" amount:50
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:150
        `);

        const bottomTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        api.setGridOption('grandTotalRow', undefined);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)).toBeUndefined();
        api.setGridOption('grandTotalRow', 'top');
        const topTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect(topTotal?.id).toBe(GRAND_TOTAL_ROW_ID);
        expect(topTotal).not.toBe(bottomTotal);
        api.setGridOption('rowData', []);
        await new GridRows(api, 'top, emptied').check(`
            ROOT id:ROOT_NODE_ID amount:null
        `);
        expect(exported()).toBe('Group,sum(Amount)');
        api.setGridOption('rowData', rowData);
        await new GridRows(api, 'top, rows back').check(`
            ROOT id:ROOT_NODE_ID amount:150
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:150
            ├─┬ LEAF_GROUP collapsed id:row-group-category-A ag-Grid-AutoColumn:"A" amount:100
            │ └── LEAF hidden id:1 category:"A" amount:100
            └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B" amount:50
            · └── LEAF hidden id:2 category:"B" amount:50
        `);
        // skeleton loading rows show no row, so not the grand total either
        const shown = exported();
        api.updateGridOptions({ loadingRows: { rowCount: 2 }, loading: true });
        expect(exported()).toBe(['Group,sum(Amount)', ' -> A,100', ',100', ' -> B,50', ',50'].join('\r\n'));
        api.setGridOption('loading', false);
        expect(exported()).toBe(shown);

        api.setGridOption('grandTotalRow', 'pinnedBottom');
        api.setGridOption('rowData', []);
        await new GridRows(api, 'pinnedBottom, emptied').check(`
            ROOT id:ROOT_NODE_ID amount:null
        `);
        api.setGridOption('rowData', rowData);
        await new GridRows(api, 'pinnedBottom, rows back').check(`
            ROOT id:ROOT_NODE_ID amount:150
            ├─┬ LEAF_GROUP collapsed id:row-group-category-A ag-Grid-AutoColumn:"A" amount:100
            │ └── LEAF hidden id:1 category:"A" amount:100
            └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B" amount:50
            · └── LEAF hidden id:2 category:"B" amount:50
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:150
        `);

        const createdEmpty = gridsManager.createGrid('createdEmpty', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            rowData: [],
            grandTotalRow: 'bottom',
            alwaysShowGrandTotalRow: true,
        });
        await new GridRows(createdEmpty, 'bottom, created empty, always').check(`
            ROOT id:ROOT_NODE_ID amount:null
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " amount:null
        `);

        const createdWithoutRowData = gridsManager.createGrid('createdWithoutRowData', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            loading: false,
            grandTotalRow: 'bottom',
            alwaysShowGrandTotalRow: true,
        });
        // no row data yet, so nothing to total: a refresh such as a sort adds no grand total row either
        createdWithoutRowData.applyColumnState({ state: [{ colId: 'amount', sort: 'asc' }] });
        expect(createdWithoutRowData.getDisplayedRowCount()).toBe(0);
        createdWithoutRowData.setGridOption('rowData', []);
        expect(createdWithoutRowData.getDisplayedRowAtIndex(0)?.id).toBe(GRAND_TOTAL_ROW_ID);

        const fedByTransactions = gridsManager.createGrid('fedByTransactions', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            loading: false,
            grandTotalRow: 'bottom',
            alwaysShowGrandTotalRow: true,
        });
        // rows given by transactions are row data too, so the row stays once they are removed
        const added = { category: 'A', amount: 1 };
        applyTransactionChecked(fedByTransactions, { add: [added] });
        applyTransactionChecked(fedByTransactions, { remove: [added] });
        expect(fedByTransactions.getDisplayedRowAtIndex(0)?.id).toBe(GRAND_TOTAL_ROW_ID);
    });

    test.each(['top', 'bottom', 'pinnedTop', 'pinnedBottom'] as const)(
        'with alwaysShowGrandTotalRow a `%s` grand total stays while no row is shown',
        async (grandTotalRow) => {
            const rowData = [
                { id: '1', category: 'A', amount: 100 },
                { id: '2', category: 'B', amount: 50 },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'category', rowGroup: true, hide: true, filter: 'agTextColumnFilter' },
                    { field: 'amount', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                rowData,
                grandTotalRow,
                alwaysShowGrandTotalRow: true,
                getRowId: (params) => params.data.id,
            });
            const pinned = grandTotalRow === 'pinnedTop' || grandTotalRow === 'pinnedBottom';
            const overlay = () => {
                const eGrid = getGridElement(api)!;
                if (eGrid.querySelector('.ag-overlay-no-matching-rows-center')) {
                    return 'noMatchingRows';
                }
                return eGrid.querySelector('.ag-overlay-no-rows-center') ? 'noRows' : null;
            };
            const expectGrandTotal = async (
                rowIds: string[],
                amount: number | null | undefined,
                expectedOverlay: 'noRows' | 'noMatchingRows' | null
            ) => {
                const shown = amount === undefined ? 0 : 1;
                const pinnedTotal = grandTotalRow === 'pinnedTop' ? api.getPinnedTopRow(0) : api.getPinnedBottomRow(0);
                const grandTotal = pinned ? pinnedTotal : api.getRowNode(GRAND_TOTAL_ROW_ID);
                expect(grandTotal?.displayed ? grandTotal.aggData?.amount : undefined).toBe(amount);
                const inlineTotal = pinned || !shown ? [] : [GRAND_TOTAL_ROW_ID];
                const ids: (string | undefined)[] = [];
                for (let i = 0, count = api.getDisplayedRowCount(); i < count; ++i) {
                    ids.push(api.getDisplayedRowAtIndex(i)?.id);
                }
                expect(ids).toEqual(
                    grandTotalRow === 'top' ? [...inlineTotal, ...rowIds] : [...rowIds, ...inlineTotal]
                );
                expect(api.getPinnedTopRowCount() + api.getPinnedBottomRowCount()).toBe(pinned ? shown : 0);
                await waitFor(() => expect(overlay()).toBe(expectedOverlay));
                const renderedGrandTotal = () =>
                    getGridElement(api)!.querySelectorAll('.ag-row[row-id$="rowGroupFooter_ROOT_NODE_ID"]').length;
                await waitFor(() => expect(renderedGrandTotal() > 0).toBe(shown === 1));
            };
            const groupIds = ['row-group-category-A', 'row-group-category-B'];
            await expectGrandTotal(groupIds, 150, null);

            api.setFilterModel({ amount: { type: 'greaterThan', filter: 60 } });
            await expectGrandTotal(['row-group-category-A'], 100, null);

            api.setFilterModel({ amount: { type: 'greaterThan', filter: 1000 } });
            await expectGrandTotal([], null, 'noMatchingRows');

            api.setGridOption('alwaysShowGrandTotalRow', false);
            await expectGrandTotal([], undefined, 'noMatchingRows');
            api.setGridOption('alwaysShowGrandTotalRow', true);
            await expectGrandTotal([], null, 'noMatchingRows');
            api.setGridOption('suppressAggFilteredOnly', true);
            await expectGrandTotal([], 150, 'noMatchingRows');
            api.setGridOption('suppressAggFilteredOnly', false);
            // a group column filter removes leaf rows even under groupAggFiltering, which then totals them
            api.setFilterModel({ category: { type: 'equals', filter: 'none' } });
            await expectGrandTotal([], null, 'noMatchingRows');
            api.setGridOption('groupAggFiltering', true);
            await expectGrandTotal([], 150, 'noMatchingRows');
            api.setGridOption('groupAggFiltering', false);

            api.setFilterModel(null);
            await expectGrandTotal(groupIds, 150, null);

            // rows a callback hides, with no filter, are not "no matching rows"
            api.setGridOption('postSortRows', (params) => {
                params.nodes.length = 0;
            });
            await expectGrandTotal([], 150, null);
            api.setGridOption('postSortRows', undefined);

            api.setGridOption('rowData', []);
            await expectGrandTotal([], null, 'noRows');
        }
    );

    test('alwaysShowGrandTotalRow does not warn while grandTotalRow is unset or turned off', () => {
        const warn = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'amount', aggFunc: 'sum' }],
                rowData: [],
                alwaysShowGrandTotalRow: true,
            });
            api.setGridOption('grandTotalRow', 'bottom');
            api.setGridOption('grandTotalRow', undefined);
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });

    test('cross-column valueGetter dependencies during aggregation', async () => {
        // Column 'total' uses a valueGetter that reads 'price' and 'qty' via params.getValue().
        // This verifies that aggregation correctly handles valueGetters with cross-column
        // dependencies — getValue must resolve the other column's value for the same row,
        // including when intermediate group nodes propagate aggregated values upward.
        const rowData = cachedJSONObjects.array([
            { id: '1', region: 'EU', category: 'A', price: 10, qty: 3 },
            { id: '2', region: 'EU', category: 'A', price: 20, qty: 2 },
            { id: '3', region: 'EU', category: 'B', price: 15, qty: 4 },
            { id: '4', region: 'US', category: 'A', price: 25, qty: 1 },
            { id: '5', region: 'US', category: 'B', price: 30, qty: 2 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'category', rowGroup: true, hide: true },
                { field: 'price', aggFunc: 'sum' },
                { field: 'qty', aggFunc: 'sum' },
                {
                    colId: 'total',
                    headerName: 'Total',
                    valueGetter: (params) => {
                        const price = params.getValue('price');
                        const qty = params.getValue('qty');
                        return (price ?? 0) * (qty ?? 0);
                    },
                    aggFunc: 'sum',
                },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Leaf totals: 10*3=30, 20*2=40, 15*4=60, 25*1=25, 30*2=60
        // EU/A: sum(30,40)=70. EU/B: sum(60)=60. EU: sum(70,60)=130
        // US/A: sum(25)=25. US/B: sum(60)=60. US: sum(25,60)=85
        await new GridRows(api, 'initial', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU" price:45 qty:9 total:130
            │ ├─┬ LEAF_GROUP id:row-group-region-EU-category-A ag-Grid-AutoColumn:"A" price:30 qty:5 total:70
            │ │ ├── LEAF id:1 region:"EU" category:"A" price:10 qty:3 total:30
            │ │ └── LEAF id:2 region:"EU" category:"A" price:20 qty:2 total:40
            │ └─┬ LEAF_GROUP id:row-group-region-EU-category-B ag-Grid-AutoColumn:"B" price:15 qty:4 total:60
            │ · └── LEAF id:3 region:"EU" category:"B" price:15 qty:4 total:60
            └─┬ filler id:row-group-region-US ag-Grid-AutoColumn:"US" price:55 qty:3 total:85
            · ├─┬ LEAF_GROUP id:row-group-region-US-category-A ag-Grid-AutoColumn:"A" price:25 qty:1 total:25
            · │ └── LEAF id:4 region:"US" category:"A" price:25 qty:1 total:25
            · └─┬ LEAF_GROUP id:row-group-region-US-category-B ag-Grid-AutoColumn:"B" price:30 qty:2 total:60
            · · └── LEAF id:5 region:"US" category:"B" price:30 qty:2 total:60
        `);

        applyTransactionChecked(api, {
            update: [{ id: '1', region: 'EU', category: 'A', price: 100, qty: 5 }],
        });

        // EU/A: sum(100*5=500, 40)=540. EU: sum(540,60)=600
        await new GridRows(api, 'after transaction', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID total:0
            ├─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU" price:135 qty:11 total:600
            │ ├─┬ LEAF_GROUP id:row-group-region-EU-category-A ag-Grid-AutoColumn:"A" price:120 qty:7 total:540
            │ │ ├── LEAF id:1 region:"EU" category:"A" price:100 qty:5 total:500
            │ │ └── LEAF id:2 region:"EU" category:"A" price:20 qty:2 total:40
            │ └─┬ LEAF_GROUP id:row-group-region-EU-category-B ag-Grid-AutoColumn:"B" price:15 qty:4 total:60
            │ · └── LEAF id:3 region:"EU" category:"B" price:15 qty:4 total:60
            └─┬ filler id:row-group-region-US ag-Grid-AutoColumn:"US" price:55 qty:3 total:85
            · ├─┬ LEAF_GROUP id:row-group-region-US-category-A ag-Grid-AutoColumn:"A" price:25 qty:1 total:25
            · │ └── LEAF id:4 region:"US" category:"A" price:25 qty:1 total:25
            · └─┬ LEAF_GROUP id:row-group-region-US-category-B ag-Grid-AutoColumn:"B" price:30 qty:2 total:60
            · · └── LEAF id:5 region:"US" category:"B" price:30 qty:2 total:60
        `);
    });

    test('a group total row turned off and on again takes the height getRowHeight gives it, not its group', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'v' }],
            rowData: [
                { g: 'a', v: 1 },
                { g: 'a', v: 2 },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            getRowHeight: ({ node }) => (node.footer ? (node.sibling ? 30 : 99) : 50),
        });
        expect(api.getDisplayedRowAtIndex(3)!.rowHeight).toBe(30);

        api.setGridOption('groupTotalRow', undefined);
        expect(api.getDisplayedRowCount()).toBe(3);
        api.setGridOption('groupTotalRow', 'bottom');

        const total = api.getDisplayedRowAtIndex(3)!;
        expect(total.footer).toBe(true);
        expect(total.rowHeight).toBe(30);
        expect(total.rowTop).toBe(150);
        expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(50);
    });

    test('a group total row turned on after its group was sized with setRowHeight asks getRowHeight', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'v' }],
            rowData: [
                { g: 'a', v: 1 },
                { g: 'a', v: 2 },
            ],
            groupDefaultExpanded: -1,
            getRowHeight: ({ node }) => (node.footer ? 30 : 50),
        });
        const group = api.getDisplayedRowAtIndex(0)!;
        group.setRowHeight(80);
        api.onRowHeightChanged();

        api.setGridOption('groupTotalRow', 'bottom');

        const total = api.getDisplayedRowAtIndex(3)!;
        expect(total.footer).toBe(true);
        expect(total.rowHeight).toBe(30);
        expect(total.rowTop).toBe(180);
        expect(group.rowHeight).toBe(80);
    });

    test('group total rows built with the grid are asked their height by the row model, not before', () => {
        let callsBeforePositioned = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'v' }],
            rowData: Array.from({ length: 300 }, (_, i) => ({ g: 'g' + i, v: i })),
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            getRowHeight: ({ node }) => {
                // The model estimates rows out of view, so an early call is one it would not have made.
                if (node.footer && node.rowIndex == null) {
                    ++callsBeforePositioned;
                }
                return node.footer ? 30 : 50;
            },
        });

        expect(api.getDisplayedRowAtIndex(2)!.rowHeight).toBe(30);
        expect(callsBeforePositioned).toBe(0);
    });
});

describe('alwaysShowGrandTotalRow without the row grouping modules', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('reports the missing module', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
        const error = vitest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'amount' }],
                rowData: [],
                alwaysShowGrandTotalRow: true,
            });
            await waitFor(() => {
                const logged = error.mock.calls.flat().join(' ');
                expect(logged).toContain('error #200');
                expect(logged).toContain('`alwaysShowGrandTotalRow`');
            });
        } finally {
            error.mockRestore();
        }
    });
});
