import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi;

const rowData = [
    { agg: 1, pivotValue: 6 },
    { agg: 1, pivotValue: 1 },
    { agg: 1, pivotValue: 3 },
    { agg: 1, pivotValue: 2 },
    { agg: 1, pivotValue: 5 },
    { agg: 1, pivotValue: 4 },
];
let count = 0;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'pivotValue', pivot: true },
        { field: 'agg', aggFunc: 'sum', rowGroup: true },
    ],
    defaultColDef: {
        width: 130,
    },
    autoGroupColumnDef: {
        minWidth: 100,
    },
    pivotMode: true,
    getRowId: (p) => String(p.data.pivotValue),

    onGridReady: () => {
        setInterval(() => {
            count += 1;
            gridApi.setGridOption('rowData', rowData.slice(0, (count % rowData.length) + 1));
        }, 1000);
    },
};

function toggleOption() {
    const isChecked = document.querySelector<HTMLInputElement>('#enableStrictPivotColumnOrder')!.checked;
    gridApi.setGridOption('enableStrictPivotColumnOrder', isChecked);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
