import { createGrid, GridApi, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi;

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" }
    ],
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
})