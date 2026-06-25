import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ShowValuesAsModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

interface SaleRow {
    id: string;
    country: string;
    amount: number;
}

describe('showValuesAs displayed values (GridRows + GridColumns snapshots)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule, PivotModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('flat grid — percentOfGrandTotal', async () => {
        const api = gridsManager.createGrid('flat', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'A', amount: 25 },
                { id: '3', country: 'B', amount: 50 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'flat percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'flat percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            ├── LEAF id:2 country:"A" amount:"25.00%"
            └── LEAF id:3 country:"B" amount:"50.00%"
        `);
    });

    test('row grouping — percentOfGrandTotal across groups and leaves', async () => {
        const api = gridsManager.createGrid('grouped-grand', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'grouped percentOfGrandTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'grouped percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);
    });

    test('row grouping — percentOfParentRowTotal (relative to immediate parent)', async () => {
        const api = gridsManager.createGrid('grouped-parent', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'grouped percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'grouped percentOfParentRowTotal').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('tree data — percentOfParentRowTotal', async () => {
        const api = gridsManager.createGrid('tree-parent', {
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }],
            treeData: true,
            groupDefaultExpanded: -1,
            getDataPath: (data: { path: string[] }) => data.path,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: 'a', path: ['A', 'a'], amount: 30 },
                { id: 'b', path: ['A', 'b'], amount: 10 },
                { id: 'c', path: ['C'], amount: 60 },
            ],
        });

        await new GridColumns(api, 'tree percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'tree percentOfParentRowTotal').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── a LEAF id:a ag-Grid-AutoColumn:"a" amount:"75.00%"
            │ └── b LEAF id:b ag-Grid-AutoColumn:"b" amount:"25.00%"
            └── C LEAF id:c ag-Grid-AutoColumn:"C" amount:"60.00%"
        `);
    });

    test('parent mode on a flat grid is dormant — built-in formatter shows #N/A', async () => {
        const api = gridsManager.createGrid('flat-dormant', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        // GridColumns still records the selected mode; the dormant built-in mode displays #N/A (value stays raw).
        await new GridColumns(api, 'flat dormant parent mode').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'flat dormant parent mode').check(`
            ROOT id:ROOT_NODE_ID amount:"#N/A"
            ├── LEAF id:1 country:"A" amount:"#N/A"
            └── LEAF id:2 country:"B" amount:"#N/A"
        `);
    });

    test('pivot — percentOfColumnTotal (each pivot column totals to 100%)', async () => {
        const api = gridsManager.createGrid('pivot-column-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfColumnTotal' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', year: 2020, amount: 1000 },
                { id: '2', country: 'B', year: 2020, amount: 3000 },
                { id: '3', country: 'A', year: 2021, amount: 2000 },
                { id: '4', country: 'B', year: 2021, amount: 2000 },
            ],
        });

        // 2020 column total 4000 → A 25% / B 75%; 2021 total 4000 → 50% / 50%; root = 100% per column.
        await new GridColumns(api, 'pivot percentOfColumnTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_amount "Amount" width:200 %:percentOfColumnTotal columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_amount "Amount" width:200 %:percentOfColumnTotal columnGroupShow:open
        `);
        await new GridRows(api, 'pivot percentOfColumnTotal', {
            forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_amount', 'pivot_year_2021_amount'],
            printHiddenRows: false,
        }).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_amount:"100.00%" pivot_year_2021_amount:"100.00%"
            ├── LEAF_GROUP collapsed id:row-group-country-A ag-Grid-AutoColumn:"A" pivot_year_2020_amount:"25.00%" pivot_year_2021_amount:"50.00%"
            └── LEAF_GROUP collapsed id:row-group-country-B ag-Grid-AutoColumn:"B" pivot_year_2020_amount:"75.00%" pivot_year_2021_amount:"50.00%"
        `);
    });
});
