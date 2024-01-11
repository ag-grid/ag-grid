import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi;

// Provided React-only example
const gridOptions: GridOptions = {
  columnDefs: [{
    field: 'value'
  }],
  rowData: [{ value: 'test' }],
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
