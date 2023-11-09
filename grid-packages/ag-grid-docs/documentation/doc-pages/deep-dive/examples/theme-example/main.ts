import { createGrid, GridApi, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi;

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
        {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
        {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
        {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        { field: "mission" },
        { field: "country" },
        { field: "successful" },
        { field: "date" },
        { field: "price" },
        { field: "company" }
    ],
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
})