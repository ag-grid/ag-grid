import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    QuickFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { PivotModule, ToolbarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([QuickFilterModule, ToolbarModule, ClientSideRowModelModule, PivotModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country', rowGroup: true },
        { field: 'sport' },
        { field: 'year', pivot: true },
        { field: 'age' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    toolbar: {
        items: ['agQuickFilterToolbarItem'],
    },
};

let applyBeforePivotOrAgg = false;

function onApplyBeforePivotOrAgg() {
    applyBeforePivotOrAgg = !applyBeforePivotOrAgg;
    gridApi!.setGridOption('applyQuickFilterBeforePivotOrAgg', applyBeforePivotOrAgg);
    document.querySelector('#applyBeforePivotOrAgg')!.textContent =
        `Apply ${applyBeforePivotOrAgg ? 'After' : 'Before'} Pivot/Aggregation`;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
