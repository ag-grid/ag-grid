import { createGrid, GridApi, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi;

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        { field: 'make', resizable: false },
        { field: 'model' },
        { field: 'price' }
    ],
    // Configurations applied to all columns
    defaultColDef: {
        filter: true,
        sortable: true,
        editable: true,
        resizable: true
    },
    // Grid Options & Callbacks
    pagination: true,
    onCellValueChanged: (event) => { 
        console.log(`New Cell Value: ${event.value}`)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    gridApi.sizeColumnsToFit();
    fetch('https://www.ag-grid.com/example-assets/row-data.json')
        .then(response => response.json())
        .then((data: any) => gridApi.updateGridOption('rowData', data))
})