import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

var rowData = [
  { a: 1, b: 1, c: 1, d: 1, e: 1 },
  { a: 2, b: 2, c: 2, d: 2, e: 2 },
]

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'a' },
    { field: 'b' },
    { field: 'c' },
    { field: 'd' },
    { field: 'e' },
  ],
  rowData: rowData,
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
