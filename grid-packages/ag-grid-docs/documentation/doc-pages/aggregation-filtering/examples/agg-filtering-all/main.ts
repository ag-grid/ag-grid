import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'athlete', hide: true },
    { field: 'year' },
    { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  ],
  defaultColDef: {
    flex: 1,
    filter: true,
    floatingFilter: true,
  },
  autoGroupColumnDef: {
    field: 'athlete',
  },
  groupDefaultExpanded: -1,
  groupAggFiltering: true,
  rowData: getData(),
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
