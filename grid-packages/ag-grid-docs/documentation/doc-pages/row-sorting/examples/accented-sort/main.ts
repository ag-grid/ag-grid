import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [{ field: 'accented', width: 150 }]

const gridOptions: GridOptions = {

  columnDefs: columnDefs,
  sortingOrder: ['desc', 'asc', null],
  accentedSort: true,
  rowData: [{ accented: 'aáàä' }, { accented: 'aàáä' }, { accented: 'aäàá' }],
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
