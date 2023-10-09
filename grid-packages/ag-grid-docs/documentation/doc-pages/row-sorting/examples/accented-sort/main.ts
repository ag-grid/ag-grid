import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [{ field: 'accented', width: 150 }]

let api: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
  },
  columnDefs: columnDefs,
  animateRows: true,
  sortingOrder: ['desc', 'asc', null],
  accentedSort: true,
  rowData: [{ accented: 'aáàä' }, { accented: 'aàáä' }, { accented: 'aäàá' }],
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;
})
