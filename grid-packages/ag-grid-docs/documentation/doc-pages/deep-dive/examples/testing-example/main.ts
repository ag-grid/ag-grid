import { createGrid, GridApi, GridOptions, SelectionChangedEvent, CellValueChangedEvent } from '@ag-grid-community/core';

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
        { checkboxSelection: true },
        { field: 'make' },
        { field: 'model' },
        { field: 'price', resizable: false }
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
    rowSelection: 'multiple',
    onSelectionChanged: (event: SelectionChangedEvent) => { 
        console.log('New Row Selected!')
    },
    onCellValueChanged: (event: CellValueChangedEvent) => { 
        console.log(`New Cell Value: ${event.value}`)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    gridApi.sizeColumnsToFit();
    fetch('https://www.ag-grid.com/example-assets/row-data.json')
        .then(response => response.json())
        .then((data: any) => gridApi.updateGridOption('rowData', data))
})