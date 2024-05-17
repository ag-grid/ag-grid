import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// specify the columns
const columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

// specify the data
var rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
];

let gridApi: GridApi;

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
    alwaysShowHorizontalScroll: true,
    alwaysShowVerticalScroll: true,
    columnDefs: columnDefs,
    rowData: rowData,
    defaultColDef: {
        editable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
    },
};

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(eGridDiv, gridOptions);
});
