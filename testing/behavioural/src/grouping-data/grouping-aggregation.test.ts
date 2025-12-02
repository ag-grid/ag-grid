import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
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

        const gridRowsOptionsFormatted: GridRowsOptions = {
            columns: ['sport', 'gold', 'silver'],
        };

        const gridRowsOptionsUnformatted: GridRowsOptions = {
            ...gridRowsOptionsFormatted,
            useFormatter: false,
        };

        await new GridRows(api, 'initial', gridRowsOptionsFormatted).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ ├── LEAF id:1 sport:"Sailing" gold:1 silver:2
            │ ├── LEAF id:2 sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland gold:4 silver:{"count":3,"value":2}
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:4 sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy gold:5 silver:{"count":2,"value":1.5}
            └─┬ LEAF_GROUP id:row-group-country-France
            · ├── LEAF id:6 sport:"Tennis" gold:1 silver:1
            · ├── LEAF id:7 sport:"Soccer" gold:2 silver:3
            · └─ footer id:rowGroupFooter_row-group-country-France gold:3 silver:{"count":2,"value":2}
        `);

        applyTransactionChecked(api, {
            update: [{ id: '1', country: 'Ireland', sport: 'Swimming', gold: 12, silver: 7 }],
            add: [
                { id: '8', country: 'United Kingdom', sport: 'Rowing', gold: 4, silver: 4 },
                { id: '9', country: 'United Kingdom', sport: 'Athletics', gold: 5, silver: 3 },
            ],
        });

        await new GridRows(api, 'after update', gridRowsOptionsFormatted).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ ├── LEAF id:1 sport:"Swimming" gold:12 silver:7
            │ ├── LEAF id:2 sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland gold:15 silver:{"count":3,"value":3.6666666666666665}
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:4 sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy gold:5 silver:{"count":2,"value":1.5}
            ├─┬ LEAF_GROUP id:row-group-country-France
            │ ├── LEAF id:6 sport:"Tennis" gold:1 silver:1
            │ ├── LEAF id:7 sport:"Soccer" gold:2 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-France gold:3 silver:{"count":2,"value":2}
            └─┬ LEAF_GROUP id:"row-group-country-United Kingdom"
            · ├── LEAF id:8 sport:"Rowing" gold:4 silver:4
            · ├── LEAF id:9 sport:"Athletics" gold:5 silver:3
            · └─ footer id:"rowGroupFooter_row-group-country-United Kingdom" gold:9 silver:{"count":2,"value":3.5}
        `);

        await new GridRows(api, 'after update', gridRowsOptionsUnformatted).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ ├── LEAF id:1 sport:"Swimming" gold:12 silver:7
            │ ├── LEAF id:2 sport:"Soccer" gold:2 silver:1
            │ ├── LEAF id:3 sport:"Football" gold:1 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland gold:15 silver:{"count":3,"value":3.6666666666666665}
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:4 sport:"Soccer" gold:3 silver:1
            │ ├── LEAF id:5 sport:"Football" gold:2 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Italy gold:5 silver:{"count":2,"value":1.5}
            ├─┬ LEAF_GROUP id:row-group-country-France
            │ ├── LEAF id:6 sport:"Tennis" gold:1 silver:1
            │ ├── LEAF id:7 sport:"Soccer" gold:2 silver:3
            │ └─ footer id:rowGroupFooter_row-group-country-France gold:3 silver:{"count":2,"value":2}
            └─┬ LEAF_GROUP id:"row-group-country-United Kingdom"
            · ├── LEAF id:8 sport:"Rowing" gold:4 silver:4
            · ├── LEAF id:9 sport:"Athletics" gold:5 silver:3
            · └─ footer id:"rowGroupFooter_row-group-country-United Kingdom" gold:9 silver:{"count":2,"value":3.5}
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

        await new GridRows(api, 'custom aggregation functions (raw)', {
            columns: ['scores', 'metadata'],
            useFormatter: false,
        }).check(`
            ROOT id:ROOT_NODE_ID scores:87.84 metadata:{"minPriority":null}
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID scores:87.84 metadata:{"minPriority":null}
            ├─┬ LEAF_GROUP id:row-group-category-A
            │ ├── LEAF id:1 scores:[80,90,85] metadata:{"priority":1}
            │ ├── LEAF id:2 scores:[75,88,92] metadata:{"priority":2}
            │ └─ footer id:rowGroupFooter_row-group-category-A scores:85 metadata:{"minPriority":1}
            └─┬ LEAF_GROUP id:row-group-category-B
            · ├── LEAF id:3 scores:[95,87,90] metadata:{"priority":1}
            · └─ footer id:rowGroupFooter_row-group-category-B scores:90.67 metadata:{"minPriority":1}
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

        await new GridRows(api, 'after transaction (raw)', {
            columns: ['scores', 'metadata'],
            useFormatter: false,
        }).check(`
            ROOT id:ROOT_NODE_ID scores:83.72 metadata:{"minPriority":null}
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID scores:83.72 metadata:{"minPriority":null}
            ├─┬ LEAF_GROUP id:row-group-category-A
            │ ├── LEAF id:1 scores:[80,90,85] metadata:{"priority":1}
            │ ├── LEAF id:2 scores:[82,94,88] metadata:{"priority":3}
            │ └─ footer id:rowGroupFooter_row-group-category-A scores:86.5 metadata:{"minPriority":1}
            ├─┬ LEAF_GROUP id:row-group-category-B
            │ ├── LEAF id:3 scores:[95,87,90] metadata:{"priority":1}
            │ └─ footer id:rowGroupFooter_row-group-category-B scores:90.67 metadata:{"minPriority":1}
            └─┬ LEAF_GROUP id:row-group-category-C
            · ├── LEAF id:4 scores:[70,74,78] metadata:{"priority":2}
            · └─ footer id:rowGroupFooter_row-group-category-C scores:74 metadata:{"minPriority":2}
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
});
