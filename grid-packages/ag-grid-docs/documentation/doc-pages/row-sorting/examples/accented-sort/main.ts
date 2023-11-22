import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [{ field: 'accented', width: 150 }]

let gridApi: GridApi;

const gridOptions: GridOptions = {

  columnDefs: columnDefs,
  sortingOrder: ['desc', 'asc', null],
  accentedSort: true,
  rowData: [{ accented: 'aáàä' }, { accented: 'aàáä' }, { accented: 'aäàá' }],
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
